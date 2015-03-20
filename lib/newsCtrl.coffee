'use strict'

_ = require('lodash')

module.exports = ['$scope', '$sce', "$filter", "NewsFcty", 'PaginationService', "resizer", ($scope, $sce, $filter, NewsFcty, PaginationService, resizer)->
  # $scope.title = BlogName
  $scope.newsArticles  = []
  $scope.locations     = []
  $scope.error         = null
  $scope.selectedMonth = null
  $scope.itemCount     = 0

  size_obj      = resizer.windowSize()
  $scope.device = resizer.getDevice(size_obj.width)

  resizer.trackSize((device, size_obj)->

     $scope.device = device
     $scope.$apply()
  )

  # Loads news
  getNews = (type=null)->
    NewsFcty.getData().then (results)->
      PaginationService.setPage(0)
      unless _.isEmpty(results.data)
        $scope.itemCount    = results.data.length
        $scope.months       = results.months
        $scope.newsArticles = results.data
    , (error)->
      $scope.error = error

  #Filtered list
  $scope.filteredNews = ()->
    filtered = $filter('monthFilter')($scope.newsArticles, $scope.selectedMonth)
    $scope.itemCount    = filtered.length
    filtered = $filter('itemsForCurrentPage')(filtered)
    $scope.pageCount = filtered.length
    return filtered

  $scope.has_img = (img)->
   return unless _.isEmpty(img) then 'with-image' else 'no-image'

  $scope.hideAtMobile = ()->
    return $scope.device!='mobile'

  getNews()
]