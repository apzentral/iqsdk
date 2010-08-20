
Class('iQue.UI.Label', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'Label'
  }
  
, after: {
    initStrings: function () {
      this.__i18nStrings.push('text');
    }
  }

, methods: {
    setText: function (text) {
      return this.tiCtrl.setText(text);
    }
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

, methods: {
    setImage: function (url) {
      return this.tiCtrl.setImage(url);
    }
  }
});


Class('iQue.UI.Button', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'Button'
  }
});

Class('iQue.UI.ButtonBar', {
  isa: iQue.UI.Control

, have: {
    tiClass: 'ButtonBar'
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('labels');
    }
  }
});
