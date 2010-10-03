Class('iQ.FileDownload', {
  has: {
    server: { is: 'ro', required: true, description: 'Server name' }
  , port: { is: 'ro', required: false, init: 80 }
  , ssl: { is: 'ro', required: false, init: false }
  , url: { is: 'ro', required: true, description: 'URL to take the data from' }
  , path: { is: 'ro', required: true, description: 'Local file path' }
  , fileName: { is: 'ro', required: true, description: 'Local file name' }
  , file: { is: 'ro', required: false, description: 'File handler' }
  , callback: { is: 'rw', required: false, init: null }
  }

, does: iQ.role.Logging

, after: {
    initialize: function () {
	    this.debug("Initializing file download for " + this.server + ':' + this.port + this.url);
      this.httpClient = iQ.HTTP.createClient(this.server, this.port, this.ssl);
	  }
  }

, methods: {
    isDownloaded: function () {
      //return !!this.data;
    }
  , download: function (cb, scope) {
      this.debug("Downloading data from the server " + this.url);
      this.callback = cb;
      if (scope) this.callback = this.callback.bind(scope);
      this.httpClient.get(this.url, {
    		on: { success: this.onDownloadSuccess, failure: this.onDownloadFailure }
  	  , scope: this
  	  , responseFormat: 'binary'
  	  });
    }
    
  , onDownloadSuccess: function (data) {
      this.debug("Remote file was successfully retrieved, saving...");
      try {
        this.file = Ti.Filesystem.getFile(this.path, this.fileName);
        this.file.write(data);
        this.debug("File is saved to the local folder " + this.path + '/' + this.fileName);
        this.INNER();
      } catch (ex) {
        this.error("Error saving the file " + this.path + '/' + this.fileName + ":");
        this.logException(ex);
        this.file = null;
      }
      if (isFunction(this.callback)) this.callback(this.file);
    }
    
  , onDownloadFailure: function (info, type) {
      this.error("Can't get remote object: error " + type);
      this.dumpObject(info);
      if (isFunction(this.callback)) this.callback();
    }
  }
});
