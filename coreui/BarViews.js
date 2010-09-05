
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


Class('iQue.UI.TabbedBar', {
  isa: iQue.UI.ButtonBar

, have: {
    tiClass: 'TabbedBar'
  , tiFactory: Ti.UI.createTabbedBar
  }

, methods: {
    getActiveIndex: function () {
      return this.getProperty('index');
    }
  , setActiveIndex: function (idx) {
      this.setProperty('index', idx);
    }
  }
});


Class('iQue.UI.ToolBar', {
  isa: iQue.UI.View

, have: {
    tiClass: 'Toolbar'
  , tiFactory: Ti.UI.createToolbar
  }
});


Class('iQue.UI.SearchBar', {
  isa: iQue.UI.View

, have: {
    tiClass: 'SearchBar'
  , tiFactory: Ti.UI.createSearchBar
  }

, does: iQue.R.UI.Focusing

, after: {
    initStrings: function () {
      this.__i18nStrings.push(
        'hintText'
      , 'prompt'
      , 'value'
      );
      this.__themeStrings.push('barImage')
    }
  , getValue: function () { return this.tiCtrl.value; }
  , setValue: function (val) { this.tiCtrl.value = val; }
  }
});
