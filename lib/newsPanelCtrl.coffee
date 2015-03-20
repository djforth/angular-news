'use strict'

_ = require('lodash')

module.exports = ['$scope', '$sce', "NewsFcty", ($scope, $sce,NewsFcty)->
  $scope.panelNews = []

  NewsFcty.flush()
  NewsFcty.getNews().then (results)->
    $scope.panelNews = _.first(results.data, 2);

]