Class('iQ.ui.MapView', {
  isa: iQ.ui.View

, have: {
    annotations: null
  , tiClass: 'MapView'
  , tiFactory: Ti.Map.createView
  , useDataSource: false
  }

, before: {
    initialize: function () {
      this.paging = this.origConfig.paging || { };
      this.paging.pagesOpened = 1;
    }
  , construct: function () {
      this.annotations = { };
    }
  }

, after: {
    render: function () {
      this.renderAnnotations();
      return true;
    }
  , onDataAvailable: function () {
      this.empty(false);
      this.renderAnnotations();
    }
  }

, methods: {
    empty: function (emptyData) {
      this.removeAllAnnotations();
      if (emptyData !== false)
        this.data = null;
    }
  , refresh: function () {
      this.empty();
      this.renderAnnotations();
    }
  , renderAnnotations: function () {
      this.debug("Rendering annotations for map %s".format(this.uiName()));
      var data = this.getData();
      if (data instanceof iQ.data.DataSource)
        data = data.getRecords();
      var len = data.length;
      if (this.paging.use)
        data = data.slice(0, this.paging.pageSize * this.paging.pagesOpened);
      data.each(this.renderAnnotation, this);
    }
  , renderAnnotation: function (item, idx) {
      var className = item.className || 'default';
      var anConfig = this.origConfig.annotationClasses[className];
      this.debug("Rendering annotation of class " + className);
      item.itemIndex = idx;
      var ann = new iQ.ui.MapView.Annotation(item, anConfig, className);
      ann.parent = this;
      this.annotations[item.name] = ann;
      this.addAnnotation(ann);
    }

  , addAnnotation: function (ann) {
      this.tiCtrl.addAnnotation(ann.tiCtrl || ann);
    }
  , removeAnnotation: function (ann) {
      this.tiCtrl.removeAnnotation(ann.tiCtrl || ann);
    }
  , removeAllAnnotations: function () {
      this.tiCtrl.removeAllAnnotations();
    }
  , selectAnnotation: function (ann) {
      this.tiCtrl.selectAnnotation(ann.tiCtrl || ann);
    }
  , deselectAnnotation: function (ann) {
      this.tiCtrl.deselectAnnotation(ann.tiCtrl || ann);
    }
    
  , addRoute: function () {
      
    }
  , removeRoute: function () {
    
    }
    
  , zoom: function () {
    
    }
  }
});

Class('iQ.ui.MapView.Annotation', {
  isa: iQ.ui.Component

, has: {
    mapping: { is: 'ro', required: false }
  }
  
, have: {
    tiClass: 'Annotation'
  , tiFactory: Ti.Map.createAnnotation
  }
  
, override: {
    BUILD: function (data, config, annotationClass) {
      this.layout = config.layout;
      this.mapping = config.mapping;
      this.data = data;
      var o = this.SUPER(config);
      apply(o.origConfig.config, {
        annotationClass: annotationClass
      , iQData: data.data
      });
      return apply(o, {
        annotationClass: annotationClass
      , layout: config.layout
      , mapping: config.mapping || { }
      });
    }
  , initConfig: function (config) {
      var m = this.mapping || { };
      if (m.title) config.title = this.data.getValue(m.title.field || m.title);
      if (m.subtitle) config.subtitle = this.data.getValue(m.subtitle.field || m.subtitle);
      if (m.leftImage) config.leftImage = this.data.getValue(m.leftImage.field || m.leftImage);
      if (m.rightImage) config.rightImage = this.data.getValue(m.rightImage.field || m.rightImage);
      if (m.latitude) config.latitude = this.data.getValue(m.latitude.field || m.latitude);
      if (m.longitude) config.longitude = this.data.getValue(m.longitude.field || m.longitude);
      return config;
    }
  }
});
