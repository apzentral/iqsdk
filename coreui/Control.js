Class('iQue.UI.Control', {
  has: {
    parent: { is: 'ro', required: false, init: { } }
  , controls: { is: 'ro', required: false, init: { } }
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
      this.parent = conf.parent;
      this.__i18nStrings.each(function (param) {
        conf.config[param] = this.batchProcessAttribute(conf.config[param], iQue.i18n);
      }, this);
      this.__themeStrings.each(function (param) {
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

      var constructor = Ti.UI['create' + this.tiClass];
      if (!isFunction(constructor)) {
        this.error("Unknown Titanium control constructor: " + this.tiClass);
        return false;
      }
      // This complicated switch is required because of quite odd bug
      // in Titanium (Kroll actially) which fails to execute functions referenced
      // in form of Ti.UI['create' + this.tiClass](cfg);
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
        var li = listeners[event];
        var fn = li.handler || li;
        var scope = li.scope || this;
        if (!isFunction(fn))
          fn = this.iquePath(fn);
        if (isString(scope))
          scope = this.iquePath(scope);
        if (!isFunction(fn)) {
          this.error("Bad listener " + fn + " for " + event + " event");
          continue;
        }
        this.on(event, fn, scope);
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
          var ctrl = this.controls[item.name] = new constructor(apply({ parent: this }, item));
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
  
  , iquePath: function (route) {
      try {
        this.debug("Processing iQue path expression " + route);
        var obj = this;
        route.split('.').each(function (item) {
          var type = '<non-iQue component>';
          try { type = obj.meta.name; } catch (ex) { ; };
          this.debug("Parsing path component: " + item + " for " + type);
          if (isFunction(obj.iqueAxis)) obj = obj.iqueAxis(item);
          item = item.replace(/^[^\w\d]/, '');
          if (item.length == '') return;
          if (!obj[item]) {
            this.error("Error processing iQue path expression: undefined component " + item);
            throw "Unknown iQue path component " + item;
          }
          obj = obj[item];
        }, this);
        return obj;
      } catch (ex) {
        this.error("Wrong iQue path expression: " + route);
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
