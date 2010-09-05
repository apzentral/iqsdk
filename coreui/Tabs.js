Class('iQue.UI.TabGroup', {
  isa: iQue.UI.View
  
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
        var win = new cfg.window.builder(cfg.window);
        var tab = Ti.UI.createTab({
          name: cfg.name,
          icon: iQue.theme(cfg.icon),
          title: iQue.i18n(cfg.title),
          window: win.getTiCtrl()
        });
        this.debug("Tab " + cfg.name + " created");
        this.tiCtrl.addTab(tab);
        this.tabs[cfg.name] = tab;
        this.windows[cfg.name] = win;
      }, this);
      this.debug("Tabs rendered");
      return true;
    }
  }

, override: {
    iqueAxis: function (item) {
      if (item.startsWith('@')) return this.windows;
      else if (item.startsWith('*')) return this.tabs;
      else return this.SUPER(item);
    }
  }

, methods: {
    open: function () {
      this.tiCtrl.open();
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
