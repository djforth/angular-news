_ = require('lodash')

module.exports = ['$scope', '$sce', "$stateParams", "NewsFcty", ($scope, $sce, $stateParams, NewsFactory)->

  id = $stateParams.newsId
  $scope.error   = null
  $scope.article = null

  NewsFactory.getData().then (results)->
    $scope.article = _.where(results.data, {'id':parseInt(id)})[0]
  , (e)->
    $scope.error = e
]