'use strict'

require('angular')
require('angular-resource')
# require("angular-ui-route")
_  = require('lodash')
# require('../utils/venue_path.coffee')
viewDetection = require('viewport-detection')

pagination = require 'angular-pagination'

newsCtrl      = require("./newsCtrl.coffee")
newsPanelCtrl = require("./newsPanelCtrl.coffee")
newsFcty      = require("./newsFcty.coffee")
newsFilter    = require('./newsFilters.coffee')
newsDir       = require("./newsDir.coffee")

news =  angular.module('$news', ['ngResource', "$pagination", '$viewportDetection'])
  .provider('setNewsUrl', ()->
    url = null;
    return {
      setUrl:(path)->
        url = path

      $get:()->
        return {
          url:url
        }
    }
  )
  .factory('NewsFcty', newsFcty)
  .filter("monthFilter", newsFilter)
  .controller('NewsCtrl', newsCtrl)
  .directive('news', newsDir)

  .run(["$templateCache",(e)->
    e.put("directives/pagination.html",'<ul class="pagination" ng-show="showPagination"><li class="prev" ng-class="prevPageDisabled()"><a ng-click="prevPage()" rel="previous" title="Previous" href="javascript:"><span>&lsaquo; Prev</span></a></li><li class="page" ng-class="setActive(n)" ng-repeat="n in range()"><a rel="start" ng-click="setPage(n)" href="javascript:">{{n+1}}</a></li><li class="next" ng-class="nextPageDisabled()"><a ng-click="nextPage()" rel="next" title="next" href="javascript:"><span>&rsaquo; Next</span></a></li></ul>')
  ])

# _.forEach newsFilters, (dir, title)->
#   news.filter(title, dir)


module.exports = news