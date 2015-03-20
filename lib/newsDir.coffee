_  = require('lodash')

module.exports = ()->
  return {
    restrict: 'A',
    transclude: true,
    controller:'NewsCtrl',
    scope:{ },
    templateUrl: 'news/news.html',
  }