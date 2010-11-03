Class('iQ.data.JSONFile', {
  has: {
    fileName: { is: 'ro', required: true }
  , data: { is: 'ro', required: false, init: null }
  , callback: { is: 'rw', required: false, init: null }
  , scope: { is: 'rw', required: false }
  }

, does: iQ.role.Logging

, after: {
    initialize: function () {
	    this.debug("Loading JSON file" + this.fileName);
	    this.data = ;
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
      this.debug("Remote object was successfully retrieved");
      this.data = json;
      if (isFunction(this.callback)) this.callback.call(this.scope || this, json);
    }
    
  , onDownloadFailure: function (info, type) {
      this.error("Can't get remote object: error " + type);
      this.dumpObject(info);
      if (isFunction(this.callback)) this.callback.call(this.scope || this);
    }
  }
});
