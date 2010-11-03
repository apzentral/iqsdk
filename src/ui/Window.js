Class('iQ.ui.Window', {
  isa: iQ.ui.View
  
, has: {
    toolbar: { is: 'ro', required: false }
  }
  
, have: {
    tiClass: 'Window'
  , tiFactory: Ti.UI.createWindow
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'titlePrompt', 'backButtonTitle');
      this.__themeStrings.push('barImage', 'titleImage', 'backButtonTitleImage');
    }
    
  , render: function () {
      var tbconf = this.origConfig.toolbar;
      this.toolbar = { };
      tbconf && this.tiCtrl.setToolbar(tbconf.collect(function (item, idx) {
        if (item == '<=>')
          return Ti.UI.createButton({ systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE });
        try {
          var ctrl = iQ.buildComponen(apply({ parent: this }, item));
          this.toolbar[item.name || idx] = ctrl;
          return ctrl.tiCtrl;
        } catch (ex) {
          this.error("Exception during component build process:");
          this.logException(ex);
          return null;
        }
      }, this).compact());
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('=')) return this.toolbar;
      else return this.SUPER(item);
    }
  }

, methods: {
    open: function () {
      this.tiCtrl.open(); 
    }
  , close: function () {
      this.tiCtrl.close();
    }
  , getName: function () {
      return this.origConfig.name;
    }
  , setTitle: function (title) {
      return this.setProperty('title', iQ.i18n(title));
    }
  }
});
