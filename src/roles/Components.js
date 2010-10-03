Role('iQ.role.Components', {
  have: {
    components: null
  }
  
, methods: {
    add: function () {
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
  , doAdd: function () { }
  , doRemove: function () { }
  }
});
