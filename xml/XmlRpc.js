
Module('iQue.XmlRpc', function () { });

Class('iQue.XmlRpc.Client', {
  has: {
    server: { required: true, is: 'ro' }
  , port: { init: 80, is: 'ro' }
  , path: { required: true, is: 'ro' }
  , ssl: { init: false, is: 'ro' }
  , httpClient: { init: false, is: 'ro' }
  }

, methods: {
    BUILD: function (server, path, ssl, port) {
      return {
        server: server,
        path: path,
        port: port,
        ssl: ssl,
        httpClient: HTTP.createClient(server, port, ssl);
      };
    }
    
  , convertArgument: function (arg) {
      switch (typeOf(arg)) {
      case 'boolean':
        val = '<boolean>' + (!!arg ? 1 : 0) + '</boolean>';
        break;
      case 'number':
        val += '<int>' + arg + '</int>';
        break;
      case 'string':
        val += '<string>' + arg + '</string>';
        break;
      case 'function':
        return '';
      case 'array':
        val = '<array><data>';
        for (var i = 0; i < arg.length; i++)
            val += argumenta.callee.call(this, arg[i]);
        val += '</data></array>';
        break;
      case 'object':
        val = '<struct>';
        for (var p in arg)
            val += '<member><name>' + p + '</name>' + arguments.callee.call(this, arg[p]) + '</member>';
        val += '</struct>';
        break;
      default:
        val = '<nil/>';
        break;
      }
      return '<value>' + val + '</value>';
    }
  
  , buildRequestBody: function (method, params) {
      var body = '<methodCall><methodName>' + method + '</methodName><params>';
      for (var i in params)
        body += '<param>' + this.convertArgument(params[i]) + '</param>';
      return body + '</params></methodCall>';
    }
  
  , processArgument: function (xml) {
      try {
        var value, cn, node, node2, name, data;
        var Tr = JsXl.XmlTraversal;
        var val = xml.firstChild.nodeValue;
        switch (xml.nodeName) {
        case 'struct':
          value = { };
          cn = xml.childNodes;
          for (var i in cn) {
            node = cn[i];
            if (node.nodeType != 1) continue;
            node2 = Tr.firstElement(node);
            if (node2.nodeName == 'name') {
              name = node2;
              data = Tr.nextElement(node2);
            } else {
              name = Tr.nextElement(node2);
              data = node2;
            }
            node2 = Tr.firstElement(data);
            value[name.firstChild.nodeValue] = node2 ? this.processArgument(node2) : null;
          }
          return value;
        case 'array':
          value = [ ];
          cn = Tr.firstElement(xml).childNodes;
          for (var i in cn)
            value.push(this.processArgument(Tr.firstElement(cn[i])));
          return value;
        case 'string':
          return val;
        case 'int':
        case 'i64':
          return parseInt(val);
        case 'boolean':
          return !!val;
        case 'double':
          return parseFloat(val);
        case 'base64':
          if (Ti && Ti.Utils) return Ti.Utils.base64decode(val);
          return val; // TODO: Add support for BASE64
        case 'dateTime.iso8601':
          return val; // TODO: Add support for datatime parsing
        default:
          return null;
        }
      } catch (ex) {
        return 'Misformatted response';
      }
    }
    
  , getResponseRoot: function (xml) {
      return this.getXmlRpcRoot(xml, 'value');
    }
  , getErrorRoot: function (xml) {
      return this.getXmlRpcRoot(xml, 'fault');
    }
  , getXmlRpcRoot: function (xml, tag) {
      var Tr = JsXl.XmlTraversal;
      try {
        return Tr.firstElement(Tr.descendant(xml, 'tag'));
      } catch (ex) {
        return null;
      }
    }
  , isXmlRpcError: function (xml) {
      return !!this.getErrorRoot(xml);
    }

  , request: function (method, params, cbs) {
      cbs = applyIf(cbs || { }, { scope: this });
      this.httpClient.post(this.path, {
        headers: {
          'Content-Type': 'text/xml'
        , 'Accept-Type': 'application/xml'
        }
      , body: this.buildRequestBody(method, params)
      , responseFormat: 'xml'
      , on: {
          success: function (xml) {
            if (!xml)
              return isFunction(cbs.failure) && cbs.failure.call(cbs.scope, 'xml', 'Response is not in XML format', xml);
            var resp;
            try {
              resp = this.processResponse(this.getResponseRoot(xml) || this.getErrorRoot(xml));
            } catch (ex) {
              return isFunction(cbs.failure) && cbs.failure.call(cbs.scope, 'xml', ex, xml);
            }
            if (this.isXmlRpcError(xml))
              return isFunction(cbs.failure) && cbs.failure.call(cbs.scope, 'xmlrpc', resp['faultCode'], resp['faultString']);
            isFunction(cbs.success) && cbs.success.call(cbs.scope, resp);
          },
          failure: function (text, statusCode) {
            isFunction(cbs.failure) && cbs.failure.call(cbs.scope, 'http', statusCode, text);
          }
          // Extend listeners with connectivity handlers etc
        }
      , scope: this
      });
    }
  }
});
