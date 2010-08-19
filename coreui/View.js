Class('iQue.UI.View', {
  isa: iQue.UI.Control
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'View' }
  , components: { is: 'ro', required: false, init: { } }
  }

, after: {
    construct: function () {
      this.debug("Building components...");
      this.origConfig.components = this.origConfig.components || [ ];
      this.origConfig.components.each(function (item) {
        this.debug("Building " + item.name);
        var constructor = item.builder;
        if (!isFunction(constructor))
          return this.error("Component " + item.name + " does not supply proper constructor");
        try {
          this.add(this.components[item.name] = new constructor(apply({ parent: this }, item), this.origParams));
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
        arguments[i] && this.tiCtrl.add(arguments[i].tiCtrl || arguments[i]);
      }
      return this;
    }
  , remove: function () {
      for (var i = 0; i < arguments.length; i++)
        arguments[i] && this.tiCtrl.remove(arguments[i].tiCtrl || arguments[i]);
      return this;
    }
  }
});

Class('iQue.UI.ScrollView', {
  isa: iQue.UI.View
  
, has: {
    tiClass: { is: 'ro', required: false, init: 'ScrollView' }
  }
});
