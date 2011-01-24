/**
 name: String,
 builder: iQ.ui.Picker,
 config: {
 
 },
 columns: [
   { name: String,
     dataSource: 
   }
 ]

 */

Class('iQ.ui.Picker', {
  isa: iQ.ui.View,
  
  have: {
    tiClass: 'Picker',
    tiFactory: Ti.UI.createPicker,
    columns: null,
    defaultAxis: 'columns'
  },
  
  after: {
    render: function () {
      this.renderColumns();
    }
  },
  
  override: {
    uiAxis: function (item) {
      if (item.startsWith('|')) return this.columns;
      else return this.SUPER(item);
    }
  },

  methods: {
    renderColumns: function () {
      this.debug("Rendering columns...");
      try {
        this.columns = this.columns || { };
        (this.origConfig.columns || [ ]).each(function (item, idx) {
          item.builder = iQ.ui.Picker.Column;
          this.add(iQ.buildComponent(apply({ parent: this }, item)));
        }, this);
      } catch (ex) {
        this.error("Error rendering columns:");
        this.logException(ex);
      }
    }
  }
});

Class('iQ.ui.Picker.Column', {
  isa: iQ.ui.View,
  
  have: {
    tiClass: 'PickerColumn',
    tiFactory: Ti.UI.createPickerColumn,
    rows: null,
    defaultAxis: 'rows'
  },
  
  after: {
    render: function () {
      this.renderRows();
    }
  },

  override: {
    uiAxis: function (item) {
      if (item.startsWith('+')) return this.rows;
      else return this.SUPER(item);
    },
    
    doAdd: function (view, idx) {
      try {
        this.tiCtrl.addRow(view.tiCtrl || view);
      } catch (ex) {
        this.error("Error during adding tiCtrl:");
        this.logException(ex);
      }
    },
    doRemove: function (view, idx) {
      try {
        this.tiCtrl.removeRow(view.tiCtrl || view);
      } catch (ex) {
        this.error("Error during removing tiCtrl:");
        this.logException(ex);
      }
    }
  },

  methods: {
    renderRows: function () {
      this.debug("Rendering rows...");
      try {
        this.rows = this.rows || { };
        (this.origConfig.rows || [ ]).each(function (item, idx) {
          item.builder = iQ.ui.Picker.Row;
          this.add(iQ.buildComponent(apply({ parent: this }, item)));
        }, this);
      } catch (ex) {
        this.error("Error rendering rows:");
        this.logException(ex);
      }
    }
  }
});

Class('iQ.ui.Picker.Row', {
  isa: iQ.ui.View,

  have: {
    tiClass: 'PickerRow',
    tiFactory: Ti.UI.createPickerRow,
    useDataSource: true
  },
});
