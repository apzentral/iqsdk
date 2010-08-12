
iQue = {
  i18n: function (str) {
    return (!str || str.charAt(0) != '%') ? str : ($STRINGS[str.slice(1)] || '');
  }
};
