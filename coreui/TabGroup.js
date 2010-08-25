Class('iQue.UI.TabGroup', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'TabGroup' }
  , tabs: { is: 'ro', required: false, init: null }
  , windows: { is: 'ro', required: false, init: null }
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
        this.tiCtrl.addTab(tab);
        this.tabs[cfg.name] = tab;
        this.windows[cfg.name] = win;
      }, this);
      return true;
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
