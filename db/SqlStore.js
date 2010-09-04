
Class('iQue.DB.SqlStore', {
  VERSION: '0.1'
, AUTHORITY: 'com:dev-ique'
  
, has: {
    name: { is: 'ro', required: true }
  , path: { is: 'ro', required: true }
  , db:   { is: 'ro', required: false, init: null }
  , clear: { is: 'ro', required: true, init: false }
  }
  
, does: iQue.R.Logging

, after: {
    initialize: function () {
      if (this.clear)
        this.reset();
      this.install();
    }
  }

, methods: {
    BUILD: function (name, path, clear) {
      return {
        name: name,
        path: path,
        clear: clear || false
      };
    }

  , install: function () {
      var path = (this.path != '') ? (this.path + '/') : '';
      var fullName = path + this.name + '.db';
      this.debug("Installing database " + this.name + " from " + fullName);
      try {
        this.db = Ti.Database.install(fullName, this.name);
      } catch (ex) {
        this.error("Database installation failed, returned exception: " + ex);
        this.db = null;
      }
      return this;
    }
    
  , open: function () {
      this.debug("Opening pre-installed database " + this.name);
      try {
        this.db = Ti.Database.open(this.name);
      } catch (ex) {
        this.error("Exception during database open operation: " + ex);
      }
      return this;
    }

  , reset: function () {
      this.debug("Clearing (resetting) database " + this.name);
      try {
        Ti.Database.open(this.name).remove();
      } catch (ex) {
        this.debug("Database was not installed");
      }
    }

  , check: function (msg) {
      if (!this.db) {
        this.error(msg + " error: no database installed or opened");
        return false;
      }
      return true;
    }

  , select: function (table, fields, where) {
      if (!this.check("SELECT")) throw "Database is not initialized";
      try {
        var query = this.__constructSQLQuery(table, fields, where);
        this.debug("Executing SQL query:");
        this.debug(query);
        return new iQue.DB.SqlRecordSet(this.db.execute(query), fields);
      } catch (ex) {
        this.error("Exception during query execution: " + ex);
        throw "Error executing SQL query";
      }
    }
  , __constructSQLQuery: function (table, fields, where) {
      var query = [ ];
      for (var a in where) {
        var val = this.__value2SQL(where[a]);
        if (isArray(val)) {
          val = " IN(" + val.collect(function (v) { 
            v = this.__value2SQL(v);
            if (!isString(v)) {
              this.error("Bad value supplied in WHERE part of SQL request: " + v);
              return null;
            }
            return v;
          }, this).compact().join(',') + ")";
        } else if (val === null || val === undefined) {
          val = "IS NULL";
        } else if (isString(val)) {
          val = "= " + val;
        } else {
          this.error("Bad value supplied in WHERE part of SQL request: " + val);
          val = "";
        }

        query.push(a + val);
      }
      return sql = "SELECT DISTINCT " + fields.join(',') + " FROM '" + table + "' WHERE " + query.join(',');
    }
  , __value2SQL: function (val) {
      if (isFunction(val))
        val = val();

      if (isBoolean(val))
        val = val ? "TRUE" : "FALSE"
      else if (isString(val))
        val = "'" + val.replace("'", "\\'") + "'";
      else if (isNumber(val))
        val = "" + val + "";

      return val;
    }
  }
});
