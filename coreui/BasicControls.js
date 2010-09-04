
Class('iQue.UI.Label', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'Label'
  , tiFactory: Ti.UI.createLabel
  }
  
, after: {
    initStrings: function () {
      this.__i18nStrings.push('text');
    }
  }

, methods: {
    setText: function (text) {
      return this.tiCtrl.setText(iQue.i18n(text));
    }
  }
});


Class('iQue.UI.Button', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'Button'
  , tiFactory: Ti.UI.createButton
  }

, does: iQue.R.UI.Enabling

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title');
      this.__themeStrings.push('image');
    }
  }
  
, methods: {
    setImage: function (img) {
      return this.tiCtrl.setImage(iQue.theme(img));
    }
  , setText: function (text) {
      return this.tiCtrl.setText(iQue.i18n(text));
    }
  }
});


Class('iQue.UI.Progress', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'ProgressBar'
  , tiFactory: Ti.UI.createProgressBar
  }
  
, does: iQue.R.UI.Value

, after: {
    initStrings: function () {
      this.__i18nStrings.push('message');
    }
  }
});



Class('iQue.UI.ActivityIndicator', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'ActivityIndicator'
  , tiFactory: Ti.UI.createActivityIndicator
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('message');
    }
  }
});



Class('iQue.UI.iAd', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'AdView'
  , tiFactory: Ti.UI.createAdView
  }

, methods: {
    cancelAction: function () {
      this.tiCtrl.cancelAction();
    }
  }
});
