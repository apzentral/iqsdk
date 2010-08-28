
(function () {

// Abstract class, can't be initialized directly
var $FormControl = Class({
  isa: iQue.UI.Control

, does: iQue.R.UI.Value
});



Class('iQue.UI.TextArea', {
  isa: $FormControl

, have: {
    tiClass: 'TextArea'
  , tiFactory: Ti.UI.createTextArea
  }

, does: [
    iQue.R.UI.Focusing
  , iQue.R.UI.Editable
  , iQue.R.UI.Enabling
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



Class('iQue.UI.TextField', {
  isa: iQue.UI.TextArea

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



Class('iQue.UI.Switch', {
  isa: $FormControl

, have: {
    tiClass: 'Switch'
  , tiFactory: Ti.UI.createSwitch
  }

, does: [
    iQue.R.UI.Enabling
  ]
});



Class('iQue.UI.Slider', {
  isa: $FormControl

, have: {
    tiClass: 'Slider'
  , tiFactory: Ti.UI.createSlider
  }
  
, does: [
    iQue.R.UI.Enabling
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
