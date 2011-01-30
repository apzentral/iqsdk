/* TODO: Type in brief name of the app */ = { };
Ti.include('lib/iqcl/iq.js');

iQ.initApp({
  name: // TODO: Type in the name of the app
  debugMode: false,
  
  locales: {
    'default': 'en',
    defined: [ 'en' ]
  },
  themes: {
    'default': 'default',
    defined: [ 'default' ]
  }
  // TODO: Add other app configuration parameters which can be lately accessed via TheApp.config.<parameter>

  augments: {
    loadData: function () {
      // TODO: Do some custom data initialization on application load
    }
  },

  methods: {
    // TODO: Define your global application methods here
  }
});
