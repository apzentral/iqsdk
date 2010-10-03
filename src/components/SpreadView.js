
Class('iQ.views.SpreadView', {
  isa: iQ.ui.ScrollView
  
, has: {
    views: { is: 'ro', required: false }
  , currentOrientation: { is: 'ro', required: false }
  , emptyView: { is: 'ro', required: false }
  }

, after: {
    render: function () {
      this.renderViews();
    }
    
  , listen: function () {
      iQ.on(Ti.Gesture, 'orientationchange', this.onOrientationChange, this);
    }
  }

, methods: {
    refresh: function () {
      this.data = null;
      this.renderViews();
    }
    
  , renderViews: function () {
      this.getData();
      this.views && this.views.each(function (view) {
        this.remove(view);
      }, this);
      this.views = [ ];
      if (!this.data || this.data.length == 0)
        this.renderEmptyView();
      else
        this.data.each(this.renderView, this)
    }

  , renderView: function (data, idx) {
      var viewCfg = this.origConfig.viewClasses[data.className || 'default'];
      var pos = this.positionView(idx);
      var orient = iQ.isPortrait() ? 'portrait' : 'landscape';
      viewCfg.parent = this;
      viewCfg.config.top = pos.top;
      viewCfg.config.left = pos.left;
      viewCfg.config.width = this.origConfig.spreadLayout[orient].cardWidth;
      viewCfg.config.height = this.origConfig.spreadLayout[orient].cardHeight;
      viewCfg.dataSource = data;
      var view = iQ.buildComponent(viewCfg);
      this.views.push(view);
      if (this.emptyView)
        this.emptyView.hide();
      this.add(view);
    }
    
  , renderEmptyView: function () {
      var viewCfg = this.origConfig.emptyView;
      if (!viewCfg) return;
      viewCfg = apply({ parent: this }, viewCfg);
      if (this.emptyView) {
        this.emptyView.show();
        return;
      } else {
        this.emptyView = iQ.buildComponent(viewCfg);
        this.add(this.emptyView);
      }
    }
  
  , positionView: function (idx) {
      var dc = Ti.Platform.displayCaps;
      var sl = this.origConfig.spreadLayout[iQ.isPortrait() ? 'portrait' : 'landscape'];
      var cpr = Math.floor((sl.pageWidth - sl.pageMargins * 2) / (sl.cardWidth + sl.cardMargins));
      var row = Math.floor(idx / cpr);
      var col = idx % cpr;
      return {
        top: sl.pageMargins + (sl.cardHeight + sl.cardMargins) * row
      , left: sl.pageMargins + (sl.cardWidth + sl.cardMargins) * col
      }
    }
    
  , onOrientationChange: function (ev) {
      var orientation = iQ.isPortrait(ev.orientation) ? 'portrait' : 'landscape';
      if (this.currentOrientation == orientation)
        return;
      this.currentOrientation = orientation;
      this.refresh();
    }
  }
});
