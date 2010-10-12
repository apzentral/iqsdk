Class('iQ.data.DataSource', {
  has: {
    name: { is: 'ro', required: false }
  , data: { is: 'ro', required: false }
  , idIndex: { required: false }
  , idField: { is: 'ro', required: false, init: 'id' }
  , filter: { is: 'ro', required: false }
  , recordType: { required: false }
  }

, does: iQ.role.Logging

, methods: {
    initialize: function () {
      if (!this.name) this.name = Ti.Platform.createUUID();
      this.data = [ ];
      this.idIndex = { };
      this.recordType = this.recordType || iQ.data.Record;
      this.info("Registering data source %s".format(this.getName()));
      iQ.data.DataSource.register(this);
    }
    
  , dataUpdated: function () {
      
    }

  , getId: function (id) {
      return this.idIndex[id];
    }
    
  , createFilter: function (filter) {
      this.filter = new iQ.data.DataFilter(this, filter);
    }

  , getFiltered: function () {
      if (!this.filter) return this.data;
      return this.filter.getFiltered();
    }
    
  , each: function (iterator, scope) {
      return this.data.each(iterator, scope);
    }

  , collect: function (iterator, scope) {
      return this.data.collect(iterator, scope);
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
  }

, after: {
    initialize: function () {
	    this.debug("Initializing remote source %s for %s:%s%s".format(this.getName(), this.server, this.port, this.url));
      this.httpClient = iQ.HTTP.createClient(this.server, this.port, this.ssl);
      //this.load();
    }
  }

, methods: {
    load: function () {
      this.debug("Loading data from the server " + this.url);
      this.httpClient.get(this.url, {
    		on: { success: this.onLoadSuccess, failure: this.onLoadFailure }
  	  , scope: this
  	  , responseFormat: 'json'
  	  });
    }

  , reload: function () {
      this.load();
    }
  
  , onLoadSuccess: function (json) {
      this.debug("Data were successfully retrieved");
      if (!isArray(json)) json = [ json ];
      this.data = [ ];
      json.collect(function (src) {
        if (!src) return null;
        var id = src[this.idField];
        if (!id) id = iQ.data.Record.generateId();
        var rec = new this.recordType({
          data: src
        , idField: this.idField
        });
        if (isDefined(this.idIndex[id])) {
          this.warn("Data record with id %s is already presented in the store".format(id));
        } else {
          this.idIndex[id] = rec;
          this.data.push(rec);
        }
      }, this);
      this.dataUpdated();
    }

  , onLoadFailure: function (info, type) {
      this.error("Can't get remote data: error " + type);
      this.dumpObject(info);
    }
  }
});
