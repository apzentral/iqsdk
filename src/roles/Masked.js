
Role('iQ.role.UI.Masked', {
  have: {
    maskState: false
  , maskView: null
  , maskMessage: '%defaultMaskMessage'
  }
, methods: {
    showMask: function () {
      if (!this.maskView) {
        this.maskView = iQue.buildComponent({
          builder:iQue.UI.Label,
          config: {
            top:0,left:0,right:0,bottom:0,
            backgroundColor:'#80000000',
            color:'white',font:{fontWeight:'bold'},
            textAlign:'center',
            text:this.maskMessage,
            visible:false,
            zIndex:1000
          }
        });
        this.add(this.maskView);
      }
      this.maskView.show();
    }
  , hideMask: function () {
      this.maskView.hide();
    }
  }
});
