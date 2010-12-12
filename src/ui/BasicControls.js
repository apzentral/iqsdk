
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
    getText: function () { return this.getProperty('text'); }
  , setText: function (text) { return this.setProperty('text', text); }

  , getColor: function () { return this.getProperty('color'); }
  , setColor: function (color) { return this.setProperty('color', color); }
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
  , setTitle: function (text) {
      return this.setProperty('title', iQ.i18n(text));
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
