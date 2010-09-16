Class('iQue.UI.View', {
  isa: iQue.UI.Control
  
, has: {
    components: { is: 'ro', required: false, init: null }
  , data: { is: 'ro', required: false }
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
          this.add(iQue.buildComponent(param, this.origParams));
        } catch (ex) {
          this.error("Exception during component build process:");
          this.error(ex);
        }
      }, this);
      return true;
    }
  }

, override: {
    iqueAxis: function (item) {
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

  , add: function () {
      for (var i = 0; i < arguments.length; i++) {
        var view = arguments[i];
        if (!view) continue;
        var name = view.origConfig ? view.origConfig.name : Object.numericKeys(this.components).length;
        this.components[name] = view;
        this.doAdd(view, i);
      }
      return this;
    }
  , remove: function () {
      for (var i = 0; i < arguments.length; i++) {
        var view = arguments[i];
        if (!view) continue;
        //view.parent = null;
        var name = view.origConfig ? view.origConfig.name : Object.numericKeys(this.components).length;
        delete this.components[name];
        this.doRemove(view, i);
      }
      return this;
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
