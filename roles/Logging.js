
Role('iQue.R.Logging', {
  methods: {
    formatLogMessage: function (msg) {
      return this.meta.name + ": " + msg;
    }
    
  , log: function (msg) {
      this.debug(msg);
    }
  , logException: function (ex) {
      Ti.Analytics.userEvent('exception', { component: this.meta.name, exception: ex });
      Ti.API.error(ex);
    }
  , dumpObject: function (obj, comment) {
      isString(comment) && this.info(comment);
      Ti.API.info(obj);
    }

  , error: function (msg) {
      Ti.API.error(this.formatLogMessage(msg));
    }
  , warn: function (msg) {
      Ti.API.warn(this.formatLogMessage(msg));
    }
  , info: function (msg) {
      Ti.API.info(this.formatLogMessage(msg));
    }
  , debug: function (msg) {
      Ti.API.debug(this.formatLogMessage(msg));
    }
    
  , panic: function (msg) {
      this.error("PANIC MESSAGE: " + msg);
      alert(msg);
    }
  }
});
