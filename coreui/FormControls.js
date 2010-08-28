
(function () {

// Abstract class, can't be initialized directly
var $FormControl = Class({
  isa: iQue.UI.Control

, methods: {
    getValue: function () {
      return this.tiCtrl.getValue();
    }
  , setValue: function (value) {
      return this.tiCtrl.getValue(value);
    }
  }
});


Class('iQue.UI.TextField', {
  isa: $FormControl

, have: {
    tiClass: 'TextField'
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('value');
      this.__i18nStrings.push('hintText');
    }
  }
  
, methods: {
    focus: function () {
      return this.tiCtrl.focus();
    }
  }
});

}) ();
