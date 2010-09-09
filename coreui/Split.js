Class('iQue.UI.Split', {
  isa: iQue.UI.Window

, has: {
    masterView: { is: 'ro', required: false, init: null }
  , detailView: { is: 'ro', required: false, init: null }
  }

, have: {
    tiClass: 'SplitView'
  , tiFactory: Ti.UI.iPad.createSplitWindow
  }

, before: {
    construct: function () {
      this.masterView = iQue.buildComponent({
        name: 'navigation'
      , builder: iQue.UI.Navigation
      , view: this.origConfig.views.master
      });
      this.origConfig.config.masterView = this.masterView.tiCtrl;

      this.detailView = iQue.buildComponent({
        name: 'navigation'
      , builder: iQue.UI.Navigation
      , view: this.origConfig.views.detail
      });
      this.origConfig.config.detailView = this.detailView.tiCtrl;

      return true;
    }
  }

, after: {
    render: function () {
      this.debug("Rendering split view...");
      this.components['master'] = this.masterView;
      this.components['detail'] = this.detailView;
      this.debug("Split view rendered");
      return true;
    }
  }

, methods: {
    openWindow: function (win, loc) {
      this[loc == 'detail' ? 'detailView' : 'masterView'].open(win);
    }
  }
});
