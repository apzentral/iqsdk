Class('iQ.data.Record', {
  has: {
    id: { is: 'ro', required: false }
  , data: { is: 'ro', required: false }
  , idField: { is: 'ro', required: false, init: 'id' }
  }
  
, does: iQ.role.Logging
  
, methods: {
    initialize: function () {
      this.id = this.data[this.idField];
    }
    
  , getId: function () {
      return this.data[this.idField];
    }
  , getValue: function (field) {
      return this.data[field];
    }
  }
  
, my: {
    methods: {
      generateId: function () {
        return Ti.Platform.createUUID();
      }
    }
  }
});
