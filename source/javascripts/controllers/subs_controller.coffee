App.SubsController = Ember.ArrayController.extend

  editing: false
  searching: false

  updateSubProperty: (sub, property, value)->
    videos = sub.get 'videos'
    sub.set 'videos', []
    sub.set property, value
    App.Sub.updateRecord(sub).then ->
      sub.set 'videos', videos

  actions:
    toggleEditing: ->
      @set 'editing', !@get('editing')

    toggleSearching: ->
      @set 'subSearchResults', []
      @set 'subQuery', ''
      @set 'searching', !@get('searching')

    searchSubs: ->
      request = App.youTube.searchChannels @get('subQuery')
      request.done (subs)=>
        @set 'subSearchResults', subs

    add: (sub)->
      App.Sub.createRecord(sub).then (record)=>
        @addObject record
      @get('subSearchResults').removeObject sub

    delete: (sub)->
      @removeObject sub
      App.Sub.deleteRecord sub

    makeDefault: (sub)->
      return if sub.get 'default'

      currentDefault = _.find @get('model'), (sub)-> sub.get 'default'
      removeCurrentDefault = new Ember.RSVP.Promise (resolve)=>
        if currentDefault
          @updateSubProperty(currentDefault, 'default', false).then -> resolve()
        else
          resolve()

      removeCurrentDefault.then =>
        @updateSubProperty sub, 'default', true
