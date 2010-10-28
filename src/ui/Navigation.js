Class('iQ.ui.Navigation', {
  isa: iQ.ui.Window

, has: {
    window: { is: 'ro', required: false, init: null }
  }

, have: {
    tiClass: 'SplitView'
  , tiFactory: Ti.UI.iPhone.createNavigationGroup
  }

, before: {
    construct: function () {
      var viewCfg = apply({ }, this.origConfig.view);
      viewCfg.parent = this;
      this.window = iQ.buildComponent(viewCfg);
      this.origConfig.config.window = this.window.tiCtrl;
      return true;
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('@')) return this.window.components;
      else if (item.startsWith('*')) return this.window.controls;
      else return this.SUPER(item);
    }
  }
  
, methods: {
    open: function (win) {
      return this.tiCtrl.open(win ? (win.tiCtrl || win) : (this.window.tiCtrl || this.window));
    }
  }
});
