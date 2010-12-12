Class('iQ.ui.View', {
  isa: iQ.ui.Component
  
, has: {
    data: { is: 'ro', required: false }
  , dataSource: { is: 'rw', required: false, init: null }
  }
  
, have: {
    tiClass: 'View'
  , tiFactory: Ti.UI.createView
  , useDataSource: false
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
          this.logException(ex);
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
      if (!this.data && this.useDataSource) {
        this.meta.extend({ does: iQ.role.EventEmitter });
        this.eventListeners = { };
        this.setDataSource(this.dataSource);
      } else {
        this.data = this.data || [ ];
      }
      return this.data;
    }
  , setDataSource: function (dataSource) {
      this.debug("Setting new dataSource");
      this.dataSource = dataSource;
      if (isFunction(this.dataSource)) {
        var data = this.dataSource();
        if (isArray(data)) {
          this.data = new iQ.data.DataSource();
          this.data.addData(data, null, true);
        } else {
          this.data = data;
        }
      } else if (isString(this.dataSource) && this.dataSource.startsWith('http')) {
        var m = this.dataSource.replace(/^https?:\/\//, '').split('/');
        this.data = new iQ.data.RemoteObject({
          server: m.shift()
        , url: '/' + m.join('/')
        , callback: this.onDataAvailable
        , scope: this
        });
      } else if (isString(this.dataSource) && this.dataSource.startsWith('store://')) {
        this.data = iQ.data.DataSource.getSource(this.dataSource);
      } else {
        this.data = this.dataSource;
      }
      if (!this.data)
        this.data = new iQ.data.DataSource();
      if (this.data instanceof iQ.data.DataSource) {
        this.onDataAvailable();
        this.data.on('dataUpdated', this.onDataAvailable, this);
        this.data.on('filterUpdated', this.onDataAvailable, this);
        this.data.on('dataFailure', this.onDataFailure, this);
      } else {
        this.onDataAvailable();
      }
    }
  , onDataAvailable: function (data) {
      this.debug("New data available for the view; updating...");
    }
  , onDataFailure: function (ev) {
      this.error("Failed to get the data");
      this.fireEvent('dataFailure', ev);
    }

  , add: function () {
      var a = isArray(arguments[0]) ? arguments[0] : arguments;
      for (var i = 0; i < a.length; i++) {
        var view = a[i];
        if (!view) continue;
        var name = view.origConfig ? view.origConfig.name : Object.numericKeys(this.components).length;
        view.parent = this;
        this.components[name] = view;
        this.doAdd(view, i);
      }
      return this;
    }
  , remove: function () {
      var a = isArray(arguments[0]) ? arguments[0] : arguments;
      for (var i = 0; i < a.length; i++) {
        var view = a[i];
        if (!view) continue;
        var name = view.origConfig.name;
        var ctrl = this.components[name];
        if (!ctrl || ctrl != view)
          ctrl = this.components[this.components.indexOf(ctrl)];
        if (!ctrl) {
          this.error("Can't remove component %s: not found".format(view.name));
        } else {
          view.parent = null;
          delete this.components[name];
        }
        this.doRemove(view, i);
      }
      return this;
    }

  , doAdd: function (view, idx) {
      try {
        this.tiCtrl.add(view.tiCtrl || view);
      } catch (ex) {
        this.error("Error during adding tiCtrl:");
        this.logException(ex);
      }
    }
  , doRemove: function (view, idx) {
      try {
        this.tiCtrl.remove(view.tiCtrl || view);
      } catch (ex) {
        this.error("Error during removing tiCtrl:");
        this.logException(ex);
      }
    }
    
  , convertDataValue: function (val, format, dflt) {
      if (val === undefined)
        val = dflt;
      if (!format) return val;
      if (isFunction(format))
        val = format(val);
      else if (isFunction(format.format))
        val = format.format(val);
      return val;
    }
  }
});
