'use strict';
var _;

_ = require('lodash');

module.exports = [
  '$scope', '$sce', "$filter", "NewsFcty", 'PaginationService', "resizer", function($scope, $sce, $filter, NewsFcty, PaginationService, resizer) {
    var getNews, size_obj;
    $scope.newsArticles = [];
    $scope.locations = [];
    $scope.error = null;
    $scope.selectedMonth = null;
    $scope.itemCount = 0;
    size_obj = resizer.windowSize();
    $scope.device = resizer.getDevice(size_obj.width);
    resizer.trackSize(function(device, size_obj) {
      $scope.device = device;
      return $scope.$apply();
    });
    getNews = function(type) {
      if (type == null) {
        type = null;
      }
      return NewsFcty.getData().then(function(results) {
        PaginationService.setPage(0);
        if (!_.isEmpty(results.data)) {
          $scope.itemCount = results.data.length;
          $scope.months = results.months;
          return $scope.newsArticles = results.data;
        }
      }, function(error) {
        return $scope.error = error;
      });
    };
    $scope.filteredNews = function() {
      var filtered;
      filtered = $filter('monthFilter')($scope.newsArticles, $scope.selectedMonth);
      $scope.itemCount = filtered.length;
      filtered = $filter('itemsForCurrentPage')(filtered);
      $scope.pageCount = filtered.length;
      return filtered;
    };
    $scope.has_img = function(img) {
      if (!_.isEmpty(img)) {
        return 'with-image';
      } else {
        return 'no-image';
      }
    };
    $scope.hideAtMobile = function() {
      return $scope.device !== 'mobile';
    };
    return getNews();
  }
];
