iQ.util = {
  callPhone: function (number) {
    var phone = 'tel://' + number.replace(/[^\d\+]+/g, '');
    if (Ti.Platform.model == 'Simulator') {
      alert('Making call to ' + phone);
    } else {
      Ti.Platform.openURL(phone);
    }
  }
, openWebSite: function (url) {
    if (!url.startsWith('http://') && !url.startsWith('https://'))
      url = 'http://' + url;
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
, addContact: function (details) {
    var person = Ti.Contacts.createPerson(details);
    details.kind && (person.kind = details.kind);

    details.birthday && (person.birthday = details.birthday);
    details.firstName && (person.firstName = details.firstName);
    details.lastName && (person.lastName = details.lastName);
    details.middleName && (person.middleName = details.middleName);
    details.nickname && (person.nickname = details.nickname);
    details.fullName && (person.fullName = details.fullName);
    details.prefix && (person.prefix = details.prefix);
    details.suffix && (person.suffix = details.suffix);
    details.note && (person.note = details.note);
    
    details.organization && (person.organization = details.organization);
    details.department && (person.department = details.department);
    details.jobTitle && (person.jobTitle = details.jobTitle);

    details.URL && (person.URL = details.URL);
    details.address && (person.address = details.address);
    details.phone && (person.phone = details.phone);
    details.email && (person.email = details.email);
    details.instantMessage && (person.instantMessage = details.instantMessage);

    Ti.Contacts.save();
    return person;
  }
};
