Class('iQ.data.StoredSource', {
  isa: iQ.data.DataSource,
  
  has: {
    storePath: { is: 'ro', required: true }
  },

  /*augment: {
    addRecord: function (rec) {
      this.save();
    },
    
    removeRecord: function (rec) {
      this.save();
    }
  },*/

  after: {
    initialize: function () {
      this.load();
    }
  },
  
  methods: {
    load: function () {
      this.info("Loading store information from the disk...");
      try {
        this.addData(JSON.parse(Ti.Filesystem.getFile('res/data', this.storePath).read()), null, true);
      } catch (ex) {
        this.error("Unable to load the store from the disk:");
        this.logException(ex);
      }
    },
    
    save: function () {
      this.info("Saving store information to the disk...");
      try {
        Ti.Filesystem.getFile('res/data', this.storePath).write(JSON.stringify(this.data.pluck('data')));
      } catch (ex) {
        this.error("Unable to load the store to the disk:");
        this.logException(ex);
      }
    }
  }
});
