
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
};

include('lib/ique/roles/Analytics.js');
include('lib/ique/roles/Logging.js');

include('lib/ique/coreui/coreui.js');
include('lib/ique/db/db.js');
include('lib/ique/net/HTTP.js');

