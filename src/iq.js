include = Ti.include;

include('lib/enjs/enjs.js');
include('lib/joose/joose.js');

namespace('iQ');
namespace('TheApp');
namespace('Design');
namespace('Layouts');

apply(iQ, {
  include: Ti.include

, includeDir: function (dir) {
    var result = true;
    debug("*** INCLUDING DIRECTORY %s".format(dir));
    try {
      var dir = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, dir);
      if (!dir.exists()) {
        error("Can find the path specified %s".format(dir));
        return false;
      }
      dir.getDirectoryListing().each(function (file) {
        try {
          if (!file.endsWith('.js')) return;
          debug("Including file %s".format(file));
          Ti.include(file);
        } catch (ex) {
          error("Error including file %s".format(file));
        };
      });
    } catch (ex) {
      return false;
    }
    return result;
  }.doc({
    namespace: 'iQ'
  , descr: "Iterates over directory *.js files and includes them one by one. \
      Function returns _true_ if all of the files was successfully included or \
      _false_ if any of them have failed. It also returns _false_ if an exception happens \
      or specified directory does not exist. If any of the files fired an excpetion then \
      function skips that file, logs the exception and process further. \
      NB: The function does not look into the subdirectories."
  , args: [
      { name: 'dir', required: true, type: String, typeCheck: true
      , descr: 'Diractory path, relative to the Resources folder' }
    ]
  , returns: {
      type: Boolean
    , descr: "true if all of the *.js files in the directory was successfully included, \
        false otherwise or in case of exception"
  })
  
, buildComponent: function (
    layout,   /// (Object required) JSON structure with component definition
    params    /** (Object optional) Parameters that are passed to the component 
                   during the creation */
  ) {
    /*** iQ.buildComponent(layout: Object, params: Object): iQ.ui.Component
     Builds iQ interface component from the given component layout.
     See Component Layout section in the User Manual for the details of layout definition.
     */
    var constructor = layout.builder;
    if (!isFunction(constructor)) {
      error("Component %s does not supply proper constructor".format(layout.name));
      return null;
    }
    debug("Calling constructor for %s (%s)".format(layout.name, constructor.meta.name));
    return new constructor(layout, params);
  }

, initApp: function (
    config   /// (Object required) Application configuration
  ) {
    /*** iQ.initApp(config: Object): iQ.Application
     Creates main application object (TheApp) and loads all application resources
     (layouts, strings, themes, views, data models, databases, network interfaces etc)
     */
     
    apply(TheApp, new iQ.Application(config));

    iQ.include('i18n/' + TheApp.getLocale() + '.js');
    iQ.include('themes/' + TheApp.getTheme() + '.js');

    iQ.includeDir('views');
    iQ.includeDir('model');

    iQ.include('layouts/layouts.js');

    TheApp.start();
  }

, i18n: function (
    str      /// (String required)
  ) {
    /*** iQ.i18n(str: String): String
     
     */
    return (!str || str.charAt(0) != '%') ? str : ($STRINGS[str.slice(1)] || '');
  }
  
, theme: function (
    str      /// (String required)
  ) {
    return (!str || str.charAt(0) != '%') 
           ? str 
           : 'themes/' + $THEME_NAME + '/' + ($THEME[str.slice(1)] || '');
  }

, isPortrait: function (orient) {
    orient = orient || Titanium.UI.orientation;
    return orient == Titanium.UI.PORTRAIT 
        || orient == Titanium.UI.UPSIDE_PORTRAIT;
  }
  
, isLandscape: function () {
    return !iQ.isPortrait();
  }
};


iQ.include('lib/iqcl/roles/roles.js');
iQ.include('lib/iqcl/util.js');

iQ.include('lib/iqcl/Application.js');
iQ.include('lib/iqcl/ui/ui.js');
iQ.include('lib/iqcl/data/data.js');
iQ.include('lib/iqcl/net/net.js');
iQ.include('lib/iqcl/xml/xml.js');
