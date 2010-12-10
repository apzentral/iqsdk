Class('iQ.data.DataSource', {
  has: {
    name: { is: 'ro', required: false }
  , data: { is: 'ro', required: false }
  , idIndex: { required: false }
  , idField: { is: 'ro', required: false, init: 'id' }
  , filter: { is: 'ro', required: false }
  , recordType: { required: false }
  }

, does: [
    iQ.role.Logging
  , iQ.role.EventEmitter
  ]

, methods: {
    initialize: function () {
      if (!this.name) this.name = Ti.Platform.createUUID();
      this.data = [ ];
      this.idIndex = { };
      this.recordType = this.recordType || iQ.data.Record;
      this.info("Registering data source %s".format(this.getName()));
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
        return src.each(this.addData.trail(suppressEvent), this);
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
      var result = true;
      if (isDefined(this.idIndex[id])) {
        this.warn("Data record with id %s is already presented in the store".format(id));
        result = false;
      } else {
        rec.data._dataSourceName = this.name;
        this.idIndex[id] = rec;
        this.data.push(rec);
      }
      if (suppressEvent !== true)
        this.fireEvent('dataUpdated');
      return result;
    }

  , getId: function (id) {
      return this.idIndex[id];
    }
    
  , getAt: function (idx) {
      return this.data[idx];
    }
    
  , getIndexById: function (id) {
      return this.data.pluck('id').indexOf(id);
    }
    
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

Class('iQ.data.RemoteSource', {
  isa: iQ.data.DataSource
  
, has: {
    server: { is: 'ro', required: true, description: 'Server name' }
  , port: { is: 'ro', required: false, init: 80 }
  , ssl: { is: 'ro', required: false, init: false }
  , url: { is: 'ro', required: true, description: 'URL to take the data from' }
  , cache: { is: 'ro', required: false, init: false }
  }
  
, have: {
    autoLoad: false
  , httpClient: null
  }

, after: {
    initialize: function () {
	    this.debug("Initializing remote source %s for %s:%s%s".format(this.getName(), this.server, this.port, this.url));
      this.httpClient = this.createHttpClient();
      if (this.autoLoad === true)
        this.load();
    }
  }

, methods: {
    createHttpClient: function () {
      return iQ.HTTP.createClient(this.server, this.port, this.ssl);
    }
  , prepareHttpRequest: function (req) {
      return req;
    }
  , processHttpResponse: function (data) {
      return data;
    }

  , load: function () {
      this.loadCache();
      this.debug("Loading data from the server " + this.url);
      if (this.INNER)
        this.INNER();
      else
        this.httpClient.get(this.url, this.prepareHttpRequest({
      		on: { success: this.onLoadSuccess, failure: this.onLoadFailure }
    	  , scope: this
    	  }));
    }

  , loadCache: function () {
      if (!this.cache) return;
      this.debug("Loading data from cache " + this.cache);
      try {
        var f = Ti.Filesystem.getFile(this.cache);
        var data = f.read();
        this.data = [ ];
        JSON.parse(data).each(this.addData.trail(true), this);
        this.fireEvent('dataUpdated');
      } catch (ex) {
        this.error("Error loading cached data: ");
        this.logException(ex);
      }
    }

  , saveCache: function (json) {
      if (!this.cache) return;
      this.debug("Saving data to cache " + this.cache);
      try {
        var f = Ti.Filesystem.getFile(this.cache);
        f.write(JSON.stringify(json));
      } catch (ex) {
        this.error("Error saving data to cache: ");
        this.logException(ex);
      }
    }

  , reload: function () {
      this.load();
    }
  
  , onLoadSuccess: function (data) {
      this.debug("Data were successfully retrieved");
      var recs = this.processHttpResponse(data);
      this.saveCache(recs);
      if (recs.select(this.addData.trail(true), this).length > 0)
        this.fireEvent('dataUpdated');
    }

  , onLoadFailure: function (info, type) {
      this.error("Can't get remote data: error " + type);
      this.dumpObject(info);
    }
  }
});

Class('iQ.data.JSONSource', {
  isa: iQ.data.RemoteSource

, override: {
    prepareHttpRequest: function (req) {
      return apply(req, { responseFormat: 'json' });
    },
    processHttpResponse: function (json) {
      if (!isArray(json)) json = [ json ];
      return json
    }
  }
});

Class('iQ.data.XMLSource', {
  isa: iQ.data.RemoteSource

, override: {
    prepareHttpRequest: function (req) {
      return apply(req, { responseFormat: 'xml' });
    },
    processHttpResponse: function (json) {
      return [ ];
    }
  }
});
