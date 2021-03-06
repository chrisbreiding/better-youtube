import { observable } from 'mobx'
import moment from 'moment'

class VideoModel {
  @observable duration
  @observable id
  @observable channelId
  @observable.ref published = null
  @observable description
  @observable order
  @observable thumb
  @observable title

  constructor (props) {
    this.duration = props.duration
    this.id = props.id
    this.channelId = props.channelId
    this.published = moment(props.published)
    this.description = props.description
    this.order = props.order
    this.thumb = props.thumb
    this.title = props.title
  }

  update ({ order }) {
    this.order = order
  }
}

export default VideoModel
