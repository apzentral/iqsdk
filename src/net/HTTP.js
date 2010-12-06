
Class('iQ.HTTP', {
  my: {
    methods: {
      createClient: function (server, port, ssl) {
        var clientCls = iQ.HTTP.Client.Titanium;
        return new clientCls(server, port, ssl);
      }
    }
  }
});

Class('iQ.HTTP.Client', {
  has: {
    engine: { is: 'ro' }
  , server: { required: true, is: 'ro' }
  , port: { init: 80, is: 'ro' }
  , ssl: { init: false, is: 'ro' }
  }

, does: iQ.role.Logging

, methods: {
    BUILD: function (server, port, ssl) {
      var obj = { server: server };
      if (port) obj.port = port;
      if (ssl) obj.ssl = ssl;
      return obj;
    }
  , initEngine: function () {
    }
  , request: function (method, url, opts) {
      return this.INNER(method || 'GET', url || '', apply({ on: { }, scope: this }, opts));
    }
  , get: function (url, opts) {
      return this.request('GET', url, opts);
    }
  , put: function (url, opts) {
      return this.request('PUT', url, opts);
    }
  , post: function (url, opts) {
      return this.request('POST', url, opts);
    }
  , del: function (url, opts) {
      return this.request('DELETE', url, opts);
    }
  , options: function (url, opts) {
      return this.request('OPTIONS', url, opts);
    }
  }

, after: {
    initialize: function () {
      this.initEngine();
    }
  }
});

Class('iQ.HTTP.Client.XHR', {
  isa: iQ.HTTP.Client
  
, methods: {
  }
});

Class('iQ.HTTP.Client.Titanium', {
  isa: iQ.HTTP.Client
  
, override: {
    initEngine: function () {
      this.engine = Ti.Network.createHTTPClient;
    }
  }

, augment: {
    request: function (method, url, opts) {
      opts = opts || { };
      var me = this;
      var req = me.engine();
      me.debug("Sending HTTP %s %s:%s%s".format(method, this.server, this.port, url));
      req.onload = function () {
        var data = this.responseText;
        me.debug("Got HTTP response...");
        //me.dumpObject(data);
        if (opts.responseFormat == 'xml') {
          data = this.responseXML;
        } else if (opts.responseFormat == 'binary') {
          data = this.responseData;
        } else if (opts.responseFormat == 'json') {
          try {
            data = JSON.parse(this.responseText);
          } catch (ex) {
            me.error("Error parsing JSON object:");
            me.logException(ex);
            if (isFunction(opts.on.failure))
              opts.on.failure.call(opts.scope, { exception: ex, source: this.responseText }, 'json');
            return
          }
        }
        isFunction(opts.on.success) && opts.on.success.call(opts.scope, data, this.status);
      };
      req.onerror = function () {
        me.error("HTTP error: " + this.status + "; " + this.responseText);
        isFunction(opts.on.failure) && opts.on.failure.call(opts.scope, this.responseText, this.status);
      };
      req.open(method, 'http' + (this.ssl === true ? 's' : '') + '://' + this.server + ':' + this.port + url);
      if (isObject(opts.headers))
        for (var k in opts.headers)
          req.setRequestHeader(k, opts.headers[k]);
      req.send(opts.body || '');
    }
  }
});

Class('iQ.HTTP.Client.NodeJS', {
  isa: iQ.HTTP.Client

, override: {
    initEngine: function () {
      var http = require('http');
      this.engine = http.createClient(this.port, this.server);
    }
  }

, augment: {
    request: function (method, url, opts) {
      var req = this.engine.request(method, url, opts.headers);
      req.write(opts.body || '');
      req.addListener('response', function (resp) {
        var body = '';
        resp.addListener('data', function (data) {
          body += data;
        });
        resp.addListener('end', function () {
          // TODO: Process data according to opt.responseFormat flag
          var cb = opts.on[resp.statusCode < 400 ? 'success' : 'failure'];
          isFunction(cb) && cb.call(opts.scope, body, resp.statusCode);
        });
      });
      req.end();
    }
  }
});


Class('iQ.HTTP.Connection', {
  
});

Class('iQ.HTTP.Connection.XHR', {
  
});
