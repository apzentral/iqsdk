
Class('iQue.PackageUpdater', {
  has: {
    server: { is: 'ro', required: true, description: 'Server name' }
  , port: { is: 'ro', required: false, init: 80 }
  , ssl: { is: 'ro', required: false, init: false }
  , url: { is: 'ro', required: true, description: 'URL to take the data from' }
  , path: { is: 'ro', required: true, description: 'Local directory for data storage' }
  , packageFile: { is: 'ro', required: false }
  , packageInfo: { is: 'ro', required: false, init: { } }
  , analyticsEvent: { is: 'rw', required: false, init: null }
  , debugMode: { is: 'rw', required: false, init: true }
  
  // httpClient
  }

, my: {
    PACKAGE_INFO_FILE: 'ique-package.json'
	, ERROR_NO_PACKAGE_FILE: 1
	, ERROR_NO_PACKAGE_INFO: 2
	, ERROR_WRONG_PACKAGE_FILE: 3
	, ERROR_WRONG_PACKAGE_INFO: 4
	, ERROR_SAVING_FILE: 5
	, ERROR_DOWNLOAD_FAILED: 6
	, ERROR_APPLYING_UPDATE: 7
	, ERROR_DOWNLOAD_UNKNOWN: -1
  }
  
, after: {
    initialize: function () {
	  /**/ this.debugMode && Ti.API.debug("Initializing package updater for " + this.path);
      this.httpClient = iQue.HTTP.createClient(this.server, this.port, this.ssl);
	  }
  }
  
, methods: {
    debug: function (msg) {
  	  if (!this.debugMode) return;
  	  Ti.API.debug(this.formatConsoleMessage(msg));
    }
  , error: function (msg) {
  	  Ti.API.error(this.formatConsoleMessage(msg));
    }
  , info: function (msg) {
  	  Ti.API.error(this.formatConsoleMessage(msg));
    }
  , formatConsoleMessage: function (msg) {
      return "iQue.PackageUpdater: " + msg + "[package=" + this.path + "]";
    }

  , update: function () {
      if (this.check) this.download();
    }
  , check: function () {
  	  this.debug("Checking for updates");
  	  this.load();

  	  var exists = this.packageInfo.version >= json.version;
  	  this.debug("Update for package " + this.path + (exists ? " is available" : " is not available yet");
        return exists;
  	}
  , load: function () {
      this.debug("Loading local package info");
      if (!this.open()) return false;
      try {
        this.packageInfo = JSON.parse(this.packageFile.read());
    		return true;
  	  } catch (ex) {
  	    this.wrongPackageFile(ex);
    		return false;
  	  }
    }
  , open: function () {
      try {
        this.packageFile = Ti.Filesystem.getFile(this.path + '/' + iQue.PackageUpdater.PACKAGE_INFO_FILE);
    		return true;
  	  } catch (ex) {
  	    this.noPackageFile(ex);
    		return false;
  	  }
    }
  , download: function () {
      this.debug("Downloading package information from the server");
      this.httpClient.get(this.url + '/' + iQue.PackageUpdater.PACKAGE_INFO_FILE, {
    		on: { success: this.gotPackageInfo, failure: this.noPackageInfo }
  	  , scope: this
  	  , responseFormat: 'json'
  	  });
    }
  , save: function () {
      this.debug("Saving updated package information locally");
      try {
        this.packageFile.write(JSON.stringify(this.packageInfo));
    		return true;
  	  } catch (ex) {
    		return false;
  	  }
    }
	
  , gotPackageInfo: function (json) {
    try {
  	  this.debug("Remote package info is read, processing...");
      // Compare versions
  	  this.load();
  	  if (!json.version || !isArray(json.content)) return this.wrongPackageInfo();
      if (this.packageInfo.version >= json.version) return this.updateNotNeeded();

      // Go through the list of files and download them
      var downloaded = 0, processed = 0, count = json.content.length, failed = false;
  	  this.info("Loading package update (" + this.packageInfo.version + " => " + json.version + ")");
  	  this.debug("Starting downloading files, " + count + " in total");
      this.tempDir = Ti.Filesystem.createTempDirectory();
  	  json.content.each(function (item) {
  		this.httpClient.get(this.url + '/' + item.file, { on: {
  		  success: function (data) {
    			try {
    			  var file = Ti.Filesystem.File.getFile(this.nativePath + '/' + item.file);
    			  if (file.exists())
    			    file.deleteFile();
    			  file.createFile(path);
    			  file.write(data);
    			  downloaded++;
    			} catch (ex) {
    			  failed = true;
    			};
    			processed++;
    			this.downloadProgress(downloaded, count);
    			if (processed >= count) {
    			  if (failed)
              this.downloadFailed(item.file);
    			  else
      				this.downloadComplete(item.file);
    			}
  		  }
  		, failure: function () {
    			processed++;
    			failed = true;
  		  }
  		}, scope: this });
	  }, this);
  	  this.debug("File downloading requests queued, waiting for responses...");
  	} catch (ex) {
  	  this.debug("Unknown error during sending file downloading requests: " + ex);
  	  this.updateFailed(iQue.PackageUpdater.ERROR_UNKOWN);
  	};
    }
  , downloadComplete: function () {
  	  if (!this.save()) return this.updateFailed(iQue.PackageUpdater.ERROR_SAVING_FILE);
      if (!this.tempDir && !this.tempDir.exists()) return this.updateFailed(iQue.PackageUpdater.ERROR_UNKOWN);
  	  try {
  	    var dir = Ti.Filesystem.getFile(this.path);
  	    if (dir.exists())
          dir.deleteDirectory();
  	  } catch () { };
      try { 
        this.tempDir.move(this.path);
  	  } catch () { return this.updateFailed(iQue.PackageUpdater.ERROR_APPLYING_UPDATE); };
      try { 
    		this.tempDir.deleteDirectory();
  	  } catch () { };
    	  this.updateComplete();
    }
  , downloadFailed: function (file) {
      this.error("Download failed for file " + file);
      this.updateFailed(iQue.PackageUpdater.ERROR_DOWNLOAD_FAILED);
    }
  , wrongPackageFile: function () {
      this.error("Wrong format of the local package information file");
      this.updateFailed(iQue.PackageUpdater.ERROR_WRONG_PACKAGE_FILE);
    }
  , wrongPackageInfo: function () {
      this.error("Wrong format of the remote package information file");
      this.updateFailed(iQue.PackageUpdater.ERROR_WRONG_PACKAGE_INFO);
    }
  , noPackageFile: function (ex) {
      this.error("Can't find local package information file at " + this.path + "/" + );
      this.packageInfo = { version: 0, content: [ ] };
      this.updateFailed(iQue.PackageUpdater.ERROR_NO_PACKAGE_FILE);
    }
  , noPackageInfo: function () {
      this.error("Can't find remote package information at " + this.server + this.url);
      this.updateFailed(iQue.PackageUpdater.ERROR_NO_PACKAGE_FILE);
  	}
  , updateFailed: function (code) {
      try { 
  	    if (this.tempDir && this.tempDir.exists()) 
  		  this.tempDir.deleteDirectory();
  	  } catch () { };
    }
  , updateComplete: function () {
    }
  , updateNotNeeded: function () {
    }
  }
});
