var _;

_ = require('lodash');

module.exports = [
  '$scope', '$sce', "$stateParams", "NewsFcty", function($scope, $sce, $stateParams, NewsFactory) {
    var id;
    id = $stateParams.newsId;
    $scope.error = null;
    $scope.article = null;
    return NewsFactory.getData().then(function(results) {
      return $scope.article = _.where(results.data, {
        'id': parseInt(id)
      })[0];
    }, function(e) {
      return $scope.error = e;
    });
  }
];
