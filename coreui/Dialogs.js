Class('iQue.UI.Dialog', {
  isa: iQue.UI.Control
});

Class('iQue.UI.OptionDialog', {
  isa: iQue.UI.Dialog

, have: {
    tiClass: 'OptionDialog'
  , tiFactory: Ti.UI.createOptionDialog
  }
  
, override: {
    BUILD: function (title, options, cancel, destructive) {
      return this.SUPER({
        config: {
          title: title
        , options: options
        , cancel: cancel
        , destructive: destructive
        }
      });
    }
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'options');
    }
  }
  
, methods: {
    show: function () { this.tiCtrl.show(); }
  }
});

Class('iQue.UI.EmailDialog', {
  isa: iQue.UI.Dialog

, have: {
    tiClass: 'EmailDialog'
  , tiFactory: Ti.UI.createEmailDialog
  }

, override: {
    BUILD: function (email, conf) {
      return this.SUPER({
        config: apply(apply({}, email), conf)
      });
    }
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push(
        'subject'
      , 'messageBody'
      , 'toRecipients'
      , 'ccRecipients'
      , 'bccRecipients');
      this.__themeStrings.push('barImage');
    }
  }

, methods: {
    open: function () { this.tiCtrl.open(); }
  , attach: function (file) { this.tiCtrl.addAttachment(file); }
  }
});
