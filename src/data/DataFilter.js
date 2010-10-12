Class('iQ.data.DataFilter', {
  has: {
    source: { is: 'ro', required: true }
  , filter: { is: 'ro', required: true }
  , filtered: { is: 'ro', required: false }
  }
  
, does: iQ.role.Logging

, methods: {
    BUILD: function (source, filter) {
      return {
        source: source
      , filter: filter
      };
    }

  , initialize: function () {
      this.applyFilter();
      this.source.dataUpdated = this.source.dataUpdated.after(this.applyFilter, this);
    }

  , applyFilter: function () {
      this.filtered = [ ];
      this.source.each(function (rec) {
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
        if (result) this.filtered.push(rec);
      }, this);
    }
  }
});
