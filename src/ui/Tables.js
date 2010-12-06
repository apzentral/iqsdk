Class('iQ.ui.TableView', {
  isa: iQ.ui.View
  
, has: {
    rows: { is: 'ro', required: false, init: null }
  , layouts: { is: 'ro', required: false, init: null }
  , paging: { is: 'ro', required: false }
  }
  
, have: {
    tiClass: 'TableView'
  , tiFactory: Ti.UI.createTableView
  , useDataSource: true
  }

, before: {
    initialize: function () {
      this.paging = this.origConfig.paging || { };
      this.paging.pagesOpened = 1;
    }
  , construct: function () {
      this.rows = [ ];
    }
  }

, after: {
    render: function () {
      this.empty(false);
      this.renderRows();
      return true;
    }
  , onDataAvailable: function () {
      this.debug("New data for the table are available");
      this.empty(false);
      this.renderRows();
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('$')) return this.rows;
      else return this.SUPER(item);
    }
  }

, methods: {
    empty: function (emptyData) {
      this.debug("Emptying the table");
      this.rows = [ ];
      this.tiCtrl.setData([ ]);
      if (emptyData !== false)
        this.data = null;
    }
  , refresh: function () {
      this.empty();
      this.renderRows();
    }
  , renderRows: function (page) {
      this.info("Rendering rows...");
      var data = this.getData();
      if (data instanceof iQ.data.DataSource)
        data = data.getRecords();
      var len = data.length;
      if (this.paging.use)
        data = data.slice(0, this.paging.pageSize * this.paging.pagesOpened);
      data.each(this.renderRow, this);
      //this.tiCtrl.setData(this.rows);
      //if (this.paging.use && len > this.paging.pageSize * this.paging.pagesOpened)
      //  this.renderRow({ className: 'pager' });
    }
  , renderRow: function (item, idx, suppressAppend) {
      var className = ((item instanceof iQ.data.Record) ? item.getValue('className') : item.className) || 'default';
      var rowConfig = this.origConfig.rowClasses[className] || { };
      this.debug("Rendering row of class " + className);
      item.rowIndex = idx;
      var row = new iQ.ui.TableView.Row(item, apply({ parent: this }, rowConfig), className);
      row.parent = this;
      this.rows[idx] = row;
      if (suppressAppend !== true)
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
        headerTitle: this.data.getValue(this.mapping.headerTitle.field || this.mapping.headerTitle)
      });
      this.mapping.footerTitle && apply(config, {
        footerTitle: this.data.getValue(this.mapping.footerTitle.field || this.mapping.footerTitle)
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
          var val;
          if (mi.handler)
            val = this.data[mi.handler]();
          else if (this.data instanceof iQ.data.Record)
            val = this.data.getValue(mi.field);
          else 
            val = this.data[mi.field];
          params[mi.attribute] = this.convertDataValue(val, mi.format, mi['default']);
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

, after: {
    initStrings: function () {
      this.__themeStrings.push('leftImage', 'rightImage');
    }
  }

, override: {
    BUILD: function (data, config, rowClass) {
      var o = this.SUPER(data, config, rowClass);
      apply(o.origConfig.config, {
        rowClass: rowClass
      , iQData: data.data || data
      });
      return apply(o, {
        data: data
      , rowClass: rowClass
      , layout: config.layout
      , mapping: config.mapping || { }
      });
    }
  , initConfig: function (config) {
      if (this.layout) return config;
      config = apply({ }, config);
      var m = this.mapping;
      var d = this.data;
      function _get(f) {
        f = m[f].field || m[f];
        if (d instanceof iQ.data.Record)
          return d.getValue(f);
        else
          return d[f];
      }
      
      if (m.title) config.title = _get('title');
      if (m.leftImage) config.leftImage = _get('leftImage');
      if (m.rightImage) config.rightImage = _get('rightImage');
      return config;
    }
  }  
});
