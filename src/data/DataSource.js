Class('iQ.data.DataSource', {
  has: {
    name: { is: 'ro', required: false }
  , data: { is: 'ro', required: false }
  , idIndex: { required: false }
  , idField: { is: 'ro', required: false, init: 'id' }
  , filter: { is: 'ro', required: false }
  //, recordType: { required: false }
  }

, have: {
    continuous: false
  }

, does: [
    iQ.role.Logging
  , iQ.role.EventEmitter
  ]

, methods: {
    initialize: function () {
      if (!this.name) this.name = Ti.Platform.createUUID();
      this.idIndex = { };
      this.recordType = this.recordType || iQ.data.Record;
      if (isArray(this.data)) {
        this.originalData = this.data;
        this.data = [ ];
        this.debug("Populating the store with original data (%s entries)".format(this.originalData.length));
        this.addData(this.originalData, null, true);
      } else {
        this.data = [ ];
      }
      this.debug("Registering data source %s".format(this.getName()));
      iQ.data.DataSource.register(this);
    }
    
/*  , dataUpdated: function () {
      // This is a stub function for event listeners binding
      if (!this.filter)
        this.filterUpdated();
    }
  , filterUpdated: function () {
      // This is a stub function for event listeners binding
    }*/

  , addData: function (src, idx, suppressEvent) {
      if (!src) return null;
      if (isArray(src))
        return src.collect(this.addData.trail(suppressEvent), this).compact();
      var id = src[this.idField];
      if (!id) id = iQ.data.Record.generateId();
      src[this.idField] = id;
      var rec = new this.recordType({
        data: src
      , idField: this.idField
      });
      return this.addRecord(rec, suppressEvent);
    }
    
  , addRecord: function (rec, suppressEvent) {
      var id = rec.getId();
      var result = rec;
      if (isDefined(this.idIndex[id])) {
        this.warn("Data record with id %s is already presented in the store".format(id));
        result = null;
      } else {
        rec._dataSourceName = this.name;
        this.idIndex[id] = rec;
        this.data.push(rec);
      }
      try {
        this.INNER && this.INNER(rec, suppressEvent);
      } catch (ex) {
        this.dumpObject(ex);
      }
      if (suppressEvent !== true)
        this.fireEvent('dataUpdated');
      return result;
    }
    
  , removeRecord: function (rec, suppressEvent) {
      if (!(rec instanceof iQ.data.Record))
        rec = this.getId(rec);
      if (!(rec instanceof iQ.data.Record) || isUndefined(this.idIndex[rec.id])) {
        this.warn("Data record with id %s is not presented in the store".format(rec ? '<null>' : rec.id));
        return false;
      }
      rec._dataSourceName = null;
      this.data.remove(rec);
      delete this.data.idIndex[rec.id];
      try {
        this.INNER && this.INNER(rec, suppressEvent);
      } catch (ex) {
        this.dumpObject(ex);
      }
      if (suppressEvent !== true)
        this.fireEvent('dataUpdated');
      return true;
    }

  , getId: function (id) { return this.idIndex[id]; }
  , getIds: function (ids) { return ids.collect(this.getId).compact(); }
  , getAt: function (idx) { return this.data[idx]; }
  , getIndexById: function (id) { return this.data.pluck('id').indexOf(id); }
  , getByField: function (field, val) {
      return this.select(function (rec) {
        return rec.getValue(field) == val;
      });
    }
  , getPrev: function (rec) {
      var idx = this.getIndexById(rec.id);
      return idx == 0 ? null : this.getAt(idx - 1);
    }
  , getNext: function (rec) {
      var idx = this.getIndexById(rec.id);
      return (idx >= this.count() - 1) ? null : this.getAt(idx + 1);
    }
  , count: function () { return this.data.length; }
  , isEmpty: function () { return this.data.length == 0; }
  , isContinuous: function () { return this.continuous; }
    
  , applyFilter: function (filter) {
      if (!this.filter)
        this.filter = new iQ.data.DataFilter(this, filter);
      this.filter.applyFilter(filter);
    }

  , getFiltered: function () {
      if (!this.filter) return this.data;
      return this.filter.getFiltered();
    }
    
  , getRecords: function () {
      if (this.filter) {
        return this.getFiltered();
      }
      return this.data;
    }
    
  , each: function (iterator, scope) {
      return this.data.each(iterator, scope);
    }
  , collect: function (iterator, scope) {
      return this.data.collect(iterator, scope);
    }
  , select: function (iterator, scope) {
      return this.data.select(iterator, scope);
    }
  , detect: function (iterator, scope) {
      return this.data.detect(iterator, scope);
    }
  }
  
, my: {
    have: {
      registry: { }
    }
  , methods: {
      register: function (ds) {
        this.registry[ds.getName()] = ds;
      }
    , getSource: function (name) {
        if (name.startsWith('store://')) name = name.replace(/^store:\/\/([^\/]+)/, '$1');
        return this.registry[name];
      }
    }
  }
});
