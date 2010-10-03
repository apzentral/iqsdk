
(function () {

// Abstract class, can't be initialized directly
var $FormControl = Class({
  isa: iQ.ui.Component

, does: iQ.role.UI.Value
});



Class('iQ.ui.TextArea', {
  isa: $FormControl

, have: {
    tiClass: 'TextArea'
  , tiFactory: Ti.UI.createTextArea
  }

, does: [
    iQ.role.UI.Focusing
  , iQ.role.UI.Editable
  , iQ.role.UI.Enabling
  ]

, after: {
    initStrings: function () {
      this.__i18nStrings.push('value');
    }
  }
  
, methods: {
    hasText: function () { return this.tiCtrl.hasText(); }
  }
});



Class('iQ.ui.TextField', {
  isa: iQ.ui.TextArea

, have: {
    tiClass: 'TextField'
  , tiFactory: Ti.UI.createTextField
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('hintText');
    }
  }
});



Class('iQ.ui.Switch', {
  isa: $FormControl

, have: {
    tiClass: 'Switch'
  , tiFactory: Ti.UI.createSwitch
  }

, does: [
    iQ.role.UI.Enabling
  ]
});



Class('iQ.ui.Slider', {
  isa: $FormControl

, have: {
    tiClass: 'Slider'
  , tiFactory: Ti.UI.createSlider
  }
  
, does: [
    iQ.role.UI.Enabling
  ]
  
, after: {
    initStrings: function () {
      this.__themeStrings.push(
        'disabledLeftTrackImage'
      , 'disabledRightTrackImage'
      , 'disabledThumbImage'
      , 'highlightedLeftTrackImage'
      , 'highlightedRightTrackImage'
      , 'highlightedThumbImage'
      , 'leftTrackImage'
      , 'rightTrackImage'
      , 'selectedLeftTrackImage'
      , 'selectedRightTrackImage'
      , 'selectedThumbImage'
      , 'thumbImage'
      );
    }
  }
});

}) ();
