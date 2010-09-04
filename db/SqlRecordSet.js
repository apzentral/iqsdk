
Class('iQue.DB.SqlRecordSet', {
  has: {
    rs: { is: 'ro', required: true }
  , fields: { is: 'ro', required: true }
  , results: { is: 'ro', required: false, init: null }
  }
  
, does: iQue.R.Logging
  
, methods: {
    BUILD: function (rs, fields) {
      return { rs: rs, fields: fields };
    }
  
  , count: function () {
      return this.rs.rowCount;
    }
  , isEmpty: function () {
      return this.count() == 0;
    }
  
  , each: function (iterator, scope) {
      this.getResults().each(iterator, scope || this);
      return this;
    }
  , collect: function (iterator, scope) {
      return this.getResults().collect(iterator, scope || this);
    }
  , first: function (iterator, scope) {
      return this.getResults().first(iterator, scope || this);
    }
  , getResults: function () {
      if (this.results) return this.results;
      this.results = [ ];
      var fc = this.rs.fieldCount(), fs = [ ];
      for (var i = 0 ; i < fc ; i++)
        fs.push(this.rs.fieldName(i));
      while (this.rs.validRow) {
        var r = { };
        fs.each(function (f) {
          r[f] = this.rs.fieldByName(f);
        }, this);
        this.results.push(r);
        this.rs.next();
      }
      return this.results;
    }
  }
});
