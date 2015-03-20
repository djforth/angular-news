var _;

_ = require('lodash');

module.exports = function() {
  return {
    restrict: 'A',
    transclude: true,
    controller: 'NewsCtrl',
    scope: {},
    templateUrl: 'news/news.html'
  };
};
