define ['backbone', 'handlebars'
'videos/video-view', 'videos/video-collection'],
(Backbone, Handlebars, \
VideoView, videos) ->

  class VideoView extends Backbone.View

    el: '#videos-region'

    $videos: $ '#videos'

    initialize: ->
      videos.on 'add', @addOne
      videos.on 'reset', @addAll

    addOne: (video) =>
      view = new VideoView model: video
      @$videos.append view.render().el

    addAll: =>
      @$videos.html ''
      videos.each @addOne, @
