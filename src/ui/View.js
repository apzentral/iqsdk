Class('iQ.ui.View', {
  isa: iQ.ui.Component
  
, does: iQ.role.Components
  
, has: {
    data: { is: 'ro', required: false }
  , dataSource: { is: 'ro', required: false, init: null }
  }
  
, have: {
    tiClass: 'View'
  , tiFactory: Ti.UI.createView
  }

, before: {
    initialize: function () {
      this.dataSource = this.origConfig.dataSource;
      this.mapping = this.origConfig.mapping;
    }
  }

, after: {
    render: function () {
      this.debug("Rendering components...");
      var mapping = this.mapping || { };
      this.getData();
      this.components = { };
      this.origConfig.components = this.origConfig.components || [ ];
      this.origConfig.components.each(function (item) {
        this.debug("Building " + item.name);
        try {
          var param = apply({ }, item);
          var map = mapping[item.name];
          map && [ map ].flatten().each(function (mi) {
            param.config[mi.attribute] = this.convertDataValue(this.data[mi.field], mi.format, mi['default']);
          }, this);
          param.parent = this;
          this.add(iQ.buildComponent(param, this.origParams));
        } catch (ex) {
          this.error("Exception during component build process:");
          this.error(ex);
        }
      }, this);
      return true;
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('@')) return this.components;
      else return this.SUPER(item);
    }
  }

, methods: {
    getData: function () {
      if (!this.data && this.dataSource)
        this.data = isFunction(this.dataSource) ? this.dataSource() : this.dataSource;
      else
        this.data = this.data || [ ];
      return this.data;
    }

  , doAdd: function (view, idx) {
      this.tiCtrl.add(view.tiCtrl || view);
    }
  , doRemove: function (view, idx) {
      this.tiCtrl.remove(view.tiCtrl || view);
    }
    
  , convertDataValue: function (val, format, dflt) {
      format && (format = isFunction(format) ? format : format.format);
      if (val === undefined)
        val = dflt;
      if (isFunction(format))
        val = format(val);
      return val;
    }
  }
});
