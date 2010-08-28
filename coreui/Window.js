Class('iQue.UI.Window', {
  isa: iQue.UI.View
  
, has: {
    tiClass: 'Window'
  , tiFactory: Ti.UI.createWindow
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'titlePrompt', 'backButtonTitle');
      this.__themeStrings.push('barImage', 'titleImage', 'backButtonTitleImage');
    }
  }

, methods: {
    open: function () {
      this.tiCtrl.open(); 
    }
  , getName: function () {
      return this.origConfig.name;
    }
  , setTitle: function (title) {
      this.tiCtrl.setTitle(title);
    }
  }
});
