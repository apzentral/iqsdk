
Role('iQ.role.UI.Masked', {
  have: {
    maskState: false
  , maskView: null
  }
  
, after: {
    render: function () {
      this.renderMask();
    }
  }
  
, methods: {
    renderMask: function () {
      //if (this.maskView) return;

      var layout = this.origConfig.mask;
      layout.config = apply({
        top: 0, left: 0, right: 0, bottom: 0,
        visible: false,
        zIndex: 1000
      }, layout.config);
      
      this.maskView = iQ.buildComponent(layout);
      this.add(this.maskView);
    }

  , showMask: function () {
      this.maskView && this.maskView.show();
    }
  , hideMask: function () {
      this.maskView && this.maskView.hide();
    }
  }
});
