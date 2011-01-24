Class('iQ.ui.WebView', {
  isa: iQ.ui.View

, have: {
    tiClass: 'WebView'
  , tiFactory: Ti.UI.createWebView
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('html', 'url');
    }
  }

, methods: {
    canGoBack: function () { return this.tiCtrl.canGoBack(); }
  , canGoForward: function () { return this.tiCtrl.canGoForward(); }
  , goBack: function () { return this.tiCtrl.canGoForward(); }
  , goForward: function () { return this.tiCtrl.goForward(); }
  , reload: function () { return this.tiCtrl.reload(); }
  , repaint: function () { return this.tiCtrl.repaint(); }
  , stopLoading: function () { return this.tiCtrl.stopLoading(); }
  , setBasicAuthentication: function () { 
      return this.tiCtrl.setBasicAuthentication.apply(this, arguments); 
    }

  , getURL: function () { return this.getProperty('url'); }
  , setURL: function (html) { return this.setProperty('url', html); }
  , getHTML: function () { return this.getProperty('html'); }
  , setHTML: function (html) { return this.setProperty('html', html); }
  }
});



Class('iQ.ui.ImageView', {
  isa: iQ.ui.View

, have: {
    tiClass: 'ImageView'
  , tiFactory: Ti.UI.createImageView
  }

, after: {
    initStrings: function () {
      this.__themeStrings.push(
        'image'
      , 'images'
      , 'defaultImage'
      );
    }
  }

, methods: {
    getImage: function () {
      return this.getProperty('image');
    }
  , setImage: function (img) {
      this.setProperty('image', img);
    }
    
  , allowScaling: function () {
      this.setProperty('canScale', true);
    }
  , denyScaling: function () {
      this.setProperty('canScale', true);
    }
  , canScale: function () {
      this.getProperty('canScale');
    }
    
  , start: function () { return this.tiCtrl.start(); }
  , pause: function () { return this.tiCtrl.pause(); }
  , stop: function () { return this.tiCtrl.stop(); }
  }
});


Class('iQ.ui.CoverFlowView', {
  isa: iQ.ui.View

, have: {
    tiClass: 'CoverFlowView'
  , tiFactory: Ti.UI.createCoverFlowView
  }

, after: {
    initStrings: function () {
      this.__themeStrings.push('images');
    }
  }

, methods: {
    getImage: function (idx) {
      return this.getProperty('images')[idx];
    }
  , setImage: function (idx, img) {
      this.tiCtrl.setURL(idx, img);
    }
  , activeImage: function () {
      return this.getProperty('selected');
    }
  , scrollTo: function (idx) {
      this.tiCtrl.setProperty('selected', idx);
    }
  }
});



Class('iQ.ui.ScrollView', {
  isa: iQ.ui.View
  
, have: {
    tiClass: 'ScrollView'
  , tiFactory: Ti.UI.createScrollView
  }
  
, methods: {
    scrollTo: function (x, y) {
      this.tiCtrl.scrollTo(x, y);
    }
  }
});



Class('iQ.ui.ScrollableView', {
  isa: iQ.ui.View
  
, has: {
    viewIndexes: { required: false, init: null }
  }
  
, have: {
    tiClass: 'ScrollableView'
  , tiFactory: Ti.UI.createScrollableView
  }

, before: {
    render: function () {
      this.viewIndexes = [ ];
    }
  }
  
, methods: {
    scrollTo: function (view) {
      this.tiCtrl.scrollToView(view);
    }
  , scrollToView: function (view) {
      this.scrollTo(view);
    }
    
  , activeViewIndex: function () {
      return this.getProperty('currentPage');
    }
  , activeView: function () {
      return this.components[this.viewIndexes[this.activeViewIndex()]];
    }

  , doAdd: function (view, idx) {
      this.viewIndexes[idx] = view.name || idx;
      this.tiCtrl.addView(view.tiCtrl || view);
    }
  , doRemove: function (view, idx) {
      this.viewIndexes[idx] = undefined;
      this.tiCtrl.removeView(view.tiCtrl || view);
    }
  }
});
