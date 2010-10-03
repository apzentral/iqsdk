
Class('iQ.data.SqlRecord', {
  has: {
    fields: { is: 'ro', required: true }
  }
  
, after: {
    initialize: function () {
      this.applyFields();
    }
  }
  
, methods: {
    applyFields: function () {
      fields.each(function (field) {
        this[field.name] = field.value;
      }, this);
    }
  }
});
