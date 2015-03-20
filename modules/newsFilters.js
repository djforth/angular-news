'use strict';
var _;

_ = require('lodash');

module.exports = function() {
  return function(data, ftr) {
    var month, year;
    if (_.isNull(ftr) || _.isUndefined(ftr)) {
      return data;
    }
    month = ftr.date.getMonth();
    year = ftr.date.getFullYear();
    return _.filter(data, function(d) {
      return d.pubDate.getMonth() === month && d.pubDate.getFullYear() === year;
    });
  };
};
