Class('iQ.data.DataFilter', {
  has: {
    source: { is: 'ro', required: true }
  , filter: { is: 'ro', required: true }
  , filtered: { is: 'ro', required: false }
  }
  
, does: iQ.role.Logging

, methods: {
    BUILD: function (source) {
      return {
        filter: null
      , source: source
      };
    }

  , initialize: function () {
    }

  , applyFilter: function (filter, scope) {
      if (filter)
        this.filter = filter;
      this.filtered = this.source.select(isFunction(this.filter) ? this.filter : function (rec) {
        var result = true;
        for (var key in this.filter) {
          var val = rec.getValue(key);
          var f = this.filter[key];
          if ((isArray(val) && !val.include(f)) ||
              val != f) {
            result = false;
            break;
          }
        }
        return result;
      }, isFunction(this.filter) ? (scope || this) : this);
      this.source.fireEvent('filterUpdated');
    }
  }
});
