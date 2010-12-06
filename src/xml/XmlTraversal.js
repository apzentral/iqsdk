
iQ.XmlTraversal = {
  childElement: function (node) {
    try {
      if (node) node = node.firstChild;
      while (node && node.nodeType != 1) node = node.nextSibling;
      return node;
    } catch (ex) {
      return null;
    }
  }
, nextElement: function (node) {
    try {
      if (node) node = node.nextSibling;
      while (node && node.nodeType != 1) node = node.nextSibling;
      return node;
    } catch (ex) {
      return null;
    }
  }
, descendant: function (node, tag) {
    try {
      var node2;
      if (node.nodeName == tag) return node;
      node = this.childElement(node);
      while (node && node.nodeName != tag) {
        node2 = this.descendant(node, tag);
        if (node2) return node2;
        node = this.nextElement(node);
      }
      return node;
    } catch (ex) {
      return null;
    }
  }
};
