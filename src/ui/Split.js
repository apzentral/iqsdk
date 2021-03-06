Class('iQ.ui.Split', {
  isa: iQ.ui.Window

, has: {
    masterView: { is: 'ro', required: false }
  , detailView: { is: 'ro', required: false }
  }

, have: {
    tiClass: 'SplitView'
  , tiFactory: Ti.UI.iPad.createSplitWindow
  , splitPopover:  null
  }

, before: {
    construct: function () {
      this.masterView = iQ.buildComponent({
        name: 'navigation'
      , builder: iQ.ui.Navigation
      , view: this.origConfig.views.master
      });
      this.origConfig.config.masterView = this.masterView.tiCtrl;

      this.detailView = iQ.buildComponent({
        name: 'navigation'
      , builder: iQ.ui.Navigation
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
    
  , listen: function () {
      this.on('visible', this.onOrientationChange, this);
    }
  }

, methods: {
    openWindow: function (win, loc) {
      this[loc == 'master' ? 'masterView' : 'detailView'].open(win);
    }
  , closeWindow: function (win, loc) {
      this[loc == 'master' ? 'masterView' : 'detailView'].close(win);
    }
    
  , hidePopover: function () {
      if (this.splitPopover) {
        this.info("Hiding popover");
        this.splitPopover.hidePopover();
      } else {
        this.error("No popover object allocated for SplitView");
      }
    }
    
  , onOrientationChange: function (ev) {
      this.dumpObject(ev);
      if (ev.view == 'detail') {
        ev.button.title = iQ.i18n(this.origConfig.popoverButton.title);
        this.detailView.window.tiCtrl.leftNavButton = ev.button;
      } else if (ev.view == 'master') {
        this.detailView.window.tiCtrl.leftNavButton = null;
      } else if (ev.view == 'popover') {
        this.splitPopover = ev.popover;
      }
    }
  }
});
