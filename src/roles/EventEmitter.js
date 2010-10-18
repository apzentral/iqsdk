Role('iQ.role.EventEmitter', {
  have: {
    eventListeners: null
  }
  
, requires: [ 'error', 'debug', 'dumpObject', 'info', 'warn' ]

, before: {
    initialize: function () {
      this.eventListeners = { };
    }
  }

, methods: {
    on: function (event, cb, scope, opts) {
      if (!isString(event)) {
        this.error("Event name must be a string");
        return;
      }
      event = event.toLowerCase();
      if (isObject(opts)) scope = scope || opts.scope || this;
      opts = opts || { };
      delete opts.scope;
      if (!isFunction(cb)) {
        this.error("You need to pass a function callbeck to the %s event binding method".format(event));
      }
      this.debug("Attaching event listeners for %s event from %s (%s)".format(event, scope.meta.name, scope.uiName ? scope.uiName() : '<noname>'));
      this.eventListeners[event] = this.eventListeners[event] || { };
      this.eventListeners[event][scope] = this.eventListeners[event][scope] || { };
      if (isDefined(this.eventListeners[event][scope][cb])) {
        this.warn("Event listener for %s with the same handler and scope is already defined; overriding".format(event));
      }
      this.eventListeners[event][scope][cb] = { handler: cb, scope: scope, opts: opts };
    }

  , un: function (event, cb, scope) {
      if (!isString(event)) {
        this.error("Event name must be a string");
        return;
      }
      event = event.toLowerCase();
      if (isUndefined(this.eventListeners[event]) ||
          isUndefined(this.eventListeners[event][scope]) ||
          isUndefined(this.eventListeners[event][scope][cb])) {
        this.warn("Trying to remove unexisting %s event listener".format(event));
        return;
      }
      this.debug("Removing event listeners for %s event from %s (%s)".format(event, scope.meta.name, scope.uiName ? scope.uiName() : '<noname>'));
      delete this.eventListeners[event][scope][cb];
    }
    
  , fireEvent: function (event, params) {
      if (!isString(event)) {
        this.error("Event name must be a string");
        return;
      }
      event = event.toLowerCase();

      this.debug("Firing event %s".format(event));
      if (isUndefined(this.eventListeners[event])) return;
      Object.each(this.eventListeners[event], function (h, v) {
        Object.each(v, function (a, b) {
          try {
            this.info("Calling %s event listener from %s (%s)".format(event, b.scope.meta.name, b.scope.uiName ? b.scope.uiName() : '<noname>'));
            b.handler.apply(b.scope, [ params ].concat(b.opts.arguments || [ ]));
            if (b.opts.single === true)
              this.un(event, b.handler, b.scope);
          } catch (ex) {
            this.error("Exception during callback excetion on event %s in function %s".format(event, b.handler.toString()));
          }
        }, this);
      }, this);
    }
  }
});
