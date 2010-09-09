
iQue.DB.PropertiesStore = new (Class({
  VERSION: '0.1'
, AUTHORITY: 'com:dev-ique'

, has: {
  }

, does: iQue.R.Logging

, methods: {
    initialize: function () {
      // NOOP :)
    }
    
  , keys: function () {
      try {
        return Ti.App.Properties.listProperties();
      } catch (ex) {
        this.error("Exception during retrieving key names for the key-value store; defaulting to the empty list");
        this.error(ex);
        return [ ];
      }
    }

  , getArray: function (key) {
      try {
        return Ti.App.Properties.getList(key, [ ]) || [ ];
      } catch (ex) {
        this.error("Exception during reading array key value from the store");
        this.error(ex);
        return [ ];
      }
    }
    
  , setArray: function (key, ary) {
      if (!isArray(ary)) {
        var msg = "Can't save key to the store: the argument is not an array";
        this.error(msg);
        throw msg;
      }
      try {
        Ti.App.Properties.setList(key, ary);
      } catch (ex) {
        this.error("Exception during saving array key value to the store");
        this.error(ex);
        return [ ];
      }
    }
  } 
})) ();
