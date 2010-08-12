Class('iQue.UI.Window', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'Window' }
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title');
      this.__themeStrings.push('barImage');
    }
  }

, methods: {
    open: function () {
      this.tiCtrl.open(); 
    }
  }
});
