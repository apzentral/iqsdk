
Role('iQue.R.Analytics', {
  methods: {
    tiaFeatureEvent: function (eventName, eventArgs) {
      Ti.Analytics.featureEvent(eventName, eventArgs);
    }
  , tiaNavEvent: function (eventName, eventArgs) {
      Ti.Analytics.navEvent(eventName, eventArgs);
    }
  , tiaSettingsEvent: function (eventName, eventArgs) {
      Ti.Analytics.settingsEvent(eventName, eventArgs);
    }
  , tiaTimedEvent: function (eventName, eventArgs) {
      Ti.Analytics.timedEvent(eventName, eventArgs);
    }
  , tiaUserEvent: function (eventName, eventArgs) {
      Ti.Analytics.userEvent(eventName, eventArgs);
    }
  }
});
