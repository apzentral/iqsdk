
Class('iQue.Application', {
  does: iQue.R.Logging

, has: {
    tabCtrl: { isPrivate: true, required: false, init: null }
  , layout: { required: false, init: null }
  }

, methods: {
    start: function () {
      if (!this.loadData() || !this.loadApplication())
        this.panic("Application is unable to load");
    }

  , getWindow: function (name) {
      return this.__tabCtrl.windows[name];
    }
  , createWindow: function (layout, params) {
      return this.openWindow(iQue.buildComponent(layout, params));
    }
  , openWindow: function (win) {
      var origWin = this.__tabCtrl.getActiveWindow();
      var name = win.getName();
      Ti.Analytics.navEvent(origWin.getName(), name, 'nav.' + name, null);
      return this.getActiveTab().open(win.tiCtrl);
    }
    
  , getActiveTab: function () {
      return this.__tabCtrl.getActiveTab();
    }
  , setActiveTab: function (idx) {
      return this.__tabCtrl.setActiveTab(idx);
    }

  , loadData: function () {
      this.debug("Loading data");
      try {
        this.INNER();
      } catch (ex) {
        this.error("Failed to load data, exception raised:");
        this.error(ex);
        return false;
      }
      return true;
    }
  , loadApplication: function () {
      this.debug("Loading application interface");
      try {
        this.layout = this.layouts.root;
        this.__tabCtrl = iQue.buildComponent(this.layout, { });
        this.__tabCtrl.open();
      } catch (ex) {
        this.error("Failed to load application interface, exception raised:");
        this.error(ex);
        this.__tabCtrl = null;
        return false;
      }
      return true;
    }
  }
});
