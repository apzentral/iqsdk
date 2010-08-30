Class('iQue.UI.Control', {
  has: {
    parent: { is: 'ro', required: false, init: null }
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
    iQue.R.Logging
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
        this.error(ex);
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
        this.error(ex);
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
        this.error(ex);
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
          conf.config[param] = this.batchProcessAttribute(conf.config[param], iQue.i18n);
      }, this);
      this.__themeStrings.each(function (param) {
        if (isDefined(conf.config[param]))
          conf.config[param] = this.batchProcessAttribute(conf.config[param], iQue.theme);
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
        return this.batchProcessAttribute(value, iQue.i18n);
      if (this.__themeStrings.include(attr))
        return this.batchProcessAttribute(value, iQue.theme);
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
      this.debug("Constructing component...");

      var cfg = apply({ }, this.origConfig.config);

      var dynamic = this.origConfig.dynamic;
      isArray(dynamic) && dynamic.each (function (dytem) {
        try {
          var generator = dytem.generator;
          var scope = dytem.scope;
          if (isString(scope)) scope = this.iquePath(scope);
          if (!isFunction(generator)) generator = this.iquePath(generator);
          if (!isFunction(generator))
            this.error("Attribute " + dytem.attribute + " have supplied wrong generator");
          else
            cfg[dytem.attribute] = this.preprocessAttribute(dytem.attribute, generator.call(scope || this, this));
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
      this.debug("Attaching event listeners...");
      var listeners = this.origConfig.listeners = this.origConfig.listeners || { };
      for (var event in listeners) {
        (function () {
          var li = listeners[event];
          var fn = li.handler || li;
          var scope = li.scope || this;
          var called = false;
          function _lateBinder () {
            if (called) return;
            if (!isFunction(fn))
              fn = this.iquePath(fn);
            if (isString(scope))
              scope = this.iquePath(scope);
            if (!isFunction(fn)) {
              this.error("Bad listener " + fn + " for " + event + " event");
              continue;
            }
            this.on(event, fn, scope);
            called = true;
            this.un(event, _lateBinder);
            fn.apply(scope, arguments);
          }
          this.on(event, _lateBinder, this);
        }).call(this);
      }
      return true;
    }
  , render: function () {
      this.debug("Rendering control...");
      this.controls = { };
      this.origConfig.controls = this.origConfig.controls || [ ];
      this.origConfig.controls.each(function (item, idx) {
        this.debug("Building " + item.name);
        var constructor = item.builder;
        if (!isFunction(constructor))
          return this.error("Component " + item.name + " does not supply proper constructor");
        try {
          var ctrl = new constructor(apply({ parent: this }, item));
          this.controls[item.name || idx] = ctrl;
          this.tiCtrl[item.location] = ctrl.tiCtrl;
        } catch (ex) {
          this.error("Exception during component build process:");
          this.error(ex);
        }
      }, this);
      return true;
    }

  /*
   * Wrappers for Titanium API functions
   */
  , show: function () { this.tiCtrl.show(); return this; }
  , hide: function () { this.tiCtrl.hide(); return this; }
  , isVisible: function () { return this.tiCtrl.visible; }
  , animate: function (anim, cb) { this.tiCtrl.animate(anim, cb); return this; }
  , toImage: function (cb) { return this.tiCtrl.toImage(cb); }
  , getProperty: function (prop) { return this.tiCtrl[prop]; }
  , setProperty: function (prop, value) { this.tiCtrl[prop] = value; }
  
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
   * iQuePath functions
   */
  , iquePath: function (route) {
      try {
        this.debug("Processing iQue path expression " + route);
        var obj = this;
        route.split('.').each(function (item) {
          var type = '<non-iQue component>';
          try { type = obj.meta.name; } catch (ex) { ; };
          this.debug("Parsing path component: " + item + " for " + type);
          if (isFunction(obj.iqueAxis)) obj = obj.iqueAxis.call(obj, item);
          var axis = item[0];
          item = item.replace(/^[^\w\d]/, '');
          if (item.isBlank()) return;
          if (!obj) {
            this.error("No object for the axis " + axis + " and item " + item);
            throw null;
          }
          if (!obj[item]) {
            this.error("Error processing iQue path expression: undefined component " + item);
            throw null;
          }
          obj = obj[item];
        }, this);
        return obj;
      } catch (ex) {
        this.error("Wrong iQue path expression: " + route);
        if (ex)
          this.error("Exception details: " + ex);
        return this;
      }
    }
    
  , iqueAxis: function (item) {
      if (item == '^') return this.parent;
      if (item.startsWith('*')) return this.controls;
      return this;
    }
  }
});
