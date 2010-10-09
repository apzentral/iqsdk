Class('iQ.ui.TabGroup', {
  isa: iQ.ui.View
  
, has: {
    tabs: { is: 'ro', required: false, init: null }
  , windows: { is: 'ro', required: false, init: null }
  }
  
, have: {
    tiClass: 'TabGroup'
  , tiFactory: Ti.UI.createTabGroup
  }

, after: {
    render: function () {
      this.debug("Rendering tabs...");
      this.tabs = { };
      this.windows = { };
      this.origConfig.tabs.each(function (cfg) {
        try {
          cfg.builder = iQ.ui.Tab;
          this.addTab(iQ.buildComponent(cfg, this.origParams));
        } catch (ex) {
          this.error("Exception creating tab %s:".format(cfg ? cfg.name : cfg));
          this.logException(ex);
        }
      }, this);
      this.debug("Tabs rendered");
      return true;
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('@')) return this.tabs;
      else return this.SUPER(item);
    }
  }

, methods: {
    open: function () {
      this.tiCtrl.open();
    }
    
  , addTab: function (tab) {
      for (var i = 0; i < arguments.length; i++) {
        var view = arguments[i];
        if (!view) continue;
        var name = view.origConfig ? view.origConfig.name : Object.numericKeys(this.tabs).length;
        view.parent = this;
        this.tabs[name] = view;
        try {
          this.tiCtrl.addTab(view.tiCtrl || view);
        } catch (ex) {
          this.error("Error during adding tiCtrl to the TabGroup:");
          this.logException(ex);
        }
      }
      return this;
    }

  , removeTab: function () {
      for (var i = 0; i < arguments.length; i++) {
        var view = arguments[i];
        if (!view) continue;
        var name = view.origConfig.name;
        var tab = this.tabs[name];
        if (!tab || tab != view)
          tab = this.tabs[this.tabs.indexOf(tab)];
        if (!tab) {
          this.error("Can't remove tab %s: not found in the tab group".format(view.name));
        } else {
          view.parent = null;
          delete this.tabs[name];
        }
        try {
          this.tiCtrl.removeTab(view.tiCtrl || view);
        } catch (ex) {
          this.error("Error during removing tiCtrl from TabGroup:");
          this.logException(ex);
        }
      }
      return this;
    }

  , getActiveWindow: function () {
      return this.windows[this.getActiveTab().name];
    }
  , getActiveTab: function () {
      return this.tiCtrl.activeTab;
    }
  , setActiveTab: function (idx) {
      return this.tiCtrl.setActiveTab(idx);
    }
  }
});

Class('iQ.ui.Tab', {
  isa: iQ.ui.View
  
, has: {
    view: { is: 'ro', required: false, init: null }
  }
  
, have: {
    tiClass: 'Tab'
  , tiFactory: Ti.UI.createTab
  }

, before: {
    construct: function () {
      try {
        var cfg = this.origConfig.config;
        var viewCfg = this.origConfig.window || { };
        viewCfg.name = viewCfg.name || cfg.name;
        viewCfg.builder = viewCfg.builder || iQ.ui.Window;
        this.view = iQ.buildComponent(viewCfg);
        cfg.window = this.view.tiCtrl;
      } catch (ex) {
        this.error("Error rendering tab view:");
        this.logException(ex);
      };
    }
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'badge');
      this.__themeStrings.push('icon');
    }
  }
  
, override: {
    uiAxis: function (item) {
      if (!item.startsWith('^')) return this.view;
      else return this.SUPER(item);
    }
  }
  
, methods: {
    open: function (win) {
      return this.tiCtrl.open(win.tiCtrl || win);
    }
  }
});
