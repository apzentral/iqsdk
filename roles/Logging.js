
Role('iQue.R.Logging', {
  methods: {
    formatLogMessage: function (msg) {
      return this.meta.name + ": " + msg;
    }
    
  , log: function (msg) {
      this.debug(msg);
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
