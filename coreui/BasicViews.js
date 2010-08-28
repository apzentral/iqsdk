Class('iQue.UI.WebView', {
  isa: iQue.UI.View

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
    canGoBack: function () { return this.tiCtrl.canGoBack.apply(this, arguments); }
  , canGoForward: function () { return this.tiCtrl.canGoForward.apply(this, arguments); }
  , goBack: function () { return this.tiCtrl.canGoForward.apply(this, arguments); }
  , goForward: function () { return this.tiCtrl.goForward.apply(this, arguments); }
  , reload: function () { return this.tiCtrl.reload.apply(this, arguments); }
  , repaint: function () { return this.tiCtrl.repaint.apply(this, arguments); }
  , stopLoading: function () { return this.tiCtrl.stopLoading.apply(this, arguments); }
  , setBasicAuthentication: function () { 
      return this.tiCtrl.setBasicAuthentication.apply(this, arguments); 
    }
  }
});



Class('iQue.UI.ImageView', {
  isa: iQue.UI.View

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


Class('iQue.UI.CoverFlowView', {
  isa: iQue.UI.View

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



Class('iQue.UI.ScrollView', {
  isa: iQue.UI.View
  
, has: {
    tiClass: 'ScrollView'
  , tiFactory: Ti.UI.createScrollView
  }
  
, methods: {
    scrollTo: function (x, y) {
      this.tiCtrl.scrollTo(x, y);
    }
  }
});



Class('iQue.UI.ScrollableView', {
  isa: iQue.UI.View
  
, has: {
    tiClass: 'ScrollableView'
  , tiFactory: Ti.UI.createScrollableView
  , viewIndexes: { required: false, init: null }
  }

, before: function () {
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
