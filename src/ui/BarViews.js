
Class('iQ.ui.ButtonBar', {
  isa: iQ.ui.View

, have: {
    tiClass: 'ButtonBar'
  , tiFactory: Ti.UI.createButtonBar
  }

, before: {
    construct: function () {
      this.origConfig.dynamic = this.origConfig.dynamic || { };
      this.origConfig.dynamic.labels = {
        generator: this.renderLabels,
        scope: this
      };
    }
  }

, after: {
    initStrings: function () {
      //this.__i18nStrings.push('labels');
    }
  }
  
, methods: {
    renderLabels: function () {
      var labels = this.origConfig.buttons || [ ];
      return labels.collect(function (label) {
        if (isString(label))
          return iQ.i18n(label);
        label.image = iQ.theme(label.image);
        label.title = iQ.i18n(label.title);
        label.width = label.width;
        label.enabled = label.enabled;
        return label;
      });
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
