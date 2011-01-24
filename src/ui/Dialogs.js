Class('iQ.ui.Dialog', {
  isa: iQ.ui.Component
});

Class('iQ.ui.OptionDialog', {
  isa: iQ.ui.Dialog

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
    show: function (opts) {
      if (opts && opts.view)
        opts.view = opts.view.tiCtrl || opts.view;
      this.tiCtrl.show(opts || { });
    }
  , hide: function () { this.tiCtrl.hide(); }
  }
});

Class('iQ.ui.EmailDialog', {
  isa: iQ.ui.Dialog

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


Class('iQ.ui.AlertDialog', {
  isa: iQ.ui.Dialog

, have: {
    tiClass: 'AlertDialog'
  , tiFactory: Ti.UI.createAlertDialog
  }

, override: {
    BUILD: function (title, message, buttons, cancel) {
      return this.SUPER({
        config: {
          title: title
        , message: message
        , buttonNames: buttons || [ ]
        , cancel: cancel
        }
      });
    }
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push(
        'title'
      , 'message'
      , 'buttonNames'
      );
    }
  }

, methods: {
    show: function (opts) {
      if (opts && opts.view)
        opts.view = opts.view.tiCtrl || opts.view;
      this.tiCtrl.show(opts || { });
    }
  , hide: function () { this.tiCtrl.hide(); }
  }
});
