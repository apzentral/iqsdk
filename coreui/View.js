Class('iQue.UI.View', {
  isa: iQue.UI.Control
  
, has: {
    tiClass: 'View'
  , tiFactory: Ti.UI.createView
  , components: { is: 'ro', required: false, init: null }
  }

, after: {
    render: function () {
      this.debug("Rendering components...");
      this.components = { };
      this.origConfig.components = this.origConfig.components || [ ];
      this.origConfig.components.each(function (item) {
        this.debug("Building " + item.name);
        var constructor = item.builder;
        if (!isFunction(constructor))
          return this.error("Component " + item.name + " does not supply proper constructor");
        try {
          this.add(new constructor(apply({ parent: this }, item), this.origParams));
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
    add: function () {
      for (var i = 0; i < arguments.length; i++) {
        var view = arguments[i];
        if (!view) continue;
        this.components[view.name || i] = view;
        this.doAdd(view, i);
      }
      return this;
    }
  , remove: function () {
      for (var i = 0; i < arguments.length; i++) {
        var view = arguments[i];
        if (!view) continue;
        delete this.components[view.name || i];
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
  }
});
