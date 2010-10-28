Class('iQ.ui.Popover', {
  isa: iQ.ui.Window

, has: {
  }

, have: {
    tiClass: 'Popover'
  , tiFactory: Ti.UI.iPad.createPopover
  }

, methods: {
    open: function () {
      this.error("You can't open a popover");
    }
  , close: function () {
      this.error("You can't close a popover");
    }
  , setWidth: function (w) {
      return this.tiCtrl.setWidth(w);
    }
  , setHeight: function (h) {
      return this.tiCtrl.setHeight(h);
    }
  }
});
