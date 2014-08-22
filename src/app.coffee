{DOM} = React

class Developer
  constructor: (@id, @name, @avatar, @completedKatas=[]) ->

  completeKata: (kata) =>
    @completedKatas.push(kata) unless @hasCompletedKata(kata)

  hasCompletedKata: (kata) =>
    @completedKatas.find (k) => k.name is kata.name

  setKataAsIncomplete: (kata) =>
    if @hasCompletedKata(kata)
      foundKata = @completedKatas.find (k) => k.name is kata.name
      @completedKatas.remove(foundKata)

class Kata
  constructor: (@url, @name) ->

class InMemoryBackend
  fetchKatas: =>
    $.when(katas: @katasList()).then (response) =>
      response.katas

  fetchDevelopers: =>
    $.when(developers: @developersList()).then (response) =>
      response.developers

  katasList: =>
    [
      new Kata('http://testing-kata-1.arkency', 'TDD kata 1 - StringCalculator'),
      new Kata('http://testing-kata-2.arkency', 'TDD kata 2 - Shop'),
      new Kata('http://sales-kata-1.arkency', 'Sales Kata')
    ]

  developersList: =>
    [
      new Developer(1, 'Anne K', 'samples/anne-k.jpg', [@katasList()[0]]),
      new Developer(2, 'John P', 'samples/john-p.jpg', [@katasList()[2]]),
      new Developer(3, 'Martin D', 'samples/martin-d.jpg'),
      new Developer(4, 'Ralph Z', 'samples/ralph-z.jpg', @katasList())
    ]

class DisplayingCompletedKatasList
  constructor: (@domNode, guiComponent, @backend) ->
    @gui = React.renderComponent(guiComponent(useCase: @), @domNode)

  start: =>
    $.when(@backend.fetchKatas(), @backend.fetchDevelopers()).done (katas, devs) =>
      @katasProvided(katas)
      @developersProvided(devs)

  katasProvided: (@katas) =>
    @gui.setState
      katas: @katas

  developersProvided: (@developers) =>
    @gui.setState
      developers: @developers

  toggleKataCompletenessStatus: (developer, kata) =>
    if developer.hasCompletedKata(kata)
      @kataMarkedAsIncomplete(developer, kata)
    else
      @kataMarkedAsCompleted(developer, kata)

  kataMarkedAsCompleted: (developer, kata) =>
    developer.completeKata(kata)
    @gui.setDeveloperState(developer.id, developer: developer)

  kataMarkedAsIncomplete: (developer, kata) =>
    developer.setKataAsIncomplete(kata)
    @gui.setDeveloperState(developer.id, developer: developer)

CompletedKatasList = React.createClass
  displayName: 'CompletedKatasList'

  isLoaded: ->
    @state? and @state.developers? and @state.katas?

  renderLoadingMessage: ->
    DOM.ul
      key: 'loadingMessageBox'
      className: 'list-group'
      DOM.li
        key: 'loadingMessage'
        className: 'list-group-item'
        "Loading..."

  setDeveloperState: (developerID, newState) =>
    @refs["developer_#{developerID}"].setState(newState)

  renderList: ->
    DOM.ul
      key: 'developersList'
      className: 'list-group developers-list'
      for developer in @state.developers
        DeveloperEntry
          key: "developer-#{developer.id}"
          ref: "developer_#{developer.id}"
          developer: developer
          katas: @state.katas
          useCase: @props.useCase

  render: ->
    DOM.div
      key: 'root'
      DOM.h1
        key: 'heading'
        "Completed Katas:"
      if @isLoaded()
        @renderList()
      else @renderLoadingMessage()

DeveloperEntry = React.createClass
  displayName: 'DeveloperEntry'

  getInitialState: ->
    developer: @props.developer
    katas: @props.katas
    expanded: false

  toggleExpand: (ev) ->
    ev.preventDefault()
    @setState expanded: !@state.expanded

  toggleExpandButtonText: ->
    return "Expand" unless @state.expanded
    "Collapse"

  renderExpandButton: ->
    DOM.a
      key: 'expandButton'
      className: 'btn btn-primary btn-xs'
      href: '#'
      onClick: @toggleExpand
      @toggleExpandButtonText()

  renderControls: ->
    DOM.div
      key: 'actionsBox'
      className: 'pull-right controls-box'
      @renderExpandButton()
      @renderCounterBadge()

  renderCounterBadge: ->
    DOM.span
      key: 'counterBadge'
      className: 'badge'
      @state.developer.completedKatas.length

  renderAvatar: ->
    DOM.div
      key: 'avatarBox'
      className: 'pull-left'
      DOM.img
        key: 'avatar'
        className: 'avatar'
        alt: @state.developer.name
        src: @state.developer.avatar

  renderName: ->
    DOM.h4
      key: 'developerName'
      @state.developer.name

  render: ->
    DOM.li
      key: 'developerRoot'
      className: 'list-group-item'
      @renderAvatar()
      @renderControls()
      @renderName()
      DOM.span
        key: 'clearfix'
        className: 'clearfix'
      @renderKatasList() if @state.expanded

  kataClasses: (kata) ->
    classSet = {}
    classSet['list-group-item'] = true
    classSet['kata-completed']  = @state.developer.hasCompletedKata(kata)

    React.addons.classSet(classSet)

  renderKatasList: ->
    [
      DOM.h5
        key: 'heading'
        "Available katas:"
      DOM.ul
        key: 'katasList'
        className: 'list-group'
        for kata in @state.katas
          DOM.li
            key: "kata-#{kata.name}"
            className: @kataClasses(kata)
            @renderKataCheckBox(kata)
            @renderKataLink(kata)
    ]

  renderKataLink: (kata) ->
    DOM.a
      key: 'kataLink'
      href: kata.url
      kata.name

  toggleKataStatus: (kata, developer) ->
    @props.useCase.toggleKataCompletenessStatus(developer, kata)

  renderKataCheckBox: (kata) ->
    DOM.div
      key: 'kataCheckboxBox'
      className: 'pull-right'
      DOM.input
        key: 'kataCheckbox'
        type: 'checkbox'
        checked: @state.developer.hasCompletedKata(kata)
        onChange: @toggleKataStatus.bind(@, kata, @state.developer)


$ ->
  $("[data-app='completedKatasApp']").each ->
    app = new DisplayingCompletedKatasList(@, CompletedKatasList, new InMemoryBackend())
    app.start()
