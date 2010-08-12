Class('iQue.UI.TableView', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'TableView' }
  , data: { is: 'ro', required: false, init: [ ] }
  , layouts: { is: 'ro', required: false, init: { } }
  }

, after: {
    render: function () {
      this.renderRows();
      return true;
    }
  }

, methods: {
    getData: function () {
      this.data = this.data || [ ];
      return this.data;
    }
  
  , renderRows: function () {
      this.getData().each(function (item) {
        var className = item.className || 'default';
        var rowConfig = this.origConfig.rowClasses[className];
        this.appendRow(this.renderRow(item, rowConfig, className));
      }, this);
    }
  , renderRow: function (data, pack, className) {
      if (!pack.layout)
        return apply({ 
          title: data[pack.mapping.title.field]
        , record: data
        , rowClass: className
        }, pack.config);
      return new iQue.UI.TableView.Row(data, pack, className);
    }
    
  , appendRow: function (row) {
      return this.tiCtrl.appendRow(row.tiCtrl || row);
    }
  }
});

Class('iQue.UI.TableView.Row', {
  isa: iQue.UI.View

, has: {
    tiClass: { is: 'ro', required: false, init: 'TableViewRow' }
  , rowClass: { is: 'ro', required: true, init: 'default' }
  , data: { is: 'ro', required: true, init: { } }
  , mapping: { is: 'ro', required: true, init: { } }
  , layout: { is: 'ro', required: true, init: { } }
  }
  
, after: {
    render: function () {
      var layout = this.layout;
      var mapping = this.mapping;
      layout.each(function (item) {
        var param = { };
        param[mapping[item.name].attribute] = 
          (this.data[mapping[item.name].field] ||
           iQue.i18n(mapping[item.name]['default']));
        this.add(item.builder(apply(param, item.config)));
      }, this);
      return true;
    }
  }

, methods: {
    BUILD: function (data, config, rowClass) {
      config.config.rowClass = rowClass;
      return {
        data: data
      , rowClass: rowClass
      , origConfig: config
      , layout: config.layout
      , mapping: config.mapping 
      };
    }
  }
});
