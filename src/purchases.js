
iQ.Purchases = {
  init: function () {
    iQ.Purchases.iface = require('iq.modules.storekit');
    iQ.Purchases.queue = iQ.Purchases.iface.defaultPaymentQueue;
    iQ.Purchases.callbacks = { };
    iQ.on(iQ.Purchases.queue, 'purchasing', iQ.Purchases.onPurchasing, iQ.Purchases);
    iQ.on(iQ.Purchases.queue, 'purchased', iQ.Purchases.onPurchased, iQ.Purchases);
    iQ.on(iQ.Purchases.queue, 'restored', iQ.Purchases.onRestored, iQ.Purchases);
    iQ.on(iQ.Purchases.queue, 'failed', iQ.Purchases.onFailed, iQ.Purchases);
  },
  checkFeature: function (id) {
    
  },
  purchaseFeature: function (id, quantity, callback, scope) {
    TheApp.info("Purchasing feature " + id);
    if (!iQ.Purchases.iface.canMakePayments) {
      var alert = new iQ.ui.AlertDialog(TheApp.config.name, '%cantMakeInAppPurchases', [ 'Ok' ], 0);
      alert.show();
      return false;
    }
    iQ.Purchases.iface.findProducts(id, function (products) {
      iQ.Purchases.callbacks[id] = iQ.Purchases.callbacks[id] || [ ];
      if (isFunction(callback))
        iQ.Purchases.callbacks[id].push(callback.bind(scope || TheApp));
      iQ.Purchases.queue.addPayment(
        iQ.Purchases.createPayment({
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
    
  }
};
