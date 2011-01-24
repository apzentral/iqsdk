Class('iQ.ui.Popover', {
  isa: iQ.ui.Window

, has: {
  }

, have: {
    tiClass: 'Popover'
  , tiFactory: Ti.UI.iPad.createPopover
  , navCtrl: null
  , windows: null
  }

, methods: {
    open: function () {
      this.error("You can't open a popover");
      this.show();
    }
  , close: function () {
      this.error("You can't close a popover");
      this.hide();
    }
  , setWidth: function (w) {
      return this.tiCtrl.setWidth(w);
    }
  , setHeight: function (h) {
      return this.tiCtrl.setHeight(h);
    }
  }
});
