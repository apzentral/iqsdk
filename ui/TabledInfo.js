Class('iQue.view.ContactInfo', {
  isa: iQue.UI.TableView

, has: {
    phoneNumbers: { is: 'ro', required: false, init: [ ] }
  , emailAddresses: { is: 'ro', required: false, init: [ ] }
  , webSites: { is: 'ro', required: false, init: [ ] }
  , twitterAccounts: { is: 'ro', required: false, init: [ ] }
  , jabberAccounts: { is: 'ro', required: false, init: [ ] }
  }
  
, 
});
