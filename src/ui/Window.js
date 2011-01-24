Class('iQ.ui.Window', {
  isa: iQ.ui.View
  
, has: {
    toolbar: { is: 'ro', required: false }
  }
  
, have: {
    tiClass: 'Window'
  , tiFactory: Ti.UI.createWindow
  , followerMode: false
  , withNavigation: false
  , withPopover: true
  }

, after: {
    initStrings: function () {
      this.__i18nStrings.push('title', 'titlePrompt', 'backButtonTitle');
      this.__themeStrings.push('barImage', 'titleImage', 'backButtonTitleImage');
    }
    
  , render: function () {
      this.renderToolbar();
    }
  }

, override: {
    uiAxis: function (item) {
      if (item.startsWith('=')) return this.toolbar;
      else return this.SUPER(item);
    }
  }

, methods: {
    renderToolbar: function () {
      var tbconf = this.origConfig.toolbar;
      this.toolbar = { };
      tbconf && this.tiCtrl.setToolbar(tbconf.collect(function (item, idx) {
        if (item == '<=>')
          return Ti.UI.createButton({ systemButton: Ti.UI.iPhone.SystemButton.FLEXIBLE_SPACE });
        try {
          var ctrl = iQ.buildComponent(apply({ parent: this }, item));
          this.toolbar[item.name || idx] = ctrl;
          return ctrl.tiCtrl;
        } catch (ex) {
          this.error("Exception during component build process:");
          this.logException(ex);
          return null;
        }
      }, this).compact());
    }
  
  , open: function (opts) {
      this.withPopover = false;
      this.withNavigation = false;
      this.tiCtrl.open(opts || { });
    }
  , createNavigation: function () {
      this.withNavigation = true;
      this.navWin = Ti.UI.createWindow({
        left: this.origConfig.config.left, right: this.origConfig.config.right,
        top: this.origConfig.config.top, bottom: this.origConfig.config.bottom,
        width: this.origConfig.config.width, height: this.origConfig.config.height
      });
      this.navCtrl = Ti.UI.iPhone.createNavigationGroup({
        window: this.tiCtrl
      });
      this.navWin.add(this.navCtrl);
    }
  , openWithNavigation: function (opts) {
      if (!this.navWin)
        this.createNavigation();
      this.navWin.open(opts || { });
    }
  , openWithPopover: function (opts) {
      if (!this.navWin)
        this.createNavigation();
      if (!this.popoverCtrl) {
        this.withPopover = true;
        this.popoverCtrl = Ti.UI.iPad.createPopover({
          left: this.origConfig.config.left, right: this.origConfig.config.right,
          top: this.origConfig.config.top, bottom: this.origConfig.config.bottom,
          width: this.origConfig.config.width, height: this.origConfig.config.height,
          navBarHidden: true
        });
        this.popoverCtrl.add(this.navWin);
      }
      this.popoverCtrl.show(opts || { });
    }
  , close: function (opts) { 
      if (this.withPopover)
        this.popoverCtrl.hide();
      else if (this.withNavigation)
        this.navWin.close(opts || { });
      else if (this.followerMode)
        this.navCtrl.close(this.tiCtrl);
      else
        this.tiCtrl.close(opts || {});
    }
  , openFollower: function (win) {
      if (!this.withNavigation) {
        this.error("You can open follower windows only if you use openWithNavigation for the main window");
        return false;
      }
      win.removeLeftNavButton();
      win.setFollowerMode(this.navCtrl);
      this.navCtrl.open(win.tiCtrl || win);
      return true;
    }

  , setFollowerMode: function (nav) { this.followerMode = true; this.navCtrl = nav; }

  , getTitle: function () { return this.getProperty('title'); }
  , setTitle: function (title) { return this.setProperty('title', title); }
  
  , getRightNavButton: function () { return this.getProperty('rightNavButton'); }
  , setRightNavButton: function (btn) { return this.setProperty('rightNavButton', btn.tiCtrl || btn); }
  , removeRightNavButton: function () { this.tiCtrl.rightNavButton = undefined; }

  , getLeftNavButton: function () { return this.getProperty('leftNavButton'); }
  , setLeftNavButton: function (btn) { return this.setProperty('leftNavButton', btn.tiCtrl || btn); }
  , removeLeftNavButton: function () { this.tiCtrl.leftNavButton = null; }
  }
});
