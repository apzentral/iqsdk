Class('iQue.UI.Control', {
  has: {
    controls: { is: 'ro', required: false, init: { } }
  , origConfig: { is: 'ro', required: false, init: { } }
  , origParams: { is: 'ro', required: false, init: { } }
  , eventListeners: { is: 'ro', required: false, init: { } }
  , tiCtrl: { is: 'ro', required: false, init: null }
  , tiClass: { is: 'ro', required: false }
  , i18nStrings: { is: 'ro', required: false, init: [ ], isPrivate: true }
  , themeStrings: { is: 'ro', required: false, init: [ ], isPrivate: true }
  }
  
, does: iQue.R.Logging
  
, after: {
    initialize: function () {
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
    BUILD: function (conf, params) {
      this.initStrings();
      conf = conf || { };
      conf.config = conf.config || { };
      conf.config = this.initConfig(conf.config);
      function _process(itm, fn) {
        if (isArray(itm))
          return itm.collect(function (i) { return _process(i, fn); });
        else if (itm)
          return fn(itm);
        return itm;
      };
      this.__i18nStrings.each(function (param) {
        conf.config[param] = _process(conf.config[param], iQue.i18n);
      });
      this.__themeStrings.each(function (param) {
        conf.config[param] = _process(conf.config[param], iQue.theme);
      });
      return { origConfig: conf, origParams: params || { } };
    }
  , initStrings: function () {
      this.__i18nStrings = [ ];
      this.__themeStrings = [ 'backgroundImage' ];
    }
  , initConfig: function (config) {
      return config;
    }
  , construct: function () {
      this.debug("Constructing component...");
      var cfg = apply({ }, this.origConfig.config);

      var dynamic = this.origConfig.dynamic;
      isArray(dynamic) && dynamic.each (function (dytem) {
        cfg[dytem.attribute] = dytem.generator();
      }, this);

      var constructor = Ti.UI['create' + this.tiClass];
      if (!isFunction(constructor)) {
        this.error("Unknown Titanium control constructor: " + this.tiClass);
        return false;
      }
      switch (this.tiClass) {
        case 'Button':
          this.tiCtrl = Ti.UI.createButton(cfg);
          break;
        case 'ButtonBar':
          this.tiCtrl = Ti.UI.createButtonBar(cfg);
          break;
        case 'Label':
          this.tiCtrl = Ti.UI.createLabel(cfg);
          break;
        case 'ImageView':
          this.tiCtrl = Ti.UI.createImageView(cfg);
          break;
        case 'View':
          this.tiCtrl = Ti.UI.createView(cfg);
          break;
        case 'ScrollView':
          this.tiCtrl = Ti.UI.createScrollView(cfg);
          break;
        case 'Window':
          this.tiCtrl = Ti.UI.createWindow(cfg);
          break;
        case 'TableView':
          this.tiCtrl = Ti.UI.createTableView(cfg);
          break;
        case 'TableViewRow':
          this.tiCtrl = Ti.UI.createTableViewRow(cfg);
          break;
        case 'TableViewSection':
          this.tiCtrl = Ti.UI.createTableViewSection(cfg);
          break;
        case 'TabGroup':
          this.tiCtrl = Ti.UI.createTabGroup(cfg);
          break;
        default:
          this.error("Unsupported Titanium control constructor: " + this.tiClass);
          return false;
      }
      return true;
    }
  , listen: function () {
      this.debug("Attaching event listeners...");
      var listeners = this.origConfig.listeners = this.origConfig.listeners || { };
      for (var event in listeners) {
        var fn = listeners[event];
        if (!isFunction(fn))
          fn = this[fn];
        if (!isFunction(fn)) {
          this.error("Bad listener " + fn + " for " + event + " event");
          continue;
        }
        this.on(event, fn);
      }
      return true;
    }
  , render: function () {
      this.debug("Rendering control...");
      this.origConfig.controls = this.origConfig.controls || [ ];
      this.origConfig.controls.each(function (item) {
        this.debug("Building " + item.name);
        var constructor = item.builder;
        if (!isFunction(constructor))
          return this.error("Component " + item.name + " does not supply proper constructor");
        try {
          var ctrl = this.controls[item.name] = new constructor(item);
          this.tiCtrl[item.location] = ctrl.tiCtrl || ctrl;
        } catch (ex) {
          this.error("Exception during component build process:");
          this.error(ex);
        }
      }, this);
      return true;
    }
  , show: function () { this.tiCtrl.show(); return this; }
  , hide: function () { this.tiCtrl.hide(); return this; }
  , animate: function (anim, cb) { this.tiCtrl.animate(anim, cb); return this; }
  
  , on: function (eventName, cb, scope) {
      var fn = cb.bind(scope || this);
      this.eventListeners[eventName] = this.eventListeners[eventName] || { };
      this.eventListeners[cb] = fn;
      this.tiCtrl.addEventListener(eventName, fn);
  	  return this;
    }
  , un: function (eventName, cb) {
      var fn = this.eventListeners[eventName] && this.eventListeners[eventName][cb];
      this.tiCtrl.reomveEventListener(eventName, fn || cb);
  	  return this;
    }
  , toImage: function (cb) { return this.tiCtrl.toImage(cb); }
  }
});
