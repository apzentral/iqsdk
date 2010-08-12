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
        var win = new cfg.window.builder(cfg.window);
        var tab = Ti.UI.createTab({
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
    BUILD: function (tabs) {
      return apply({ tabsConfig: tabs }, this.SUPER());
    }
  , open: function () {
      this.tiCtrl.open();
    }
  , getActiveTab: function () {
      return this.tiCtrl.activeTab;
    }
  }
});
