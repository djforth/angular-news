'use strict';
var _, news, newsCtrl, newsDir, newsFcty, newsFilter, newsPanelCtrl, pagination, viewDetection;

require('angular');

require('angular-resource');

_ = require('lodash');

viewDetection = require('viewport-detection');

pagination = require('angular-pagination');

newsCtrl = require("./newsCtrl.coffee");

newsPanelCtrl = require("./newsPanelCtrl.coffee");

newsFcty = require("./newsFcty.coffee");

newsFilter = require('./newsFilters.coffee');

newsDir = require("./newsDir.coffee");

news = angular.module('$news', ['ngResource', "$pagination", '$viewportDetection']).factory('NewsFcty', newsFcty).filter("monthFilter", newsFilter).controller('NewsCtrl', newsCtrl).directive('news', newsDir).run([
  "$templateCache", function(e) {
    return e.put("directives/pagination.html", '<ul class="pagination" ng-show="showPagination"><li class="prev" ng-class="prevPageDisabled()"><a ng-click="prevPage()" rel="previous" title="Previous" href="javascript:"><span>&lsaquo; Prev</span></a></li><li class="page" ng-class="setActive(n)" ng-repeat="n in range()"><a rel="start" ng-click="setPage(n)" href="javascript:">{{n+1}}</a></li><li class="next" ng-class="nextPageDisabled()"><a ng-click="nextPage()" rel="next" title="next" href="javascript:"><span>&rsaquo; Next</span></a></li></ul>');
  }
]);

module.exports = news;
