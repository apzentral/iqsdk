
Class('iQue.HTTP', {
  my: {
    methods: {
      createClient: function (server, port, ssl) {
        var clientCls = iQue.HTTP.Client.Titanium;
        return new clientCls(server, port, ssl);
      }
    }
  }
});

Class('iQue.HTTP.Client', {
  has: {
    engine: { is: 'ro' }
  , server: { required: true, is: 'ro' }
  , port: { init: 80, is: 'ro' }
  , ssl: { init: false, is: 'ro' }
  }

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

Class('iQue.HTTP.Client.XHR', {
  isa: iQue.HTTP.Client
  
, methods: {
  }
});

Class('iQue.HTTP.Client.Titanium', {
  isa: iQue.HTTP.Client
  
, override: {
    initEngine: function () {
      this.engine = Ti.Network.createHTTPClient;
    }
  }

, augment: {
    request: function (method, url, opts) {
      opts = opts || { };
      var req = this.engine();
      req.onload = function () {
        var data = this.responseText;
        if (opts.responseFormat == 'xml')
          data = this.responseXML;
        else if (opts.responseFormat == 'json') {
          try {
            data = JSON.parse(this.responseText);
          } catch (ex) {
            return isFunction(opts.on.failure) && opts.on.failure(opts.scope, { exception: ex, source: this.responseText }, 'json');
          }
        }
        isFunction(opts.on.success) && opts.on.success(opts.scope, data, this.status);
      };
      req.onerror = function () {
        isFunction(opts.on.failure) && opts.on.failure(opts.scope, this.responseText, this.status);
      };
      req.open(method, url);
      if (isObject(opts.headers))
        for (var k in opts.headers)
          req.setRequestHeader(k, opts.headers[k]);
      req.send(opts.body || '');
    }
  }
});

Class('iQue.HTTP.Client.NodeJS', {
  isa: iQue.HTTP.Client

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


Class('iQue.HTTP.Connection', {
  
});

Class('iQue.HTTP.Connection.XHR', {
  
});
