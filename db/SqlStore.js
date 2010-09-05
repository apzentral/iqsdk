
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

  , select: function (table, fields, where, opts) {
      if (!this.check("SELECT")) throw "Database is not initialized";
      try {
        var query = this.__constructSQLQuery(table, fields, where, opts);
        this.debug("Executing SQL query:");
        this.debug(query);
        return new iQue.DB.SqlRecordSet(this.db.execute(query), fields);
      } catch (ex) {
        this.error("Exception during query execution: " + ex);
        throw "Error executing SQL query";
      }
    }
  , __constructSQLQuery: function (table, fields, where, opts) {
      var query = [ ];
      for (var a in where) {
        try {
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
          } else if (isObject(val)) {
            if (isDefined(val.like))
              val = ' LIKE "' + val.like.replace('"', '\\"') + '"';
            else if (isDefined(val.lt))
              val = ' < ' + val.lt;
            else if (isDefined(val.le))
              val = ' <= ' + val.le;
            else if (isDefined(val.gt))
              val = ' > ' + val.gt;
            else if (isDefined(val.ge))
              val = ' >= ' + val.ge;
            else
              throw("Custom comparison object does not provide any of recognizable keys (like, lt, gt, le, ge): " + val);
          } else {
            throw("Unsupported value for the key " + a);
          }
          query.push(a + val);
        } catch (ex) {
          this.error("Bad value supplied in WHERE part of SQL request; key=" + a + ", value=" + val);
          this.error(ex);
        }
      }
      var sql = "SELECT DISTINCT " + fields.join(',') + " FROM '" + table + "' WHERE " + query.join(',');
      if (isObject(opts)) {
        if (isString(opts.order)) {
          sql += " ORDER BY " + opts.order + " ASC";
        } else if (isArray(opts.order)) {
          sql += " ORDER BY " + opts.order.collect(function (o) {
            if (isString(o)) return o + " ASC";
            else if (isObject(o)) return Object.keys(o)[0] + Object.values(o)[0];
          }).compact().uniq().join(', ');
        }
        
        if (isDefined(opts.offset)) {
          sql += " OFFSET " + parseInt(opts.offset);
        }
        
        if (isDefined(opts.limit)) {
          sql += " LIMIT " + parseInt(opts.limit);
        }
      }
      return sql;
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
