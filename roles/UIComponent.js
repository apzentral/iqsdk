
Role('iQue.R.UIComponent', {
  after: {
    initialize: function () {
      this.construct();
      this.listen();
      this.render();
    }
  }
});
