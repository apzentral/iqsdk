Class('iQue.UI.TableView', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'TableView' }
  , rows: { is: 'ro', required: false, init: null }
  , data: { is: 'ro', required: false, init: null }
  , layouts: { is: 'ro', required: false, init: { } }
  }

, before: {
    construct: function () {
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
    iqueAxis: function (item) {
      if (item.startsWith('$')) return this.rows;
      else return this.SUPER(item);
    }
  }

, methods: {
    getData: function () {
      this.data = this.data || [ ];
      return this.data;
    }

  , renderRows: function () {
      this.getData().each(this.renderRow, this);
    }
  , renderRow: function (item) {
      var className = item.className || 'default';
      var rowConfig = this.origConfig.rowClasses[className];
      this.debug("Rendering row of class " + className);
      var row = new iQue.UI.TableView.Row(item, apply({ parent: this }, rowConfig), className);
      row.parent = this;
      this.rows[item.name] = row;
      this.appendRow(row);
    }

  , appendRow: function (row) {
      return this.tiCtrl.appendRow(row.tiCtrl || row);
    }
  }
});

Class('iQue.UI.GroupedView', {
  isa: iQue.UI.TableView

, has: {
    sections: { is: 'ro', required: false, init: null }
  }

, before: {
    construct: function () {
      this.sections = { };
      this.origConfig.dynamic = this.origConfig.dynamic || [ ];
      this.origConfig.dynamic.push({
        attribute: 'data'
      , generator: this.renderSections.bind(this)
      });
    }
  }

, override: {
    renderRows: function () {
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
  , iqueAxis: function (item) {
      if (item.startsWith('%')) return this.sections;
      else return this.SUPER(item);
    }
  }

, methods: {
    renderSections: function (item) {
      this.debug("Rendering sections...");
      return this.getData().sections.collect(this.renderSection, this).pluck('tiCtrl');
    }
  , renderSection: function (item) {
      var className = item.className || 'default';
      var sectionConfig = this.origConfig.sectionClasses[className];
      var section;
      this.debug("Rendering section " + item.name + " of class " + className);
      section = new iQue.UI.TableView.Section(item, apply({ parent: this }, sectionConfig), className);
      this.sections[item.name] = section;
      // this.appendSection(section);
      return section;
    }
  , appendSection: function (section) {
      // this.add(section);
    }
  }
});

Class('iQue.UI.TableView.Section', {
  isa: iQue.UI.View

, has: {
    tiClass: { is: 'ro', required: false, init: 'TableViewSection' }
  , sectionClass: { is: 'ro', required: true, init: 'default' }
  , data: { is: 'ro', required: true, init: { } }
  , mapping: { is: 'ro', required: true, init: { } }
  , layout: { is: 'ro', required: true, init: null }
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
      var mapping = this.mapping;
      layout && layout.each(function (item) {
        var param = { };
        var map = mapping[item.name];
        map && [ map ].flatten().each(function (mi) {
          var val = this.data[mi.field];
          if (val === undefined)
            val = iQue.i18n(mi['default']);
          if (isString(mi.format))
            val = mi.format.format(val);
          else if (isFunction(mi.format))
            val = mi.format(val);
          param[mi.attribute] = val;
        }, this);
        this.add(this.components[item.name] = item.builder(apply(param, item.config)));
      }, this);
      return true;
    }
  }

, methods: {
    appendRow: function (row) {
      return this.tiCtrl.add(row.tiCtrl || row);
    }
  }
});

Class('iQue.UI.TableView.Row', {
  isa: iQue.UI.TableView.Section

, has: {
    tiClass: { is: 'ro', required: false, init: 'TableViewRow' }
  , rowClass: { is: 'ro', required: true, init: 'default' }
  }
  
, hasnt: [ 'sectionClass' ]

, override: {
    BUILD: function (data, config, rowClass) {
      var o = this.SUPER(data, config, rowClass);
      apply(o.origConfig.config, {
        rowClass: rowClass
      , iQueData: data
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
