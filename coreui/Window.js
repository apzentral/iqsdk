Class('iQue.UI.Window', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'Window' }
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'titlePrompt', 'backButtonRitle');
      this.__themeStrings.push('barImage', 'titleImage', 'backButtonTitleImage');
    }
  }

, methods: {
    open: function () {
      this.tiCtrl.open(); 
    }
  , setTitle: function (title) {
      this.tiCtrl.setTitle(title);
    }
  }
});
