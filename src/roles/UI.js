
Module('iQ.role.UI');

Role('iQ.role.UI.Value', {
  requires: [
    'setProperty', 'getProperty'
  ]
, methods: {
    getValue: function () {
      return this.getProperty('value');
    }
  , setValue: function (val) {
      this.setProperty('value', val);
    }
  }
});

Role('iQ.role.UI.Focusing', {
  methods: {
    focus: function () {
      return this.tiCtrl.focus();
    }
  , blur: function () {
      return this.tiCtrl.blur();
    }
  }
});

Role('iQ.role.UI.Enabling', {
  requires: [
    'setProperty', 'getProperty'
  ]
, methods: {
    enable: function () {
      this.setProperty('enabled', true);
    }
  , disable: function () {
      this.setProperty('enabled', false);
    }
  , isEnabled: function () {
      return this.getProperty('enabled');
    }
  }
});

Role('iQ.role.UI.Editable', {
  requires: [
    'setProperty', 'getProperty'
  ]
, methods: {
    allowEditing: function () {
      this.setProperty('editable', true);
    }
  , denyEditing: function () {
      this.setProperty('editable', false);
    }
  , isEditable: function () {
      return this.getProperty('editable');
    }
  }
});
