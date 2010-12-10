
Module('iQ.XmlRpc', function () { });

Class('iQ.XmlRpc.Client', {
  does: [ iQ.role.Logging, iQ.role.EventEmitter ]

, has: {
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
        httpClient: iQ.HTTP.createClient(server, port, ssl)
      };
    }
    
  , convertArgument: function (arg) {
      var val = '';
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
      params = isArray(params) ? params : [ params ];
      params.each(function (p) {
        body += '<param>' + this.convertArgument(p) + '</param>';
      }, this);
      return body + '</params></methodCall>';
    }
  
/*  , processResponse: function (xml) {
      var Tr = iQ.XmlTraversal;
      var node = Tr.childElement(xml);
      var resp = [ ];
      do {
        resp.push(this.processArgument(node));
      } while (node = Tr.nextElement(node));
      return resp;
    }*/
  , processArgument: function (xml) {
      try {
        var value, cn, node, node2, name, data;
        var Tr = iQ.XmlTraversal;
        var val = xml.firstChild ? xml.firstChild.nodeValue : null;
        switch (xml.nodeName) {
        case 'struct':
          value = { };
          cn = xml.childNodes;
          for (var i = 0; i < cn.length; i++) {
            node = cn.item(i);
            if (node.nodeType != 1) continue;
            node2 = Tr.childElement(node);
            if (node2.nodeName == 'name') {
              name = node2;
              data = Tr.nextElement(node2);
            } else {
              name = Tr.nextElement(node2);
              data = node2;
            }
            node2 = Tr.childElement(data);
            value[name.firstChild.nodeValue] = node2 ? this.processArgument(node2) : null;
          }
          return value;
        case 'array':
          value = [ ];
          cn = Tr.childElement(xml).childNodes;
          for (var i = 0; i < cn.length; i++) {
            value.push(this.processArgument(Tr.childElement(cn.item(i))));
          }
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
          if (Ti && Ti.Utils) return Ti.Utils.base64decode(val).toString();
          return val; // TODO: Add support for BASE64
        case 'dateTime.iso8601':
          return val; // TODO: Add support for datatime parsing
        default:
          return null;
        }
      } catch (ex) {
        this.error('Misformatted response');
        this.logException(ex);
      }
    }
    
  , getResponseRoot: function (xml) {
      return this.getXmlRpcRoot(xml, 'struct');
    }
  , getErrorRoot: function (xml) {
      return this.getXmlRpcRoot(xml, 'fault');
    }
  , getXmlRpcRoot: function (xml, tag) {
      var Tr = iQ.XmlTraversal;
      try {
        return Tr.descendant(xml, tag);
      } catch (ex) {
        this.error("Wrong format of XML RPC error: can't locate response root element");
        return null;
      }
    }
  , isXmlRpcError: function (xml) {
      return !!this.getErrorRoot(xml);
    }

  , request: function (method, params, cbs) {
      cbs = applyIf(cbs || { }, { scope: this });
      var body = this.buildRequestBody(method, params);
      this.info(body);
      this.httpClient.post(this.path, {
        headers: {
          'Content-Type': 'text/xml'
        , 'Accept-Type': 'application/xml'
        }
      , body: body
      , responseFormat: 'xml'
      , on: {
          success: function (xml) {
            if (!xml)
              return isFunction(cbs.failure) && cbs.failure.call(cbs.scope, 'xml', 'Response is not in XML format', xml);
            var resp;
            try {
              resp = this.processArgument(this.getResponseRoot(xml) || this.getErrorRoot(xml));
            } catch (ex) {
              this.error("Error parsing XML RPC response");
              this.logException(ex);
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
