import cs from 'classnames'
import { inject, observer } from 'mobx-react'
import React, { Component } from 'react'
import DocumentTitle from 'react-document-title'

import appState from '../app/app-state'
import { icon, parseQueryString, updatedLink } from '../lib/util'
import subsStore from '../subs/subs-store'
import videosStore from '../videos/videos-store'

import Paginator from '../paginator/paginator'
import Search from '../search/search'
import Videos from '../videos/videos'

@inject('router')
@observer
class Sub extends Component {
  componentDidMount () {
    this._getVideos()
    this.previousLoadingValue = videosStore.isLoading
  }

  componentDidUpdate () {
    this._getVideos()

    const marker = this._getQuery().marker

    if (marker && this._finishedLoadingVideos()) {
      this._scrollToMarker(marker)
    }

    this.previousLoadingValue = videosStore.isLoading
  }

  _finishedLoadingVideos () {
    return this.previousLoadingValue === true && videosStore.isLoading === false
  }

  _scrollToMarker (marker) {
    document.querySelector(`#${marker}`)?.scrollIntoView()
  }

  _getVideos () {
    if (videosStore.isLoading) return

    const sub = this._getSub()

    const oldSearchQuery = this.searchQuery
    const newSearchQuery = this._getSearchQuery()
    this.searchQuery = newSearchQuery

    const oldToken = this.pageToken
    const newToken = this._getPageToken()
    this.pageToken = newToken

    const oldPlaylistId = this.playlistId
    const newPlaylistId = sub && sub.playlistId
    this.playlistId = newPlaylistId

    if (this._shouldLoadAllPlaylists(sub, oldPlaylistId, newPlaylistId)) {
      this._isAllSubs = true
      videosStore.getVideosDataForAllPlaylists(subsStore.channelIds)

      return
    }

    if (
      oldPlaylistId !== newPlaylistId
      || oldToken !== newToken
      || oldSearchQuery !== newSearchQuery
    ) {
      this._isAllSubs = false

      if (newSearchQuery) {
        videosStore.getVideosDataForChannelSearch(sub, newSearchQuery, newToken)
      } else if (sub.isCustom) {
        videosStore.getVideosDataForCustomPlaylist(sub)
      } else {
        videosStore.getVideosDataForPlaylist(newPlaylistId, newToken)
      }
    }
  }

  _getSub () {
    return subsStore.getSubById(this.props.match.params.id)
  }

  _getQuery () {
    return parseQueryString(this.props.location.search)
  }

  _getPageToken () {
    return this._getQuery().pageToken
  }

  _getSearchQuery () {
    return this._getQuery().search
  }

  _isAllSubs () {
    return !this.props.match.params.id
  }

  _shouldLoadAllPlaylists (sub, oldPlaylistId, newPlaylistId) {
    if (sub) return false
    if (oldPlaylistId && !newPlaylistId) return true
    if (videosStore.hasLoadedAllPlaylists) return false

    return true
  }

  render () {
    const sub = this._getSub()

    if (!subsStore.subs.length) return null

    const { isLoading, prevPageToken, nextPageToken } = videosStore
    const nowPlaying = this._getQuery().nowPlaying

    return (
      <main className='videos'>
        {!nowPlaying && (
          <DocumentTitle title={`${sub?.title || 'All Subs'} | Videos`} />
        )}
        <Paginator
          location={this.props.location}
          prevPageToken={prevPageToken}
          nextPageToken={nextPageToken}
        >
          {this._search(sub)}
          {this._bookmark(sub)}
        </Paginator>
        {isLoading ? this._loader() : this._videos(sub)}
        <Paginator
          location={this.props.location}
          prevPageToken={prevPageToken}
          nextPageToken={nextPageToken}
        />
      </main>
    )
  }

  _search (sub) {
    if (!sub || sub.isCustom) return null

    return (
      <Search
        query={this._getSearchQuery()}
        onSearch={this._onSearchUpdate}
      />
    )
  }

  _bookmark (sub) {
    if (!sub || !this.pageToken) return null

    return (
      <button
        className={cs('bookmark', { 'is-bookmarked': this._isPageBookMarked(sub) })}
        onClick={this._updateBookmark(sub)}
      >
        {icon('bookmark')}
      </button>
    )
  }

  _isPageBookMarked (sub) {
    return sub.bookmarkedPageToken === this.pageToken
  }

  _videos (sub) {
    if (!videosStore.videos.length) {
      return (
        <div className='videos-empty'>
          {icon('film')}
          No videos
          {icon('film')}
        </div>
      )
    }

    const isCustom = sub?.isCustom || false

    return (
      <Videos
        showChannelImage={this._isAllSubs || isCustom}
        isCustom={isCustom}
        location={this.props.location}
        markedVideoId={this._getMarkedVideoId(sub)}
        onPlay={this._playVideo}
        onRemoveMark={this._removeVideoMark}
        onSortStart={this._onSortStart}
        onSortEnd={this._onSortEnd}
        onUpdateVideoMarkerLink={this._updateVideoMarkerLink}
      />
    )
  }

  _getMarkedVideoId (sub) {
    if (this._isAllSubs) return appState.allSubsMarkedVideoId

    return sub ? sub.markedVideoId : null
  }

  _loader () {
    return (
      <div className='loader'>
        {icon('spin fa-play-circle')}
        {icon('spin fa-play-circle')}
        {icon('spin fa-play-circle')}
      </div>
    )
  }

  _updateBookmark = (sub) => () => {
    const bookmarkedPageToken = this._isPageBookMarked(sub) ? null : this.pageToken
    sub.update({ bookmarkedPageToken })
    subsStore.save()
  }

  _playVideo = (id) => {
    this._updateVideoMark(id)
  }

  _removeVideoMark = () => {
    this._updateVideoMark()
    this._updateVideoMarkerLink()
  }

  _updateVideoMarkerLink = (marker) => {
    this.props.router.replace(updatedLink(this.props.location, {
      search: { marker },
    }))
    this._scrollToMarker(marker)
  }

  _updateVideoMark (id) {
    const sub = this._getSub()

    if (this._isAllSubs) {
      appState.setAllSubsMarkedVideoId(id)
    } else if (sub) {
      subsStore.update(sub.id, { markedVideoId: id })
    }
  }

  _onSortStart = () => {
    appState.setSorting(true)
  }

  _onSortEnd = (sortProps) => {
    appState.setSorting(false)
    const changed = videosStore.sort(sortProps)

    if (changed) {
      subsStore.updatePlaylistVideosOrder(this.props.match.params.id, videosStore.videos)
      subsStore.save()
    }
  }

  _onSearchUpdate = (searchTerm) => {
    this.props.router.push(updatedLink(this.props.location, {
      search: {
        search: searchTerm || undefined,
        pageToken: undefined,
      },
    }))
  }
}

export default Sub
