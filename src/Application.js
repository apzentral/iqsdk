
Class('iQ.Application', {
  does: [
    iQ.role.Logging
  , iQ.role.EventEmitter
  ]

, has: {
    name: { required: true }
  , config: { required: true }
  , layout: { required: true }
  }
  
, have: {
    view: null
  , dialogs: null
  , windows: null
  , db: null
  }

, methods: {
    BUILD: function (config) {
      var name = config.name;
      var layout = config.layout;
      delete config.name;
      delete config.layout;
      return {
        name: name
      , config: config
      , layout: layout
      }
    }

  , initialize: function () {
      try {
        this.debug("Extending application with additional methods...");
        this.dialogs = { };
        this.windows = { };
        var ext = { };
        'methods after before override augment'.split(' ').each(function (key) {
          if (!this.config[key]) return;
          ext[key] = this.config[key];
          this.config[key] = undefined;
        }, this);
        this.meta.extend(ext);
      } catch (ex) {
        this.error("Failed to extend application with additional methods:");
        this.logException(ex);
        this.panic("Application is unable to load");
        return false;
      }
      return true;
    }

  , start: function (layout) {
      var success = true;
      this.layout = this.layout || layout;
      try {
        this.on('dataLoaded', this.loadLayout, this, { single: true });
        success = this.loadData();
      } catch (ex) {
        this.error("Exception during application startup:");
        this.logException(ex);
        success = false;
      }
      if (!success) {
        this.panic("Application is unable to load");
        return false;
      }
    }

  , loadData: function () {
      this.debug("Loading data");
      try {
        this.loadDatabase();
        if (isFunction(this.INNER))
          this.INNER();
        if (this.config.waitForData !== true)
          this.fireEvent('dataLoaded');
      } catch (ex) {
        this.error("Failed to load data, exception raised:");
        this.logException(ex);
        return false;
      }
      return true;
    }

  , loadDatabase: function () {
      var dbConfig = this.config.database;
      if (!dbConfig) return true;
      var dbName = dbConfig.name;
      var dbPath = dbConfig.path;
      var dbClear = dbConfig.clear;
      this.debug("Loading database %s/$s".format(dbPath, dbName));
      try {
        this.db = new iQ.data.SqlStore(dbName, dbPath, dbClear);
      } catch (ex) {
        this.error("Failed to load database, exception raised:");
        this.logException(ex);
        this.db = null;
        return false;
      }
      return true;
    }

  , loadLayout: function (suppressOpen) {
      this.debug("Loading application interface");
      try {
        if (this.layout.type && isUndefined(this.layout.builder)) {
          this.layout.builder = iQ.ui[{
            split: 'Split',
            tabs: 'TabGroup',
            nav: 'Navigation',
            win: 'Window'
          }[this.layout.type]];
        }
        this.view = iQ.buildComponent(this.layout, { });
        if (suppressOpen !== true) {
          if  (this.layout.builder != iQ.ui.Navigation) {
            this.view.open();
          } else {
            var win = iQ.buildComponent({
              builder: iQ.ui.Window
            , config: { top: 0, left: 0, right: 0, bottom: 0 }
            });
            win.add(this.view);
            win.open();
          }
        }
        this.bindListeners();
        this.INNER && this.INNER();
      } catch (ex) {
        this.error("Failed to load application interface, exception raised:");
        this.logException(ex);
        this.view = null;
        return false;
      }
      return true;
    }
    
  , bindListeners: function () {
      this.debug("Binding application event listeners");
      if (isFunction(this.INNER)) {
        try {
          return this.INNER();
        } catch (ex) {
          this.error("Failed to bind application event listeners, exception raised:");
          this.logException(ex);
          return false;
        }
      }
      return true;
    }
    
  , uiPath: function (path) {
      return this.view.uiPath(path);
    }

  , openDialog: function (dlg) {
      if (isString(dlg))
        dlg = this.dialogs[dlg] || TheApp.layouts[dlg];
      else if (isObject(dlg) && !(dlg instanceof iQ.ui.Component))
        this.dialogs[dlg.name || Object.numericKeys(this.dialogs).length] = 
        dlg = iQ.buildComponent(dlg);

      if (!dlg) {
        this.error("Wrong dialog object specified for Application#openDialog method:");
        this.dumpObject(dlg);
      }
      
      dlg.open();
    }

  , openWindow: function (win) {
      if (isString(win))
        win = this.windows[win] || Layouts[win];
      if (isObject(win) && !(win instanceof iQ.ui.Component))
        this.windows[win.name || Object.numericKeys(this.windows).length] = 
        win = iQ.buildComponent(win);

      if (!win) {
        this.error("Wrong window object specified for Application#openWindow method:");
        this.dumpObject(win);
      }

      if (this.layout.builder == iQ.ui.Navigation) {
        this.view.open(win)
      } else if (this.layout.builder = iQ.ui.TabGroup) {
        this.view.getActiveTab().open(win.tiCtrl);
      } else {
        win.open();
      }
    }

  , getLocale: function () {
      var phoneLocale = Ti.Platform.locale;
      var localeConfig = this.config.locales;
      if (localeConfig.force)
        return localeConfig.force;
      else if (localeConfig.defined.include(phoneLocale))
        return phoneLocale;
      else
        return localeConfig['default'];
    }

  , getTheme: function () {
      var themeConfig = this.config.themes;
      if (isDefined(themeConfig) && isDefined(themeConfig['default']))
        return themeConfig['default'];
      return 'default';
    }

/*  , hasTabsLayout: function () {
      return this.layout.type == 'tabs';
    }
  , hasSplitLayout: function () {
      return this.layout.type == 'split';
    }
  , hasCustomLayout: function () {
      return this.layout.type != 'tabs' && this.layout.type != 'split';
    }*/
  }
});
