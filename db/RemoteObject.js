Class('iQue.DB.RemoteObject', {
  has: {
    server: { is: 'ro', required: true, description: 'Server name' }
  , port: { is: 'ro', required: false, init: 80 }
  , ssl: { is: 'ro', required: false, init: false }
  , url: { is: 'ro', required: true, description: 'URL to take the data from' }
  , data: { is: 'ro', required: false, init: null }
  , callback: { is: 'rw', required: false, init: null }
  }

, does: iQue.R.Logging

, after: {
    initialize: function () {
	    this.debug("Initializing remote object for " + this.server + ':' + this.port + this.url);
      this.httpClient = iQue.HTTP.createClient(this.server, this.port, this.ssl);
	  }
  }

, methods: {
    isDownloaded: function () {
      return !!this.data;
    }
  , download: function (cb, scope) {
      this.debug("Downloading data from the server " + this.url);
      this.callback = cb;
      if (scope) this.callback = this.callback.bind(scope);
      this.httpClient.get(this.url, {
    		on: { success: this.onDownloadSuccess, failure: this.onDownloadFailure }
  	  , scope: this
  	  , responseFormat: 'json'
  	  });
    }
    
  , onDownloadSuccess: function (json) {
      this.info("Remote object was successfully retrieved");
      this.data = json;
      if (isFunction(this.callback)) this.callback(json);
    }
    
  , onDownloadFailure: function (info, type) {
      this.error("Can't get remote object: error " + type);
      this.dumpObject(info);
      if (isFunction(this.callback)) this.callback();
    }
  }
});
