
include = Ti.include;

iQue = {
  i18n: function (str) {
    return (!str || str.charAt(0) != '%') ? str : ($STRINGS[str.slice(1)] || '');
  }
, theme: function (str) {
    return (!str || str.charAt(0) != '%') ? str : 'themes/' + $THEME_NAME + '/' + ($THEME[str.slice(1)] || '');
  }

, buildComponent: function (item, params) {
    var constructor = item.builder;
    if (!isFunction(constructor)) {
      this.error("Component " + item.name + " does not supply proper constructor");
      return null;
    }
    return new constructor(item, params);
  }
  
, callPhone: function (number) {
    Ti.Platform.openURL('tel://' + number.replace(/[^\d\+]+/g, ''));
  }
, openWebSite: function (url) {
    Ti.Platform.openURL(url);
  }
, openAppStore: function (url) {
    if (Ti.Platform.model == 'Simulator') {
      alert('Opening iTunes for: ' + url);
    } else {
      Ti.Platform.openURL(url);
    }
  }
, openYouTube: function (ytid) {
    Ti.Platform.openURL('http://youtube.com/watch?v=' + ytid);
  }
};

include('lib/ique/roles/Analytics.js');
include('lib/ique/roles/Logging.js');

include('lib/ique/controller/Application.js');
include('lib/ique/coreui/coreui.js');
include('lib/ique/db/db.js');
include('lib/ique/net/HTTP.js');

