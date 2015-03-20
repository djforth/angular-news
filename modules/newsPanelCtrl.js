'use strict';
var _;

_ = require('lodash');

module.exports = [
  '$scope', '$sce', "NewsFcty", function($scope, $sce, NewsFcty) {
    $scope.panelNews = [];
    NewsFcty.flush();
    return NewsFcty.getNews().then(function(results) {
      return $scope.panelNews = _.first(results.data, 2);
    });
  }
];
