Class('iQ.ui.Component', {
  has: {
    parent: { is: 'rw', required: false, init: null }
  , controls: { is: 'ro', required: false, init: null }
  , origConfig: { is: 'ro', required: false, init: { } }
  , origParams: { is: 'ro', required: false, init: { } }
  , eventListeners: { is: 'ro', required: false, init: { } }
  , tiCtrl: { is: 'ro', required: false, init: null }
  , tiFactory: { is: 'ro', required: false, init: null }
  , tiClass: { is: 'ro', required: false }
  , i18nStrings: { is: 'ro', required: false, init: null, isPrivate: true }
  , themeStrings: { is: 'ro', required: false, init: null, isPrivate: true }
  }

, does: [
    iQ.role.Logging
  ]
  
, after: {

  /*
   * Control initialization batch
   */
    initialize: function () {
      // Init phase 1: build control and its parts
      try {
        if (!this.construct()) {
          this.error("Control construction faield");
          return false;
        }
      } catch (ex) {
        this.error("Exception during control construction:");
        this.logException(ex);
        return false;
      }

      // Init phase 2: initialize control sub-components (rendering)
      try {
        if (!this.render()) {
          this.error("Control rendering faield");
          return false;
        }
      } catch (ex) {
        this.error("Exception during control construction:");
        this.logException(ex);
        return false;
      }

      // Init phase 3: attach event listeners
      try {
        if (!this.listen()) {
          this.error("Control event binging faield");
          return false;
        }
      } catch (ex) {
        this.error("Exception during control construction:");
        this.logException(ex);
        return false;
      }

      return true;
    }
  }
  
, methods: {
  /*
   * Preparing control configuration
   */
    BUILD: function (conf, params) {
      this.initStrings();
      conf = conf || { };
      conf.config = conf.config || { };
      conf.config = this.initConfig(conf.config);
      this.parent = conf.parent;
      this.__i18nStrings.each(function (param) {
        if (isDefined(conf.config[param]))
          conf.config[param] = this.batchProcessAttribute(conf.config[param], iQ.i18n);
      }, this);
      this.__themeStrings.each(function (param) {
        if (isDefined(conf.config[param]))
          conf.config[param] = this.batchProcessAttribute(conf.config[param], iQ.theme);
      }, this);
      return { origConfig: conf, origParams: params || { } };
    }
  , initStrings: function () {
      this.__i18nStrings = [ ];
      this.__themeStrings = [ 'backgroundImage' ];
    }
  , initConfig: function (config) {
      return config;
    }
  , preprocessAttribute: function (attr, value) {
      if (this.__i18nStrings.include(attr))
        return this.batchProcessAttribute(value, iQ.i18n);
      if (this.__themeStrings.include(attr))
        return this.batchProcessAttribute(value, iQ.theme);
      return value;
    }
  , batchProcessAttribute: function (itm, fn) {
      if (isArray(itm))
        return itm.collect(function (i) { return this.batchProcessAttribute(i, fn); }, this);
      else if (itm)
        return fn(itm);
      return itm;
    }
    
  /*
   * Construct, render and listen routines
   */
  , construct: function () {
      this.debug("Constructing component %s...".format(this.uiName()));

      var cfg = apply({ }, this.origConfig.config);

      var dynamic = this.origConfig.dynamic;
      isObject(dynamic) && Object.each(dynamic, function (attribute, dytem) {
        try {
          var generator = dytem.generator || dytem;
          var scope = dytem.scope;
          if (isString(scope)) scope = this.uiPath(scope);
          if (!isFunction(generator)) generator = this.uiPath(generator);
          if (!isFunction(generator))
            cfg[attribute] = this.preprocessAttribute(attribute, generator);
            //this.error("Attribute " + dytem.attribute + " have supplied wrong generator");
          else {
            cfg[attribute] = this.preprocessAttribute(attribute, generator.call(scope || this, this));
          }
        } catch (ex) {
          this.error("Error generating dynamic attribute " + dytem.attribute);
          this.logException(ex);
        }
      }, this);

      if (!isFunction(this.tiFactory)) {
        this.error("Error creating control: tiFactory is not a function");
        this.tiCtrl = null;
        return false;
      }
      this.tiCtrl = this.tiFactory(cfg);

      return true;
    }
  , listen: function () {
      this.debug("Attaching event listeners for %s...".format(this.uiName()));
      var listeners = this.origConfig.listeners;
      isObject(listeners) && Object.each(listeners, function (event, li) {
        if (!li) {
          this.error("Component %s provides no handler for %s event".format(this.uiName(), event));
          return;
        }
        var fn = li.handler || li;
        var scope = li.scope || this;
        var called = false;
        function _lateBinder () {
          this.debug("Executing late event binding...");
          try {
            //if (called) return;
            if (!isFunction(fn))
              fn = this.uiPath(fn);
            if (isString(scope))
              scope = this.uiPath(scope);
            if (!isFunction(fn)) {
              this.error("Bad listener " + fn + " for " + event + " event");
              continue;
            }
            //this.un(event, _lateBinder);
            //this.on(event, fn, scope);
            //called = true;
            fn.apply(scope, arguments);
          } catch (ex) {
            this.error("Late event binding failed because of exception:");
            this.logException(ex);
          }
        }
        this.on(event, _lateBinder, this);
      }, this);
      return true;
    }
  , render: function () {
      this.debug("Rendering component %s...".format(this.uiName()));
      this.controls = { };
      this.origConfig.controls = this.origConfig.controls || { };
      Object.each(this.origConfig.controls, function (location, item) {
        this.debug("Building " + item.name);
        try {
          this.setControl(location, iQ.buildComponent(item));
        } catch (ex) {
          this.error("Exception during component build process:");
          this.logException(ex);
        }
      }, this);
      return true;
    }

  , setControl: function (location, ctrl) {
      try {
        ctrl.parent = this;
        this.controls[ctrl.uiName() || Object.numericKeys(this.controls).length] = ctrl;
        this.tiCtrl[location] = ctrl.tiCtrl || ctrl;
      } catch (ex) {
        this.error("Error setting control %s for location %s:".format(ctrl.origConfig.name, location));
        this.logException(ex);
      }
      return this;
    }

  /*
   * Wrappers for Titanium API functions
   */
  , show: function (opts) { this.tiCtrl.show(opts); return this; }
  , hide: function (opts) { this.tiCtrl.hide(opts); return this; }
  , isVisible: function () { return this.tiCtrl.visible; }
  , animate: function (anim, cb) { 
      if (anim && anim.view)
        anim.view = anim.view.tiCtrl || anim.view;
      if (isFunction(cb))
        this.tiCtrl.animate(anim, cb);
      else
        this.tiCtrl.animate(anim);
      return this; 
    }
  , toImage: function (cb) { return this.tiCtrl.toImage(cb); }
  , getProperty: function (prop) { return this.tiCtrl[prop]; }
  , setProperty: function (prop, value) { this.tiCtrl[prop] = this.preprocessAttribute(prop, value); }
  
  , applyPosition: function (pos) {
      Object.each(pos, function (loc, val) {
        this.tiCtrl[loc] = val;
      }, this);
    }
  
  /*
   * Event listeners
   */
  , on: function (eventName, cb, scope) {
      try {
        var fn = cb;
        this.eventListeners[eventName] = this.eventListeners[eventName] || { };
        this.tiCtrl.addEventListener(eventName, this.eventListeners[eventName][cb] = fn.bind(scope || this));
      } catch (ex) {
        this.error("Error attaching listener for event " + eventName + ":");
        this.logException(ex);
      }
  	  return this;
    }
  , un: function (eventName, cb) {
      try {
        var fn = this.eventListeners[eventName] && this.eventListeners[eventName][cb];
        this.tiCtrl.removeEventListener(eventName, fn || cb);
      } catch (ex) {
        this.error("Error removing listener for event " + eventName + ":");
        this.logException(ex);
      }
  	  return this;
    }

  /*
   * iQPath functions
   */
  , uiName: function () {
      return this.origConfig.name || '<noname>';
    }
   
  , uiPath: function (route) {
      try {
        this.debug("Processing iQ path expression " + route);
        var obj = this;
        route.split('.').each(function (item) {
          var type = '<non-iQ component>';
          try { type = obj.meta.name; } catch (ex) { ; };
          this.debug("Parsing path component: " + item + " for " + type);
          if (isFunction(obj.uiAxis)) obj = obj.uiAxis.call(obj, item);
          var axis = item[0];
          item = item.replace(/^[^\w\d]/, '');
          if (item.isBlank()) return;
          if (!obj) {
            this.error("No object for the axis " + axis + " and item " + item);
            throw null;
          }
          if (!obj[item]) {
            this.error("Error processing iQ path expression: undefined component " + item);
            throw null;
          }
          obj = obj[item];
        }, this);
        return obj;
      } catch (ex) {
        this.error("Wrong iQ path expression: " + route);
        if (ex)
          this.error("Exception details: " + ex);
        return this;
      }
    }
/*  , uiResolve: function (routeStep) {
      var obj = this;
      if (isFunction(obj.uiAxis)) obj = obj.uiAxis.call(obj, item);
      
    }*/
  , uiAxis: function (item) {
      if (item == '/') return TheApp;
      if (item == '^') return this.parent;
      if (item.startsWith('!')) return TheApp.dialogs;
      if (item.startsWith('*')) return this.controls;
      return this;
    }
  }
});
