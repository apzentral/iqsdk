
namespace('iQue.UI');

Class('iQue.UI.Control', {
  has: {
    origConfig: { is: 'ro', required: false, init: { } }
  , tiCtrl: { is: 'ro', required: false, init: null }
  , tiClass: { is: 'ro', required: false }
  }
  
, after: {
    initialize: function () {
      var constructor = Ti.UI['create' + this.tiClass];
      if (!isFunction(constructor)) throw "Unknown Titanium control constructor: " + this.tiClass;
      switch (this.tiClass) {
        case 'Window':
          this.tiCtrl = Ti.UI.createWindow(this.origConfig);
          break;
        case 'View':
          this.tiCtrl = Ti.UI.createView(this.origConfig);
          break;
        case 'TableView':
          this.tiCtrl = Ti.UI.createTableView(this.origConfig);
          break;
        case 'TableViewRow':
          this.tiCtrl = Ti.UI.createTableViewRow(this.origConfig);
          break;
        case 'TableViewSection':
          this.tiCtrl = Ti.UI.createTableViewSection(this.origConfig);
          break;
        case 'TabGroup':
          this.tiCtrl = Ti.UI.createTabGroup(this.origConfig);
          break;
      }
      // this.tiCtrl = Titanium.UI['create' + this.tiClass](this.origConfig);
      this.render();
    }
  }
  
, methods: {
    BUILD: function (conf) {
      conf = conf || { };
      conf.title && (conf.title = iQue.i18n(conf.title));
      return { origConfig: conf };
    }
  , render: function () { }
  , show: function () { this.tiCtrl.show(); return this; }
  , hide: function () { this.tiCtrl.hide(); return this; }
  , animate: function (anim, cb) { this.tiCtrl.animate(anim, cb); return this; }
  
  , on: function (eventName, cb) { 
      this.tiCtrl.addEventListener(eventName, cb);
	  return this;
    }
  , un: function (eventName, cb) {
      this.tiCtrl.reomveEventListener(eventName, cb);
	  return this;
    }
  , toImage: function (cb) { return this.tiCtrl.toImage(cb); }
  }
});

Class('iQue.UI.View', {
  isa: iQue.UI.Control
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'View' }
  }

, methods: {
  , add: function () {
      for (var i = 0; i < arguments.length; i++)
        arguments[i] && this.tiCtrl.add(arguments[i].tiCtrl || arguments[i]);
      return this;
    }
  , remove: function () {
      for (var i = 0; i < arguments.length; i++)
        arguments[i] && this.tiCtrl.remove(arguments[i].tiCtrl || arguments[i]);
      return this;
    }
});

Class('iQue.UI.Window', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'Window' }
  }

, methods: {
    open: function () {
      this.tiCtrl.open(); 
    }
  }
});

Class('iQue.UI.TabGroup', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'TabGroup' }
  , tabs: { is: 'ro', required: false, init: { } }
  , windows: { is: 'ro', required: false, init: { } }
  , tabsConfig: { is: 'ro', required: true }
  }

, after: {
    render: function () {
      this.tabsConfig.each(function (cfg) {
        var win = new cfg.winConstructor();
        var tab = Ti.UI.createTab({
          icon: cfg.icon,
          title: iQue.i18n(cfg.title),
          window: win.getTiCtrl()
        });
        this.tiCtrl.addTab(tab);
        this.tabs[cfg.name] = tab;
        this.windows[cfg.name] = win;
      }, this);
    }
  }

, methods: {
    BUILD: function (tabs) {
      return apply({ tabsConfig: tabs }, this.SUPER());
    }
  , open: function () {
      this.tiCtrl.open();
    }
  }
});

Class('iQue.UI.TableView', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'TableView' }
  , data: { is: 'ro', required: false, init: { } }
  , layouts: { is: 'ro', required: false, init: { } }
  }

, before: {
    initialize: function () {
      if (this.data) this.origConfig.data = this.generateRows(this.data, this.layouts).invoke('getTiCtrl');
    }
  }  
, methods: {
    BUILD: function (config, data, layouts) {
      return { origConfig: config || { }, data: data, layouts: layouts };
    }
  , generateRow: function (data, pack) {
      return new iQue.UI.TableView.Row(data, pack.layout, pack.mapping, pack.config);
    }
  , generateRows: function (data, layouts) {
      return data.collect(function (item) {
        layouts[item.className].layout.className = item.className;
        return this.generateRow(item, layouts[item.className]);
      }, this);
    }
  , appendRow: function (row) {
      return this.tiCtrl.appendRow(row.tiCtrl || row);
    }
  }
});

Class('iQue.UI.TableView.Row', {
  isa: iQue.UI.View

, has: {
    tiClass: { is: 'ro', required: false, init: 'TableViewRow' }
  , data: { is: 'ro', required: true, init: { } }
  , mapping: { is: 'ro', required: true, init: { } }
  , layout: { is: 'ro', required: true, init: { } }
  }
  
, after: {
    initialize: function () {
      this.render();
    }
  }
  
, methods: {
    BUILD: function (data, layout, mapping, config) {
      return { data: data, layout: layout, mapping: mapping, origConfig: config };
    }
  , render: function () {
      this.layout.each(function (item) {
        var param = { };
        param[this.mapping[item.name].attribute] = (this.data[this.mapping[item.name].field] || iQue.i18n(this.mapping[item.name]['default']));
        this.tiCtrl.add(item.builder(apply(param, item.config)));
      }, this);
      this.render = function () { };
    }
  }
});
