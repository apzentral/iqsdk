Class('iQ.ui.TableView', {
  isa: iQ.ui.View
  
, has: {
    rows: { is: 'ro', required: false, init: null }
  , layouts: { is: 'ro', required: false, init: { } }
  }
  
, have: {
    tiClass: 'TableView'
  , tiFactory: Ti.UI.createTableView
  }

, before: {
    initialize: function () {
      this.dataSource = this.origConfig.dataSource;
    }
  , construct: function () {
      this.rows = { };
    }
  }

, after: {
    render: function () {
      this.renderRows();
      return true;
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('$')) return this.rows;
      else return this.SUPER(item);
    }
  }

, methods: {
    refresh: function () {
      this.tiCtrl.setData([ ]);
      this.data = null;
      this.renderRows();
    }
  , renderRows: function () {
      this.getData().each(this.renderRow, this);
    }
  , renderRow: function (item, idx) {
      var className = item.className || 'default';
      var rowConfig = this.origConfig.rowClasses[className];
      this.debug("Rendering row of class " + className);
      item.rowIndex = idx;
      var row = new iQ.ui.TableView.Row(item, apply({ parent: this }, rowConfig), className);
      row.parent = this;
      this.rows[item.name] = row;
      this.appendRow(row);
    }

  , appendRow: function (row) {
      return this.tiCtrl.appendRow(row.tiCtrl || row);
    }
  }
});

Class('iQ.ui.GroupedView', {
  isa: iQ.ui.TableView

, has: {
    sections: { is: 'ro', required: false, init: null }
  }

, before: {
    construct: function () {
      this.sections = { };
      this.origConfig.dynamic = this.origConfig.dynamic || { };
      this.origConfig.dynamic.data = {
        generator: this.renderSections
      , scope: this
      };
    }
  }

, override: {
    refresh: function () {
      this.data = null;
      this.tiCtrl.setData(this.renderSections().pluck('tiCtrl'));
    }
  , renderRows: function () {
      this.debug("Rendering rows...");
      this.getData().rows.each(this.renderRow, this);
    }
  , appendRow: function (row) {
      this.debug("Appending row " + row + " to section " + row.data.section);
      this.sections[row.data.section].appendRow(row);
    }
  , initConfig: function (config) {
      config.style = Ti.UI.iPhone.TableViewStyle.GROUPED;
      return config;
    }
  , uiAxis: function (item) {
      if (item.startsWith('%')) return this.sections;
      else return this.SUPER(item);
    }
  }

, methods: {
    renderSections: function () {
      this.debug("Rendering sections...");
      return this.getData().sections.collect(this.renderSection, this).pluck('tiCtrl');
    }
  , renderSection: function (item) {
      var className = item.className || 'default';
      var sectionConfig = this.origConfig.sectionClasses[className];
      var section;
      this.debug("Rendering section " + item.name + " of class " + className);
      section = new iQ.ui.TableView.Section(item, apply({ parent: this }, sectionConfig), className);
      this.sections[item.name] = section;
      return section;
    }
  , appendSection: function (section) {
      this.add(section);
    }
  }
});

Class('iQ.ui.TableView.Section', {
  isa: iQ.ui.View

, has: {
    sectionClass: { is: 'ro', required: true, init: 'default' }
  , mapping: { is: 'ro', required: true, init: { } }
  , layout: { is: 'ro', required: true, init: null }
  , view: { is: 'ro', required: false }
  }
  
, have: {
    tiClass: 'TableViewSection'
  , tiFactory: Ti.UI.createTableViewSection
  }

, override: {
    BUILD: function (data, config, sectionClass) {
      this.layout = config.layout;
      this.mapping = config.mapping;
      this.data = data;
      this.parent = config.parent;
      var o = this.SUPER(config);
      o.origConfig.config.sectionClass = sectionClass;
      return apply(o, {
        data: data
      , sectionClass: sectionClass
      , layout: config.layout
      , mapping: config.mapping 
      });
    }
  , initConfig: function (config) {
      if (this.layout) return config;
      this.mapping.headerTitle && apply(config, {
        headerTitle: this.data[this.mapping.headerTitle.field]
      });
      this.mapping.footerTitle && apply(config, {
        footerTitle: this.data[this.mapping.footerTitle.field]
      });
      return config;
    }
  }  

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'headerTitle', 'footerTitle');
    }
  , render: function () {
      var layout = this.layout;
      var mapping = this.mapping || { };
      if (!layout)
        return true;
      if (this.origConfig.wrap)
        this.view = Ti.UI.createView({ height: 'auto' });
      layout.each(function (item) {
        var params = { };
        var map = mapping[item.name];
        map && [ map ].flatten().each(function (mi) {
          params[mi.attribute] = this.convertDataValue(this.data[mi.field], mi.format, mi['default']);
        }, this);
        item = apply({ parent: this }, item);
        apply(item.config, params);
        var component = this.components[item.name] = iQ.buildComponent(item);
        if (this.origConfig.wrap)
          this.view.add(component);
        else
          this.add(component);
      }, this);
      if (this.origConfig.wrap)
        this.add(this.view);
      return true;
    }
  }
});

Class('iQ.ui.TableView.Row', {
  isa: iQ.ui.TableView.Section

, has: {
    rowClass: { is: 'ro', required: true, init: 'default' }
  }
  
, have: {
    tiClass: 'TableViewRow'
  , tiFactory: Ti.UI.createTableViewRow
  }
  
, hasnt: [ 'sectionClass' ]

, override: {
    BUILD: function (data, config, rowClass) {
      var o = this.SUPER(data, config, rowClass);
      apply(o.origConfig.config, {
        rowClass: rowClass
      , iQData: data
      });
      return apply(o, {
        data: data
      , rowClass: rowClass
      , layout: config.layout
      , mapping: config.mapping 
      });
    }
  , initConfig: function (config) {
      if (this.layout) return config;
      config.title = this.data[this.mapping.title.field];
      if (this.mapping.leftImage) config.leftImage = this.data[this.mapping.leftImage.field];
      if (this.mapping.rightImage) config.rightImage = this.data[this.mapping.rightImage.field];
      return config;
    }
  }  
});
