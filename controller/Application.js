
Class('iQue.Application', {
  does: iQue.R.Logging

, has: {
    view: { required: false, init: null }
  , layout: { required: false, init: null }
  }

, methods: {
    start: function () {
      if (!this.loadData() || !this.loadApplication())
        this.panic("Application is unable to load");
    }

  , getWindow: function (name) {
      return this.view.iquePath('@' + name);
    }
  , createWindow: function (layout, params) {
      return this.openWindow(iQue.buildComponent(layout, params));
    }
  , openWindow: function (win) {
      if (!this.hasTabsLayout()) {
        var msg = "Application#openWindow function shouldn't be called for non-tab application layouts";
        this.error(msg);
        throw msg;
      }
      var origWin = this.view.getActiveWindow();
      var name = win.getName();
      Ti.Analytics.navEvent(origWin.getName(), name, 'nav.' + name, null);
      return this.getActiveTab().open(win.tiCtrl);
    }
    
  , getActiveTab: function () {
      if (!this.hasTabsLayout()) {
        var msg = "Application#getActiveTab function shouldn't be called for non-tab application layouts";
        this.error(msg);
        throw msg;
      }
      return this.view.getActiveTab();
    }
  , setActiveTab: function (idx) {
      if (!this.hasTabsLayout()) {
        var msg = "Application#setActiveTab function shouldn't be called for non-tab application layouts";
        this.error(msg);
        throw msg;
      }
      return this.view.setActiveTab(idx);
    }

  , loadLayout: function () {
      return this.layouts.root;
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
        this.layout = this.loadLayout();
        switch (this.layout.type) {
          case 'split': this.layout.builder = iQue.UI.SplitView; break;
          case 'tabs': this.layout.builder = iQue.UI.TabGroup; break;
        }
        this.view = iQue.buildComponent(this.layout, { });
        this.view.open();
      } catch (ex) {
        this.error("Failed to load application interface, exception raised:");
        this.error(ex);
        this.view = null;
        return false;
      }
      return true;
    }
    
  , hasTabsLayout: function () {
      return this.layout.type == 'tabs';
    }
  , hadSplitLayout: function () {
      return this.layout.type == 'split';
    }
  , hasCustomLayout: function () {
      return this.layout.type != 'tabs' && this.layout.type != 'split';
    }
  , iquePath: function (path) {
      return this.view.iquePath(path);
    }
  }
});
