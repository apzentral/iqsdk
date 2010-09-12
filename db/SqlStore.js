
Class('iQue.DB.SqlStore', {
  VERSION: '0.1'
, AUTHORITY: 'com:dev-ique'
  
, has: {
    name: { is: 'ro', required: true }
  , path: { is: 'ro', required: true }
  , db:   { is: 'ro', required: false, init: null }
  , clear: { is: 'ro', required: true, init: false }
  , updatesServer: { is: 'ro', required: false }
  , updatesUrl: { is: 'ro', required: false }
  , updatesCallback: { is: 'ro', required: false }
  }
  
, have: {
    updated: false
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
        this.logException(ex);
        throw "Error executing SQL query";
      }
    }
    
  , insert: function (table, data) {
      if (!this.check("INSERT")) throw "Database is not initialized";
      this.debug("Executing SQL insert");
      var query = "INSERT INTO '" + table + "'";
      if (!isArray(data)) data = [ data ];
      data.each(function (d) {
        try {
          var q = [ ];
          var cols = [ ];
          for (var key in d) {
            var val;
            if (isNumber(d[key]) || isBoolean(d[key]))
              val = d[key];
            else if (isString(d[key]))
              val = "'" + d[key].replace("'", "\\'") + "'";
            else {
              this.error("Wrong value type: " + typeof(d[key]) + " - " + d[key]);
              continue;
            }
            cols.push("'" + key.replace("'", "\\'") + "'");
            q.push(val);
          }
          this.db.execute(query  + " (" + cols.join(", ") + ") VALUES (" + q.join(", ") + ")");
        } catch (ex) {
          this.logException(ex);
        }
      }, this);
    }
    
  , deleteAll: function (table) {
      if (!this.check("DELETE")) throw "Database is not initialized";
      this.debug("Deleting all data from the table " + table);
      try {
        this.db.execute("DELETE FROM '" + table.replace("'", "\\'") + "'");
      } catch (ex) {
        this.logException(ex);
      }
    }
    
  , checkUpdates: function (server, url, cb, scope) {
      if (isUndefined(server))
        server = this.updatesServer;
      if (isUndefined(url))
        url = this.updatesUrl;
      this.debug("Checking updates for database " + this.name + " at http://" + server + url);
      try {
        if (isFunction(cb))
          this.updatesCallback = cb.bind(scope || this);
        new iQue.DB.RemoteObject({ 
          server: this.updatesServer = server
        , url: this.updatesUrl = url
        , callback: this.processUpdates
        , scope: this
        });
        return true;
      } catch (ex) {
        this.error("Exception during database updates check:");
        this.logException(ex);
        return false;
      }
    }
  , processUpdates: function (updates) {
      if (isUndefined(updates))
        return this.error("Can't find remote update info for database " + this.name);
      try {
        var availableUpdates = updates.pluck('id');
        var installedUpdates = iQue.DB.PropertiesStore.getArray(this.my.PROPERTYSTORE_UPDATES.format(this.name));
        this.debug("List of installed updates: " + installedUpdates.join(', '));
        this.debug("List of available updates: " + availableUpdates.join(', '));
        var requiredUpdates = availableUpdates.subtract(installedUpdates);
        this.debug("Database update info retrieved, total " + availableUpdates.length + 
                   " updates found, " + requiredUpdates.length + " updates will be installed: " +
                   requiredUpdates.join(', '));
        if (requiredUpdates.length > 0)
          this.installUpdate(updates.first('id', requiredUpdates[0]));
        else if (this.updated === true && isFunction(this.updatesCallback))
          this.updatesCallback();
      } catch (ex) {
        this.error("Exception during processing database update information:");
        this.logException(ex);
      }
    }
  , installUpdate: function (updateInfo) {
      this.debug("Retrieving update id " + updateInfo.id + " for database " + this.name);
      try {
        new iQue.DB.RemoteObject({
          server: updateInfo.server
        , url: updateInfo.dataUrl
        , callback: this.mergeUpdate.curry(updateInfo)
        , scope: this
        });
        return true;
      } catch (ex) {
        this.error("Exception during retrieving update id " + updateInfo.id + ":");
        this.logException(ex);
        return false;
      }
    }
  , mergeUpdate: function (updateInfo, update) {
      if (isUndefined(update))
        return this.error("Can't find remote update " + updateInfo.dataUrl + " for database " + this.name);
      this.debug("Update id " + updateInfo.id + " downloaded, processing...");
      this.db.execute("BEGIN TRANSACTION");
      try {
        var options = update.options || { };
        var ids = options.ids || { };
        var data, query, cols, vals, u;
        // Processing inserts
        if (isObject(data = update.insert)) {
          if (!isObject(data)) {
            this.warning("INSERT field in database update has a wrong format");
          } else {
            Object.each(data, function (table, rows) {
              if (!isArray(rows) || !isString(table))
                return this.warning("INSERT field for table " + table + "in database update has a wrong format");
              rows.each(function (row, idx) {
                cols = [ ];
                vals = [ ];
                if (!isObject(row)) 
                  return this.warning(
                    "INSERT field for row #" + idx + " in table " + table + 
                    " in database update has a wrong format"
                  );
                Object.each(row, function (c, v) {
                  cols.push("'" + c.escapeSQL() + "'");
                  vals.push(this.my.makeSQLValue(v));
                }, this);
                try {
                  this.db.execute(
                    "INSERT INTO '" + table.escapeSQL() + "' (" + 
                    cols.join(",") + ") VALUES (" + 
                    vals.join(",") + ")"
                  );
                } catch (ex) {
                  throw "Error executing SQL command during database update";
                }
              }, this);
            }, this);
          }
        }
        if (isObject(data = update.update)) {
          if (!isObject(data)) {
            this.warning("UPDATE field in database update has a wrong format");
          } else {
            Object.each(data, function (table, rows) {
              if (!isObject(rows) || !isString(table))
                return this.warning("UPDATE field for table " + table + "in database update has a wrong format");
              Object.each(rows, function (id, row){
                u = [ ];
                id = options.numericIds ? parseInt(id) : this.my.makeSQLValue(id);
                if (!isObject(row)) 
                  return this.warning(
                    "UPDATE field for row id " + id + " in table " + table + 
                    " in database update has a wrong format"
                  );
                Object.each(row, function (c, v) {
                  u.push("'" + c.escapeSQL() + "' = " + this.my.makeSQLValue(v));
                }, this);
                try {
                  this.db.execute(
                    sql = "UPDATE '" + table.escapeSQL() + 
                    "' SET " + u.join(',') + 
                    " WHERE " + ids[table] + " = " + id
                  );
                } catch (ex) {
                  throw "Error executing SQL command during database update";
                }
              }, this);
            }, this);
          }
        }
        if (isObject(data = update['delete'])) {
          if (!isObject(data)) {
            this.warning("DELETE field in database update has a wrong format");
          } else {
            Object.each(data, function (table, rows) {
              if (!isArray(rows) || !isString(table))
                return this.warning("DELETE field for table " + table + "in database update has a wrong format");
              rows.each(function (id) {
                id = options.numericIds ? parseInt(id) : this.my.makeSQLValue(id);
                try {
                  this.db.execute(
                    sql = "DELETE FROM '" + table.escapeSQL() + 
                    "' WHERE " + ids[table] + "=" + id
                  );
                } catch (ex) {
                  throw "Error executing SQL command during database update";
                }
              }, this);
            }, this);
          }
        }
        this.db.execute("END TRANSACTION");
        
        var installedUpdates = iQue.DB.PropertiesStore.getArray(this.my.PROPERTYSTORE_UPDATES.format(this.name));
        installedUpdates.push(updateInfo.id);
        iQue.DB.PropertiesStore.setArray(this.my.PROPERTYSTORE_UPDATES.format(this.name), installedUpdates);
        this.info("Update id " + updateInfo.id + " has been successfully applied to the " + this.name + " database");
        this.updated = true;
        this.checkUpdates();
      } catch (ex) {
        this.db.execute("ROLLBACK TRANSACTION");
        this.error("Exception during processing database update id " + updateInfo.id + ":");
        this.logException(ex);
      }
    }

  , __constructSQLQuery: function (table, fields, where, opts) {
      var query = [ ];
      if (isObject(where) && Object.keys(where).length > 0) {
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
              val = " IS NULL";
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
        query = " WHERE " + query.join(',');
      } else {
        query = "";
      }
      if (!isArray(fields)) fields = [ fields ];
      var sql = "SELECT DISTINCT " + fields.join(',') + " FROM '" + table + "'" + query;
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
  
, my: {
    have: {
      PROPERTYSTORE_UPDATES: '$ique.database.update.%s'
    }
  , methods: {
      makeSQLValue: function (val) {
        if (isString(val))
          return "'" + val.escapeSQL() + "'";
        else if (isBoolean(val))
          return val ? "TRUE" : "FALSE";
        else if (val === null || isUndefined(val))
          return "NULL";
        else if (isNumber(val))
          return val;
        else {
          try {
            val = JSON.stringify(val);
          } catch (ex) {
            try {
              val = val.toString();
            } catch (ex) {
              val = "''";
            }
          }
          return "'" + val.escapeSQL() + "'";
        }
      }
    }
  }
});
