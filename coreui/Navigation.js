Class('iQue.UI.Navigation', {
  isa: iQue.UI.Window

, has: {
    window: { is: 'ro', required: false, init: null }
  }

, have: {
    tiClass: 'SplitView'
  , tiFactory: Ti.UI.iPhone.createNavigationGroup
  }

, before: {
    construct: function () {
      this.origConfig.config.window = (this.window = iQue.buildComponent(this.origConfig.view)).tiCtrl;
      return true;
    }
  }

, override: {
    iqueAxis: function (item) {
      if (item.startsWith('@')) return this.window.components;
      else if (item.startsWith('*')) return this.window.controls;
      else return this.SUPER(item);
    }
  }
  
, methods: {
    open: function (win) {
      return this.tiCtrl.open(win ? (win.tiCtrl || win) : this.window);
    }
  }
});
