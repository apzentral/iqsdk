
iQ.Purchases = {
  init: function () {
    iQ.Purchases.iface = require('iq.modules.storekit');
    iQ.Purchases.queue = iQ.Purchases.iface.defaultPaymentQueue;
    iQ.Purchases.callbacks = { };
    iQ.on(iQ.Purchases.queue, 'purchasing', iQ.Purchases.onPurchasing, iQ.Purchases);
    iQ.on(iQ.Purchases.queue, 'purchased', iQ.Purchases.onPurchased, iQ.Purchases);
    iQ.on(iQ.Purchases.queue, 'restored', iQ.Purchases.onRestored, iQ.Purchases);
    iQ.on(iQ.Purchases.queue, 'failed', iQ.Purchases.onFailed, iQ.Purchases);
    iQ.Purchases.mask = Ti.UI.createWindow({
      backgroundColor: '#80000000',
      top: 0, left: 0, right: 0, bottom: 0
    });
    iQ.Purchases.mask.actInd = Ti.UI.createActivityIndicator({
      width: 'auto', height: 'auto',
      style: Ti.UI.iPhone.ActivityIndicatorStyle.BIG,
      message: 'Processing...',
      color: 'white'
    });
    iQ.Purchases.mask.add(iQ.Purchases.mask.actInd);
  },
  checkFeature: function (id) {
    
  },
  purchaseFeature: function (id, quantity, callback, scope) {
    TheApp.info("Purchasing feature " + id);
    iQ.Purchases.mask.open();
    iQ.Purchases.mask.actInd.show();
    if (!iQ.Purchases.iface.canMakePayments) {
      var alert = new iQ.ui.AlertDialog(TheApp.config.name, '%cantMakeInAppPurchases', [ 'Ok' ], 0);
      alert.on('click', function () {
        iQ.Purchases.mask.close();
      }, TheApp);
      alert.show();
      return false;
    }
    iQ.Purchases.iface.findProducts(id, function (products) {
      iQ.Purchases.callbacks[id] = iQ.Purchases.callbacks[id] || [ ];
      if (isFunction(callback))
        iQ.Purchases.callbacks[id].push(callback.bind(scope || TheApp));
      TheApp.info("Got payments information:")
      TheApp.info(products);
      iQ.Purchases.queue.addPayment(
        iQ.Purchases.iface.createPayment({
          product: products[0].id,
          quantity: quantity || 1
        })
      );
    });
  },
  onPurchasing: function (ev) {
    TheApp.info("Proceeding with purchase for " + ev.purchaseId);
    TheApp.dumpObject(ev);
  },
  onPurchased: function (ev) {
    var id = ev.purchaseId;
    iQ.Purchases.mask.close();
    isArray(callbacks[id]) && callbacks[id].each(function (cb) { 
      try {
        cb(); 
      } catch (ex) {
        TheApp.error("Error executing callback for InApp purchase " + id);
        TheApp.error(ex);
      }
    });
  },
  onRestored: function (ev) {
    var id = ev.purchaseId;
    iQ.Purchases.mask.close();
    isArray(callbacks[id]) && callbacks[id].each(function (cb) { 
      try {
        cb(); 
      } catch (ex) {
        TheApp.error("Error executing callback for InApp purchase " + id);
        TheApp.error(ex);
      }
    });
  },
  onFailed: function (ev) {
    iQ.Purchases.mask.close();
    var alert = Ti.UI.createAlertDialog({ 
      title: "Purchase", 
      message: 'Purchase failed, please try later', 
      buttonNames: [ 'Ok' ], 
      cancel: 0
    });
    alert.show();
  }
};
