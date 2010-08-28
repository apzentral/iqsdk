
Class('iQue.UI.ButtonBar', {
  isa: iQue.UI.View

, have: {
    tiClass: 'ButtonBar'
  , tiFactory: Ti.UI.createButtonBar
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('labels');
    }
  }
});
