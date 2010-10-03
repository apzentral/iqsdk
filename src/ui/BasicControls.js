
Class('iQ.ui.Label', {
  isa: iQ.ui.Component

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
      return this.tiCtrl.setText(iQ.i18n(text));
    }
  }
});


Class('iQ.ui.Button', {
  isa: iQ.ui.Component

, have: {
    tiClass: 'Button'
  , tiFactory: Ti.UI.createButton
  }

, does: iQ.role.UI.Enabling

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title');
      this.__themeStrings.push('image');
    }
  }
  
, methods: {
    setImage: function (img) {
      return this.tiCtrl.setImage(iQ.theme(img));
    }
  , setText: function (text) {
      return this.tiCtrl.setText(iQ.i18n(text));
    }
  }
});


Class('iQ.ui.Progress', {
  isa: iQ.ui.Component

, have: {
    tiClass: 'ProgressBar'
  , tiFactory: Ti.UI.createProgressBar
  }
  
, does: iQ.role.UI.Value

, after: {
    initStrings: function () {
      this.__i18nStrings.push('message');
    }
  }
});



Class('iQ.ui.ActivityIndicator', {
  isa: iQ.ui.Component

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



Class('iQ.ui.iAd', {
  isa: iQ.ui.Component

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
