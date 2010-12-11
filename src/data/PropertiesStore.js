
iQ.data.PropertiesStore = new (Class({
  VERSION: '0.1'
, AUTHORITY: 'com:dev-ique'

, has: {
  }

, does: iQ.role.Logging

, methods: {
    initialize: function () {
      // NOOP :)
    }
    
  , keys: function () {
      try {
        return Ti.App.Properties.listProperties();
      } catch (ex) {
        this.error("Exception during retrieving key names for the key-value store; defaulting to the empty list");
        this.logException(ex);
        return [ ];
      }
    }

  , getString: function (key, dflt) {
      try {
        return Ti.App.Properties.getString(key, dflt) || dflt;
      } catch (ex) {
        this.error("Exception during reading array key value from the store");
        this.logException(ex);
        return dflt;
      }
    }

  , getArray: function (key, dflt) {
      try {
        return Ti.App.Properties.getList(key, dflt) || dflt;
      } catch (ex) {
        this.error("Exception during reading array key value from the store");
        this.logException(ex);
        return dflt;
      }
    }

  , setString: function (key, str) {
      str && (str = str.toString());
      if (!isString(str)) {
        var msg = "Can't save key to the store: the argument is not a string";
        this.error(msg);
        throw msg;
      }
      try {
        Ti.App.Properties.setString(key, str);
      } catch (ex) {
        this.error("Exception during saving string key value to the store");
        this.logException(ex);
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
        this.logException(ex);
        return [ ];
      }
    }
  } 
})) ();
