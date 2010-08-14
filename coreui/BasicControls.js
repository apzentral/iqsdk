
Class('iQue.UI.Label', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'Label'
  }
});


Class('iQue.UI.ImageView', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'ImageView'
  }
  
, after: {
    initStrings: function () {
      this.__themeStrings.push('image');
    }
  }
});


Class('iQue.UI.Button', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'Button'
  }
});
