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
      this.fireEvent('dataLoading');
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
        this.fireEvent('dataLoaded');
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
        if (f.exists())
          f.createFile();
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
      this.fireEvent('dataLoaded');
      this.debug("Adding loaded records to the store");
      if (recs.select(this.addData.trail(true), this).length > 0)
        this.fireEvent('dataUpdated');
    }

  , onLoadFailure: function (type, code, message) {
      var ev = {
        type: type,
        code: code,
        message: message
      };
      this.error("Can't get remote data:");
      this.dumpObject(ev);
      this.fireEvent('dataLoaded');
      this.fireEvent('dataFailure', ev);
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
