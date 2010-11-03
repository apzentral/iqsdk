
Class('iQ.ui.ButtonBar', {
  isa: iQ.ui.View

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


Class('iQ.ui.TabbedBar', {
  isa: iQ.ui.ButtonBar

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


Class('iQ.ui.ToolBar', {
  isa: iQ.ui.View

, have: {
    tiClass: 'Toolbar'
  , tiFactory: Ti.UI.createToolbar
  }
  
, before: {
    render: function () {
      this.origConfig.components = (this.origConfig.components || [ ]).collect(function (item) {
        if (item == '<=>') 
          return {
            builder: iQ.ui.Button
          , config: { systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE }
          };
        return item;
      });
    }
  }
});


Class('iQ.ui.SearchBar', {
  isa: iQ.ui.View

, have: {
    tiClass: 'SearchBar'
  , tiFactory: Ti.UI.createSearchBar
  }

, does: iQ.role.UI.Focusing

, after: {
    initStrings: function () {
      this.__i18nStrings.push(
        'hintText'
      , 'prompt'
      , 'value'
      );
      this.__themeStrings.push('barImage')
    }
  }

, methods: {
    getValue: function () { return this.tiCtrl.value; }
  , setValue: function (val) { this.tiCtrl.value = val; }
  }
});
