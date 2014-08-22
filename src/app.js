// Generated by CoffeeScript 1.7.1
(function() {
  var CompletedKatasList, DOM, Developer, DeveloperEntry, DisplayingCompletedKatasList, InMemoryBackend, Kata,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  DOM = React.DOM;

  Developer = (function() {
    function Developer(id, name, avatar, completedKatas) {
      this.id = id;
      this.name = name;
      this.avatar = avatar;
      this.completedKatas = completedKatas != null ? completedKatas : [];
      this.setKataAsIncomplete = __bind(this.setKataAsIncomplete, this);
      this.hasCompletedKata = __bind(this.hasCompletedKata, this);
      this.completeKata = __bind(this.completeKata, this);
    }

    Developer.prototype.completeKata = function(kata) {
      if (!this.hasCompletedKata(kata)) {
        return this.completedKatas.push(kata);
      }
    };

    Developer.prototype.hasCompletedKata = function(kata) {
      return this.completedKatas.find((function(_this) {
        return function(k) {
          return k.name === kata.name;
        };
      })(this));
    };

    Developer.prototype.setKataAsIncomplete = function(kata) {
      var foundKata;
      if (this.hasCompletedKata(kata)) {
        foundKata = this.completedKatas.find((function(_this) {
          return function(k) {
            return k.name === kata.name;
          };
        })(this));
        return this.completedKatas.remove(foundKata);
      }
    };

    return Developer;

  })();

  Kata = (function() {
    function Kata(url, name) {
      this.url = url;
      this.name = name;
    }

    return Kata;

  })();

  InMemoryBackend = (function() {
    function InMemoryBackend() {
      this.developersList = __bind(this.developersList, this);
      this.katasList = __bind(this.katasList, this);
      this.fetchDevelopers = __bind(this.fetchDevelopers, this);
      this.fetchKatas = __bind(this.fetchKatas, this);
    }

    InMemoryBackend.prototype.fetchKatas = function() {
      return $.when({
        katas: this.katasList()
      }).then((function(_this) {
        return function(response) {
          return response.katas;
        };
      })(this));
    };

    InMemoryBackend.prototype.fetchDevelopers = function() {
      return $.when({
        developers: this.developersList()
      }).then((function(_this) {
        return function(response) {
          return response.developers;
        };
      })(this));
    };

    InMemoryBackend.prototype.katasList = function() {
      return [new Kata('http://testing-kata-1.arkency', 'TDD kata 1 - StringCalculator'), new Kata('http://testing-kata-2.arkency', 'TDD kata 2 - Shop'), new Kata('http://sales-kata-1.arkency', 'Sales Kata')];
    };

    InMemoryBackend.prototype.developersList = function() {
      return [new Developer(1, 'Anne K', 'samples/anne-k.jpg', [this.katasList()[0]]), new Developer(2, 'John P', 'samples/john-p.jpg', [this.katasList()[2]]), new Developer(3, 'Martin D', 'samples/martin-d.jpg'), new Developer(4, 'Ralph Z', 'samples/ralph-z.jpg', this.katasList())];
    };

    return InMemoryBackend;

  })();

  DisplayingCompletedKatasList = (function() {
    function DisplayingCompletedKatasList(domNode, guiComponent, backend) {
      this.domNode = domNode;
      this.backend = backend;
      this.kataMarkedAsIncomplete = __bind(this.kataMarkedAsIncomplete, this);
      this.kataMarkedAsCompleted = __bind(this.kataMarkedAsCompleted, this);
      this.toggleKataCompletenessStatus = __bind(this.toggleKataCompletenessStatus, this);
      this.developersProvided = __bind(this.developersProvided, this);
      this.katasProvided = __bind(this.katasProvided, this);
      this.start = __bind(this.start, this);
      this.gui = React.renderComponent(guiComponent({
        useCase: this
      }), this.domNode);
    }

    DisplayingCompletedKatasList.prototype.start = function() {
      return $.when(this.backend.fetchKatas(), this.backend.fetchDevelopers()).done((function(_this) {
        return function(katas, devs) {
          _this.katasProvided(katas);
          return _this.developersProvided(devs);
        };
      })(this));
    };

    DisplayingCompletedKatasList.prototype.katasProvided = function(katas) {
      this.katas = katas;
      return this.gui.setState({
        katas: this.katas
      });
    };

    DisplayingCompletedKatasList.prototype.developersProvided = function(developers) {
      this.developers = developers;
      return this.gui.setState({
        developers: this.developers
      });
    };

    DisplayingCompletedKatasList.prototype.toggleKataCompletenessStatus = function(developer, kata) {
      if (developer.hasCompletedKata(kata)) {
        return this.kataMarkedAsIncomplete(developer, kata);
      } else {
        return this.kataMarkedAsCompleted(developer, kata);
      }
    };

    DisplayingCompletedKatasList.prototype.kataMarkedAsCompleted = function(developer, kata) {
      developer.completeKata(kata);
      return this.gui.refs["developer_" + developer.id].setState({
        developer: developer
      });
    };

    DisplayingCompletedKatasList.prototype.kataMarkedAsIncomplete = function(developer, kata) {
      developer.setKataAsIncomplete(kata);
      return this.gui.refs["developer_" + developer.id].setState({
        developer: developer
      });
    };

    return DisplayingCompletedKatasList;

  })();

  CompletedKatasList = React.createClass({
    displayName: 'CompletedKatasList',
    isLoaded: function() {
      return (this.state != null) && (this.state.developers != null) && (this.state.katas != null);
    },
    renderLoadingMessage: function() {
      return DOM.ul({
        key: 'loadingMessageBox',
        className: 'list-group'
      }, DOM.li({
        key: 'loadingMessage',
        className: 'list-group-item'
      }, "Loading..."));
    },
    renderList: function() {
      var developer;
      return DOM.ul({
        key: 'developersList',
        className: 'list-group developers-list'
      }, (function() {
        var _i, _len, _ref, _results;
        _ref = this.state.developers;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          developer = _ref[_i];
          _results.push(DeveloperEntry({
            key: "developer-" + developer.id,
            ref: "developer_" + developer.id,
            developer: developer,
            katas: this.state.katas,
            useCase: this.props.useCase
          }));
        }
        return _results;
      }).call(this));
    },
    render: function() {
      return DOM.div({
        key: 'root'
      }, DOM.h1({
        key: 'heading'
      }, "Completed Katas:"), this.isLoaded() ? this.renderList() : this.renderLoadingMessage());
    }
  });

  DeveloperEntry = React.createClass({
    displayName: 'DeveloperEntry',
    getInitialState: function() {
      return {
        developer: this.props.developer,
        katas: this.props.katas,
        expanded: false
      };
    },
    toggleExpand: function(ev) {
      ev.preventDefault();
      return this.setState({
        expanded: !this.state.expanded
      });
    },
    toggleExpandButtonText: function() {
      if (!this.state.expanded) {
        return "Expand";
      }
      return "Collapse";
    },
    renderExpandButton: function() {
      return DOM.a({
        key: 'expandButton',
        className: 'btn btn-primary btn-xs',
        href: '#',
        onClick: this.toggleExpand
      }, this.toggleExpandButtonText());
    },
    renderControls: function() {
      return DOM.div({
        key: 'actionsBox',
        className: 'pull-right controls-box'
      }, this.renderExpandButton(), this.renderCounterBadge());
    },
    renderCounterBadge: function() {
      return DOM.span({
        key: 'counterBadge',
        className: 'badge'
      }, this.state.developer.completedKatas.length);
    },
    renderAvatar: function() {
      return DOM.div({
        key: 'avatarBox',
        className: 'pull-left'
      }, DOM.img({
        key: 'avatar',
        className: 'avatar',
        alt: this.state.developer.name,
        src: this.state.developer.avatar
      }));
    },
    renderName: function() {
      return DOM.h4({
        key: 'developerName'
      }, this.state.developer.name);
    },
    render: function() {
      return DOM.li({
        key: 'developerRoot',
        className: 'list-group-item'
      }, this.renderAvatar(), this.renderControls(), this.renderName(), DOM.span({
        key: 'clearfix',
        className: 'clearfix'
      }), this.state.expanded ? this.renderKatasList() : void 0);
    },
    kataClasses: function(kata) {
      var classSet;
      classSet = {};
      classSet['list-group-item'] = true;
      classSet['kata-completed'] = this.state.developer.hasCompletedKata(kata);
      return React.addons.classSet(classSet);
    },
    renderKatasList: function() {
      var kata;
      return [
        DOM.h5({
          key: 'heading'
        }, "Available katas:"), DOM.ul({
          key: 'katasList',
          className: 'list-group'
        }, (function() {
          var _i, _len, _ref, _results;
          _ref = this.state.katas;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            kata = _ref[_i];
            _results.push(DOM.li({
              key: "kata-" + kata.name,
              className: this.kataClasses(kata)
            }, this.renderKataCheckBox(kata), this.renderKataLink(kata)));
          }
          return _results;
        }).call(this))
      ];
    },
    renderKataLink: function(kata) {
      return DOM.a({
        key: 'kataLink',
        href: kata.url
      }, kata.name);
    },
    toggleKataStatus: function(kata, developer) {
      return this.props.useCase.toggleKataCompletenessStatus(developer, kata);
    },
    renderKataCheckBox: function(kata) {
      return DOM.div({
        key: 'kataCheckboxBox',
        className: 'pull-right'
      }, DOM.input({
        key: 'kataCheckbox',
        type: 'checkbox',
        checked: this.state.developer.hasCompletedKata(kata),
        onChange: this.toggleKataStatus.bind(this, kata, this.state.developer)
      }));
    }
  });

  $(function() {
    return $("[data-app='completedKatasApp']").each(function() {
      var app;
      app = new DisplayingCompletedKatasList(this, CompletedKatasList, new InMemoryBackend());
      return app.start();
    });
  });

}).call(this);