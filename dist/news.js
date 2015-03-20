(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./lib/news.coffee":[function(require,module,exports){
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

news = angular.module('$news', ['ngResource', "$pagination", '$viewportDetection']).provider('setNewsUrl', function() {
  var url;
  url = null;
  return {
    setUrl: function(path) {
      return url = path;
    },
    $get: function() {
      return {
        url: url
      };
    }
  };
}).factory('NewsFcty', newsFcty).filter("monthFilter", newsFilter).controller('NewsCtrl', newsCtrl).directive('news', newsDir).run([
  "$templateCache", function(e) {
    return e.put("directives/pagination.html", '<ul class="pagination" ng-show="showPagination"><li class="prev" ng-class="prevPageDisabled()"><a ng-click="prevPage()" rel="previous" title="Previous" href="javascript:"><span>&lsaquo; Prev</span></a></li><li class="page" ng-class="setActive(n)" ng-repeat="n in range()"><a rel="start" ng-click="setPage(n)" href="javascript:">{{n+1}}</a></li><li class="next" ng-class="nextPageDisabled()"><a ng-click="nextPage()" rel="next" title="next" href="javascript:"><span>&rsaquo; Next</span></a></li></ul>');
  }
]);

module.exports = news;



},{"./newsCtrl.coffee":"/Users/djforth/websites/modules/news/lib/newsCtrl.coffee","./newsDir.coffee":"/Users/djforth/websites/modules/news/lib/newsDir.coffee","./newsFcty.coffee":"/Users/djforth/websites/modules/news/lib/newsFcty.coffee","./newsFilters.coffee":"/Users/djforth/websites/modules/news/lib/newsFilters.coffee","./newsPanelCtrl.coffee":"/Users/djforth/websites/modules/news/lib/newsPanelCtrl.coffee","angular":"angular","angular-pagination":"angular-pagination","angular-resource":"angular-resource","lodash":"lodash","viewport-detection":"viewport-detection"}],"/Users/djforth/websites/modules/news/lib/newsCtrl.coffee":[function(require,module,exports){
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



},{"lodash":"lodash"}],"/Users/djforth/websites/modules/news/lib/newsDir.coffee":[function(require,module,exports){
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



},{"lodash":"lodash"}],"/Users/djforth/websites/modules/news/lib/newsFcty.coffee":[function(require,module,exports){
'use strict';
var DateFormatter, _;

_ = require('lodash');

DateFormatter = require("date-formatter");

module.exports = function($http, $q, setNewsUrl) {
  var newsData, urlPath;
  newsData = [];
  urlPath = "/";
  return {
    addDate: function(data) {
      if (_.isEmpty(data)) {
        return data;
      }
      _.forEach(data, function(d) {
        var dateFmt;
        dateFmt = new DateFormatter(d.published);
        d.pubDate = dateFmt.getDate();
        return d.fmtPub = dateFmt.formatDate("%d %B %Y");
      });
      return data;
    },
    data: function() {
      return newsData;
    },
    flush: function() {
      return newsData = [];
    },
    getMonths: function(data) {
      var months;
      months = [];
      _.forEach(data, function(d) {
        var dateFmt, mDate, month, ms;
        month = d.published.replace(/(\d{2})*$/, "01");
        ms = _.pluck(months, 'str');
        if (!_.contains(ms, month)) {
          dateFmt = new DateFormatter(month);
          mDate = dateFmt.getDate();
          return months.push({
            date: mDate,
            str: month,
            txt: dateFmt.formatDate("%B, %Y")
          });
        }
      });
      return months;
    },
    getData: function(type) {
      var deferred, that;
      if (type == null) {
        type = null;
      }
      deferred = $q.defer();
      if (_.isEmpty(newsData)) {
        that = this;
        $http.get(setNewsUrl.url).success(function(data) {
          newsData = that.addDate(data);
          return deferred.resolve({
            data: newsData,
            months: that.getMonths(newsData)
          });
        }).error(function() {
          return deferred.reject("An error occurred while fetching items, we have been notified and are investigating.  Please try again later");
        });
      } else {
        deferred.resolve({
          data: newsData,
          months: this.getMonths(newsData)
        });
      }
      return deferred.promise;
    },
    getUrl: function() {
      return urlPath;
    },
    setUrl: function(url) {
      return urlPath = url;
    },
    setData: function(d) {
      return newsData = d;
    }
  };
};



},{"date-formatter":"/Users/djforth/websites/modules/news/node_modules/date-formatter/index.js","lodash":"lodash"}],"/Users/djforth/websites/modules/news/lib/newsFilters.coffee":[function(require,module,exports){
'use strict';
var _;

_ = require('lodash');

module.exports = function() {
  return function(data, ftr) {
    var month, year;
    if (_.isNull(ftr) || _.isUndefined(ftr)) {
      return data;
    }
    month = ftr.date.getMonth();
    year = ftr.date.getFullYear();
    return _.filter(data, function(d) {
      return d.pubDate.getMonth() === month && d.pubDate.getFullYear() === year;
    });
  };
};



},{"lodash":"lodash"}],"/Users/djforth/websites/modules/news/lib/newsPanelCtrl.coffee":[function(require,module,exports){
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



},{"lodash":"lodash"}],"/Users/djforth/websites/modules/news/node_modules/date-formatter/index.js":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var DateFormatter = (function () {
  function DateFormatter() {
    _classCallCheck(this, DateFormatter);

    var args = Array.prototype.slice.call(arguments);
    // yyyy-mm-dd hh:mm:ss
    // yyyy-mm-dd hh:mm
    // yyyy-mm-dd
    this.date_test = /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2}(\.\d{3})?)?$/;

    this.date = null;
    this.AMPM = "am";
    this.SHORT_DAYS = ["Sun", "Mon", "Tues", "Weds", "Thurs", "Fri", "Sat"];
    this.DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    this.SHORT_MONTHS = ["Jan", "Feb", "March", "April", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    this.MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    this.setDate.apply(this, args);
  }

  _createClass(DateFormatter, {
    compact: {
      value: function compact(array) {
        // Ripped from lodash
        var index = -1,
            length = array ? array.length : 0,
            resIndex = -1,
            result = [];

        while (++index < length) {
          var value = array[index];
          if (value) {
            result[++resIndex] = value;
          }
        }
        return result;
      }
    },
    dateFix: {
      value: function dateFix(date_str) {
        // yyyy-mm-dd hh:mm
        // yyyy-mm-dd hh:mm
        // yyyy-mm-dd
        var date_regex = /^\s*(\d{4})-(\d{2})-(\d{2})+!?(\s(\d{2}):(\d{2})|\s(\d{2}):(\d{2}):(\d+))?$/;
        var matches = date_str.match(date_regex);

        if (matches) {
          matches = this.compact(matches);
          // console.log('matches', matches);

          var year = parseInt(matches[1]);
          var month = parseInt(matches[2], 10) - 1;
          var date = parseInt(matches[3], 10);

          date = new Date(year, month, date);

          if (matches[5]) {
            date.setHours(matches[5]);
          }

          if (matches[6]) {
            date.setMinutes(matches[6]);
          }

          if (matches[7]) {
            date.setSeconds(matches[7]);
          }

          return date;
        } else {
          throw new Error("Date is malformed");
        };
      }
    },
    fixTime: {
      value: function fixTime(t) {
        if (String(t).length < 2) {
          return "0" + t;
        } else {
          return String(t);
        }
      }
    },
    formatDate: {
      value: function formatDate(str) {
        var date = undefined,
            fmt = undefined;
        date = this.date;

        if (this.isString(str)) {
          fmt = str;
        }

        // http://jsperf.com/date-formatting2
        // Year
        fmt = fmt.replace("%y", date.getYear() - 100);
        // Full Year
        fmt = fmt.replace("%Y", date.getFullYear());
        // Set Numbered Month
        fmt = fmt.replace("%m", date.getMonth() + 1);
        // Set Short Month
        fmt = fmt.replace("%b", this.SHORT_MONTHS[date.getMonth()]);
        // Set Month
        fmt = fmt.replace("%B", this.MONTHS[date.getMonth()]);
        // Set Date
        fmt = fmt.replace("%d", date.getDate());
        // Set Short Day
        fmt = fmt.replace("%a", this.SHORT_DAYS[date.getDay()]);
        // Set Day
        fmt = fmt.replace("%A", this.DAYS[date.getDay()]);
        // Set Hours - 24
        fmt = fmt.replace("%H", this.fixTime(date.getHours()));
        // Set Hours - 12
        fmt = fmt.replace("%-l", this.set12Hour(date.getHours()));
        // Set Mins
        fmt = fmt.replace("%M", this.fixTime(date.getMinutes()));
        // Set Secs
        fmt = fmt.replace("%S", this.fixTime(date.getSeconds()));
        // Set AMPM
        fmt = fmt.replace("%p", this.AMPM);

        return fmt;
      }
    },
    getDate: {
      value: function getDate() {
        return this.date;
      }
    },
    isDate: {
      value: function isDate(d) {
        return Object.prototype.toString.call(d) === "[object Date]";
      }
    },
    isString: {
      value: function isString(str) {
        return Object.prototype.toString.call(str) === "[object String]";
      }
    },
    set12Hour: {
      value: function set12Hour(hour) {
        this.AMPM = hour < 12 ? "am" : "pm";
        if (hour <= 12) {
          return hour;
        } else {
          return hour - 12;
        }
      }
    },
    setDate: {
      value: function setDate() {
        var args = Array.prototype.slice.call(arguments);
        if (this.isString(args[0]) && this.date_test.test(args[0])) {
          this.date = this.dateFix(args[0]);
        } else {
          if (this.isString(args[0])) {
            this.date = new Date(args[0]);
          } else {
            this.date = new Date(Date.UTC.apply(null, args));
          }
        }
      }
    }
  });

  return DateFormatter;
})();

module.exports = DateFormatter;
},{}]},{},["./lib/news.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZGpmb3J0aC93ZWJzaXRlcy9tb2R1bGVzL25ld3MvbGliL25ld3MuY29mZmVlIiwiL1VzZXJzL2RqZm9ydGgvd2Vic2l0ZXMvbW9kdWxlcy9uZXdzL2xpYi9uZXdzQ3RybC5jb2ZmZWUiLCIvVXNlcnMvZGpmb3J0aC93ZWJzaXRlcy9tb2R1bGVzL25ld3MvbGliL25ld3NEaXIuY29mZmVlIiwiL1VzZXJzL2RqZm9ydGgvd2Vic2l0ZXMvbW9kdWxlcy9uZXdzL2xpYi9uZXdzRmN0eS5jb2ZmZWUiLCIvVXNlcnMvZGpmb3J0aC93ZWJzaXRlcy9tb2R1bGVzL25ld3MvbGliL25ld3NGaWx0ZXJzLmNvZmZlZSIsIi9Vc2Vycy9kamZvcnRoL3dlYnNpdGVzL21vZHVsZXMvbmV3cy9saWIvbmV3c1BhbmVsQ3RybC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZGF0ZS1mb3JtYXR0ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFBLENBQUE7QUFBQSxJQUFBLDBGQUFBOztBQUFBLE9BRUEsQ0FBUSxTQUFSLENBRkEsQ0FBQTs7QUFBQSxPQUdBLENBQVEsa0JBQVIsQ0FIQSxDQUFBOztBQUFBLENBS0EsR0FBSyxPQUFBLENBQVEsUUFBUixDQUxMLENBQUE7O0FBQUEsYUFPQSxHQUFnQixPQUFBLENBQVEsb0JBQVIsQ0FQaEIsQ0FBQTs7QUFBQSxVQVNBLEdBQWEsT0FBQSxDQUFRLG9CQUFSLENBVGIsQ0FBQTs7QUFBQSxRQVdBLEdBQWdCLE9BQUEsQ0FBUSxtQkFBUixDQVhoQixDQUFBOztBQUFBLGFBWUEsR0FBZ0IsT0FBQSxDQUFRLHdCQUFSLENBWmhCLENBQUE7O0FBQUEsUUFhQSxHQUFnQixPQUFBLENBQVEsbUJBQVIsQ0FiaEIsQ0FBQTs7QUFBQSxVQWNBLEdBQWdCLE9BQUEsQ0FBUSxzQkFBUixD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbnJlcXVpcmUoJ2FuZ3VsYXInKVxucmVxdWlyZSgnYW5ndWxhci1yZXNvdXJjZScpXG4jIHJlcXVpcmUoXCJhbmd1bGFyLXVpLXJvdXRlXCIpXG5fICA9IHJlcXVpcmUoJ2xvZGFzaCcpXG4jIHJlcXVpcmUoJy4uL3V0aWxzL3ZlbnVlX3BhdGguY29mZmVlJylcbnZpZXdEZXRlY3Rpb24gPSByZXF1aXJlKCd2aWV3cG9ydC1kZXRlY3Rpb24nKVxuXG5wYWdpbmF0aW9uID0gcmVxdWlyZSAnYW5ndWxhci1wYWdpbmF0aW9uJ1xuXG5uZXdzQ3RybCAgICAgID0gcmVxdWlyZShcIi4vbmV3c0N0cmwuY29mZmVlXCIpXG5uZXdzUGFuZWxDdHJsID0gcmVxdWlyZShcIi4vbmV3c1BhbmVsQ3RybC5jb2ZmZWVcIilcbm5ld3NGY3R5ICAgICAgPSByZXF1aXJlKFwiLi9uZXdzRmN0eS5jb2ZmZWVcIilcbm5ld3NGaWx0ZXIgICAgPSByZXF1aXJlKCcuL25ld3NGaWx0ZXJzLmNvZmZlZScpXG5uZXdzRGlyICAgICAgID0gcmVxdWlyZShcIi4vbmV3c0Rpci5jb2ZmZWVcIilcblxubmV3cyA9ICBhbmd1bGFyLm1vZHVsZSgnJG5ld3MnLCBbJ25nUmVzb3VyY2UnLCBcIiRwYWdpbmF0aW9uXCIsICckdmlld3BvcnREZXRlY3Rpb24nXSlcbiAgLnByb3ZpZGVyKCdzZXROZXdzVXJsJywgKCktPlxuICAgIHVybCA9IG51bGw7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNldFVybDoocGF0aCktPlxuICAgICAgICB1cmwgPSBwYXRoXG5cbiAgICAgICRnZXQ6KCktPlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHVybDp1cmxcbiAgICAgICAgfVxuICAgIH1cbiAgKVxuICAuZmFjdG9yeSgnTmV3c0ZjdHknLCBuZXdzRmN0eSlcbiAgLmZpbHRlcihcIm1vbnRoRmlsdGVyXCIsIG5ld3NGaWx0ZXIpXG4gIC5jb250cm9sbGVyKCdOZXdzQ3RybCcsIG5ld3NDdHJsKVxuICAuZGlyZWN0aXZlKCduZXdzJywgbmV3c0RpcilcblxuICAucnVuKFtcIiR0ZW1wbGF0ZUNhY2hlXCIsKGUpLT5cbiAgICBlLnB1dChcImRpcmVjdGl2ZXMvcGFnaW5hdGlvbi5odG1sXCIsJzx1bCBjbGFzcz1cInBhZ2luYXRpb25cIiBuZy1zaG93PVwic2hvd1BhZ2luYXRpb25cIj48bGkgY2xhc3M9XCJwcmV2XCIgbmctY2xhc3M9XCJwcmV2UGFnZURpc2FibGVkKClcIj48YSBuZy1jbGljaz1cInByZXZQYWdlKClcIiByZWw9XCJwcmV2aW91c1wiIHRpdGxlPVwiUHJldmlvdXNcIiBocmVmPVwiamF2YXNjcmlwdDpcIj48c3Bhbj4mbHNhcXVvOyBQcmV2PC9zcGFuPjwvYT48L2xpPjxsaSBjbGFzcz1cInBhZ2VcIiBuZy1jbGFzcz1cInNldEFjdGl2ZShuKVwiIG5nLXJlcGVhdD1cIm4gaW4gcmFuZ2UoKVwiPjxhIHJlbD1cInN0YXJ0XCIgbmctY2xpY2s9XCJzZXRQYWdlKG4pXCIgaHJlZj1cImphdmFzY3JpcHQ6XCI+e3tuKzF9fTwvYT48L2xpPjxsaSBjbGFzcz1cIm5leHRcIiBuZy1jbGFzcz1cIm5leHRQYWdlRGlzYWJsZWQoKVwiPjxhIG5nLWNsaWNrPVwibmV4dFBhZ2UoKVwiIHJlbD1cIm5leHRcIiB0aXRsZT1cIm5leHRcIiBocmVmPVwiamF2YXNjcmlwdDpcIj48c3Bhbj4mcnNhcXVvOyBOZXh0PC9zcGFuPjwvYT48L2xpPjwvdWw+JylcbiAgXSlcblxuIyBfLmZvckVhY2ggbmV3c0ZpbHRlcnMsIChkaXIsIHRpdGxlKS0+XG4jICAgbmV3cy5maWx0ZXIodGl0bGUsIGRpcilcblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ld3MiLCIndXNlIHN0cmljdCdcblxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gWyckc2NvcGUnLCAnJHNjZScsIFwiJGZpbHRlclwiLCBcIk5ld3NGY3R5XCIsICdQYWdpbmF0aW9uU2VydmljZScsIFwicmVzaXplclwiLCAoJHNjb3BlLCAkc2NlLCAkZmlsdGVyLCBOZXdzRmN0eSwgUGFnaW5hdGlvblNlcnZpY2UsIHJlc2l6ZXIpLT5cbiAgIyAkc2NvcGUudGl0bGUgPSBCbG9nTmFtZVxuICAkc2NvcGUubmV3c0FydGljbGVzICA9IFtdXG4gICRzY29wZS5sb2NhdGlvbnMgICAgID0gW11cbiAgJHNjb3BlLmVycm9yICAgICAgICAgPSBudWxsXG4gICRzY29wZS5zZWxlY3RlZE1vbnRoID0gbnVsbFxuICAkc2NvcGUuaXRlbUNvdW50ICAgICA9IDBcblxuICBzaXplX29iaiAgICAgID0gcmVzaXplci53aW5kb3dTaXplKClcbiAgJHNjb3BlLmRldmljZSA9IHJlc2l6ZXIuZ2V0RGV2aWNlKHNpemVfb2JqLndpZHRoKVxuXG4gIHJlc2l6ZXIudHJhY2tTaXplKChkZXZpY2UsIHNpemVfb2JqKS0+XG5cbiAgICAgJHNjb3BlLmRldmljZSA9IGRldmljZVxuICAgICAkc2NvcGUuJGFwcGx5KClcbiAgKVxuXG4gICMgTG9hZHMgbmV3c1xuICBnZXROZXdzID0gKHR5cGU9bnVsbCktPlxuICAgIE5ld3NGY3R5LmdldERhdGEoKS50aGVuIChyZXN1bHRzKS0+XG4gICAgICBQYWdpbmF0aW9uU2VydmljZS5zZXRQYWdlKDApXG4gICAgICB1bmxlc3MgXy5pc0VtcHR5KHJlc3VsdHMuZGF0YSlcbiAgICAgICAgJHNjb3BlLml0ZW1Db3VudCAgICA9IHJlc3VsdHMuZGF0YS5sZW5ndGhcbiAgICAgICAgJHNjb3BlLm1vbnRocyAgICAgICA9IHJlc3VsdHMubW9udGhzXG4gICAgICAgICRzY29wZS5uZXdzQXJ0aWNsZXMgPSByZXN1bHRzLmRhdGFcbiAgICAsIChlcnJvciktPlxuICAgICAgJHNjb3BlLmVycm9yID0gZXJyb3JcblxuICAjRmlsdGVyZWQgbGlzdFxuICAkc2NvcGUuZmlsdGVyZWROZXdzID0gKCktPlxuICAgIGZpbHRlcmVkID0gJGZpbHRlcignbW9udGhGaWx0ZXInKSgkc2NvcGUubmV3c0FydGljbGVzLCAkc2NvcGUuc2VsZWN0ZWRNb250aClcbiAgICAkc2NvcGUuaXRlbUNvdW50ICAgID0gZmlsdGVyZWQubGVuZ3RoXG4gICAgZmlsdGVyZWQgPSAkZmlsdGVyKCdpdGVtc0ZvckN1cnJlbnRQYWdlJykoZmlsdGVyZWQpXG4gICAgJHNjb3BlLnBhZ2VDb3VudCA9IGZpbHRlcmVkLmxlbmd0aFxuICAgIHJldHVybiBmaWx0ZXJlZFxuXG4gICRzY29wZS5oYXNfaW1nID0gKGltZyktPlxuICAgcmV0dXJuIHVubGVzcyBfLmlzRW1wdHkoaW1nKSB0aGVuICd3aXRoLWltYWdlJyBlbHNlICduby1pbWFnZSdcblxuICAkc2NvcGUuaGlkZUF0TW9iaWxlID0gKCktPlxuICAgIHJldHVybiAkc2NvcGUuZGV2aWNlIT0nbW9iaWxlJ1xuXG4gIGdldE5ld3MoKVxuXSIsIl8gID0gcmVxdWlyZSgnbG9kYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSAoKS0+XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBJyxcbiAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgIGNvbnRyb2xsZXI6J05ld3NDdHJsJyxcbiAgICBzY29wZTp7IH0sXG4gICAgdGVtcGxhdGVVcmw6ICduZXdzL25ld3MuaHRtbCcsXG4gIH0iLCJcbid1c2Ugc3RyaWN0J1xuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5cbkRhdGVGb3JtYXR0ZXIgPSByZXF1aXJlKFwiZGF0ZS1mb3JtYXR0ZXJcIilcblxubW9kdWxlLmV4cG9ydHMgPSAoJGh0dHAsICRxLCBzZXROZXdzVXJsKS0+XG4gIG5ld3NEYXRhID0gW11cbiAgdXJsUGF0aCA9IFwiL1wiXG5cbiAgcmV0dXJuIHtcbiAgICBhZGREYXRlOihkYXRhKS0+XG4gICAgICByZXR1cm4gZGF0YSBpZiBfLmlzRW1wdHkoZGF0YSlcblxuICAgICAgXy5mb3JFYWNoIGRhdGEsIChkKS0+XG4gICAgICAgIGRhdGVGbXQgICA9IG5ldyBEYXRlRm9ybWF0dGVyKGQucHVibGlzaGVkKVxuICAgICAgICBkLnB1YkRhdGUgPSBkYXRlRm10LmdldERhdGUoKVxuICAgICAgICBkLmZtdFB1YiAgPSBkYXRlRm10LmZvcm1hdERhdGUoXCIlZCAlQiAlWVwiKVxuXG4gICAgICBkYXRhXG5cbiAgICBkYXRhOigpLT5cbiAgICAgIG5ld3NEYXRhXG5cbiAgICBmbHVzaDooKS0+XG4gICAgICBuZXdzRGF0YSA9IFtdXG5cbiAgICBnZXRNb250aHM6KGRhdGEpLT5cbiAgICAgIG1vbnRocyA9IFtdXG5cbiAgICAgIF8uZm9yRWFjaCBkYXRhLCAoZCktPlxuXG4gICAgICAgIG1vbnRoID0gZC5wdWJsaXNoZWQucmVwbGFjZSgvKFxcZHsyfSkqJC8sIFwiMDFcIilcblxuICAgICAgICBtcyA9IF8ucGx1Y2sobW9udGhzLCAnc3RyJylcblxuICAgICAgICBpZiAhXy5jb250YWlucyhtcywgbW9udGgpXG4gICAgICAgICAgZGF0ZUZtdCA9IG5ldyBEYXRlRm9ybWF0dGVyKG1vbnRoKVxuICAgICAgICAgIG1EYXRlICAgPSBkYXRlRm10LmdldERhdGUoKVxuICAgICAgICAgIG1vbnRocy5wdXNoIHtkYXRlOm1EYXRlLCBzdHI6bW9udGgsIHR4dDpkYXRlRm10LmZvcm1hdERhdGUoXCIlQiwgJVlcIil9XG5cbiAgICAgIG1vbnRoc1xuXG4gICAgZ2V0RGF0YToodHlwZT1udWxsKS0+XG4gICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgIGlmIF8uaXNFbXB0eShuZXdzRGF0YSlcblxuICAgICAgICB0aGF0ID0gQFxuICAgICAgICAkaHR0cC5nZXQoc2V0TmV3c1VybC51cmwpXG4gICAgICAgICAgLnN1Y2Nlc3MoIChkYXRhKS0+XG4gICAgICAgICAgICBuZXdzRGF0YSA9IHRoYXQuYWRkRGF0ZShkYXRhKVxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSh7ZGF0YTpuZXdzRGF0YSwgbW9udGhzOnRoYXQuZ2V0TW9udGhzKG5ld3NEYXRhKX0pO1xuICAgICAgICAgIClcbiAgICAgICAgICAuZXJyb3IgKCktPlxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KFwiQW4gZXJyb3Igb2NjdXJyZWQgd2hpbGUgZmV0Y2hpbmcgaXRlbXMsIHdlIGhhdmUgYmVlbiBub3RpZmllZCBhbmQgYXJlIGludmVzdGlnYXRpbmcuICBQbGVhc2UgdHJ5IGFnYWluIGxhdGVyXCIpXG4gICAgICBlbHNlXG4gICAgICAgIGRlZmVycmVkLnJlc29sdmUoe2RhdGE6bmV3c0RhdGEsIG1vbnRoczpAZ2V0TW9udGhzKG5ld3NEYXRhKX0pO1xuXG5cbiAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgIGdldFVybDooKS0+XG4gICAgICB1cmxQYXRoXG5cbiAgICBzZXRVcmw6KHVybCktPlxuICAgICAgdXJsUGF0aCA9IHVybFxuXG4gICAgc2V0RGF0YTooZCktPlxuICAgICAgbmV3c0RhdGEgPSBkXG4gIH0iLCJcbid1c2Ugc3RyaWN0J1xuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5cbm1vZHVsZS5leHBvcnRzID0gKCktPlxuICAoZGF0YSwgZnRyKS0+XG4gICAgcmV0dXJuIGRhdGEgaWYgXy5pc051bGwoZnRyKSBvciBfLmlzVW5kZWZpbmVkKGZ0cilcblxuICAgIG1vbnRoID0gZnRyLmRhdGUuZ2V0TW9udGgoKVxuICAgIHllYXIgID0gZnRyLmRhdGUuZ2V0RnVsbFllYXIoKVxuXG4gICAgXy5maWx0ZXIgZGF0YSwgKGQpLT5cbiAgICAgIGQucHViRGF0ZS5nZXRNb250aCgpID09IG1vbnRoIGFuZCBkLnB1YkRhdGUuZ2V0RnVsbFllYXIoKSA9PSB5ZWFyXG5cbiMgZXhwb3J0cy5wYWdpbmF0aW9uRmlsdGVyID0gKCktPlxuIyAgIChkYXRhLCBjdXJyZW50LCBvZmZzZXQpLT5cbiMgICAgIHN0YXJ0ID0gY3VycmVudCAqIG9mZnNldFxuIyAgICAgZW5kICAgPSBzdGFydCArIG9mZnNldFxuIyAgICAgZGF0YS5zbGljZShzdGFydCwgZW5kKVxuXG5cbiIsIid1c2Ugc3RyaWN0J1xuXG5fID0gcmVxdWlyZSgnbG9kYXNoJylcblxubW9kdWxlLmV4cG9ydHMgPSBbJyRzY29wZScsICckc2NlJywgXCJOZXdzRmN0eVwiLCAoJHNjb3BlLCAkc2NlLE5ld3NGY3R5KS0+XG4gICRzY29wZS5wYW5lbE5ld3MgPSBbXVxuXG4gIE5ld3NGY3R5LmZsdXNoKClcbiAgTmV3c0ZjdHkuZ2V0TmV3cygpLnRoZW4gKHJlc3VsdHMpLT5cbiAgICAkc2NvcGUucGFuZWxOZXdzID0gXy5maXJzdChyZXN1bHRzLmRhdGEsIDIpO1xuXG5dIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIga2V5IGluIHByb3BzKSB7IHZhciBwcm9wID0gcHJvcHNba2V5XTsgcHJvcC5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAocHJvcC52YWx1ZSkgcHJvcC53cml0YWJsZSA9IHRydWU7IH0gT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcyk7IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxudmFyIF9jbGFzc0NhbGxDaGVjayA9IGZ1bmN0aW9uIChpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTsgfSB9O1xuXG52YXIgRGF0ZUZvcm1hdHRlciA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIERhdGVGb3JtYXR0ZXIoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIERhdGVGb3JtYXR0ZXIpO1xuXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgIC8vIHl5eXktbW0tZGQgaGg6bW06c3NcbiAgICAvLyB5eXl5LW1tLWRkIGhoOm1tXG4gICAgLy8geXl5eS1tbS1kZFxuICAgIHRoaXMuZGF0ZV90ZXN0ID0gL15cXGR7NH0tXFxkezJ9LVxcZHsyfSggXFxkezJ9OlxcZHsyfTpcXGR7Mn0oXFwuXFxkezN9KT8pPyQvO1xuXG4gICAgdGhpcy5kYXRlID0gbnVsbDtcbiAgICB0aGlzLkFNUE0gPSBcImFtXCI7XG4gICAgdGhpcy5TSE9SVF9EQVlTID0gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlc1wiLCBcIldlZHNcIiwgXCJUaHVyc1wiLCBcIkZyaVwiLCBcIlNhdFwiXTtcbiAgICB0aGlzLkRBWVMgPSBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXTtcbiAgICB0aGlzLlNIT1JUX01PTlRIUyA9IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z1wiLCBcIlNlcHRcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIl07XG4gICAgdGhpcy5NT05USFMgPSBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcblxuICAgIHRoaXMuc2V0RGF0ZS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhEYXRlRm9ybWF0dGVyLCB7XG4gICAgY29tcGFjdDoge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGNvbXBhY3QoYXJyYXkpIHtcbiAgICAgICAgLy8gUmlwcGVkIGZyb20gbG9kYXNoXG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyYXkgPyBhcnJheS5sZW5ndGggOiAwLFxuICAgICAgICAgICAgcmVzSW5kZXggPSAtMSxcbiAgICAgICAgICAgIHJlc3VsdCA9IFtdO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaW5kZXhdO1xuICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgcmVzdWx0WysrcmVzSW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfSxcbiAgICBkYXRlRml4OiB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24gZGF0ZUZpeChkYXRlX3N0cikge1xuICAgICAgICAvLyB5eXl5LW1tLWRkIGhoOm1tXG4gICAgICAgIC8vIHl5eXktbW0tZGQgaGg6bW1cbiAgICAgICAgLy8geXl5eS1tbS1kZFxuICAgICAgICB2YXIgZGF0ZV9yZWdleCA9IC9eXFxzKihcXGR7NH0pLShcXGR7Mn0pLShcXGR7Mn0pKyE/KFxccyhcXGR7Mn0pOihcXGR7Mn0pfFxccyhcXGR7Mn0pOihcXGR7Mn0pOihcXGQrKSk/JC87XG4gICAgICAgIHZhciBtYXRjaGVzID0gZGF0ZV9zdHIubWF0Y2goZGF0ZV9yZWdleCk7XG5cbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaGVzID0gdGhpcy5jb21wYWN0KG1hdGNoZXMpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdtYXRjaGVzJywgbWF0Y2hlcyk7XG5cbiAgICAgICAgICB2YXIgeWVhciA9IHBhcnNlSW50KG1hdGNoZXNbMV0pO1xuICAgICAgICAgIHZhciBtb250aCA9IHBhcnNlSW50KG1hdGNoZXNbMl0sIDEwKSAtIDE7XG4gICAgICAgICAgdmFyIGRhdGUgPSBwYXJzZUludChtYXRjaGVzWzNdLCAxMCk7XG5cbiAgICAgICAgICBkYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIGRhdGUpO1xuXG4gICAgICAgICAgaWYgKG1hdGNoZXNbNV0pIHtcbiAgICAgICAgICAgIGRhdGUuc2V0SG91cnMobWF0Y2hlc1s1XSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKG1hdGNoZXNbNl0pIHtcbiAgICAgICAgICAgIGRhdGUuc2V0TWludXRlcyhtYXRjaGVzWzZdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobWF0Y2hlc1s3XSkge1xuICAgICAgICAgICAgZGF0ZS5zZXRTZWNvbmRzKG1hdGNoZXNbN10pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRhdGUgaXMgbWFsZm9ybWVkXCIpO1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0sXG4gICAgZml4VGltZToge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGZpeFRpbWUodCkge1xuICAgICAgICBpZiAoU3RyaW5nKHQpLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgICByZXR1cm4gXCIwXCIgKyB0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBTdHJpbmcodCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgIGZvcm1hdERhdGU6IHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBmb3JtYXREYXRlKHN0cikge1xuICAgICAgICB2YXIgZGF0ZSA9IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIGZtdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgZGF0ZSA9IHRoaXMuZGF0ZTtcblxuICAgICAgICBpZiAodGhpcy5pc1N0cmluZyhzdHIpKSB7XG4gICAgICAgICAgZm10ID0gc3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaHR0cDovL2pzcGVyZi5jb20vZGF0ZS1mb3JtYXR0aW5nMlxuICAgICAgICAvLyBZZWFyXG4gICAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFwiJXlcIiwgZGF0ZS5nZXRZZWFyKCkgLSAxMDApO1xuICAgICAgICAvLyBGdWxsIFllYXJcbiAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoXCIlWVwiLCBkYXRlLmdldEZ1bGxZZWFyKCkpO1xuICAgICAgICAvLyBTZXQgTnVtYmVyZWQgTW9udGhcbiAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoXCIlbVwiLCBkYXRlLmdldE1vbnRoKCkgKyAxKTtcbiAgICAgICAgLy8gU2V0IFNob3J0IE1vbnRoXG4gICAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFwiJWJcIiwgdGhpcy5TSE9SVF9NT05USFNbZGF0ZS5nZXRNb250aCgpXSk7XG4gICAgICAgIC8vIFNldCBNb250aFxuICAgICAgICBmbXQgPSBmbXQucmVwbGFjZShcIiVCXCIsIHRoaXMuTU9OVEhTW2RhdGUuZ2V0TW9udGgoKV0pO1xuICAgICAgICAvLyBTZXQgRGF0ZVxuICAgICAgICBmbXQgPSBmbXQucmVwbGFjZShcIiVkXCIsIGRhdGUuZ2V0RGF0ZSgpKTtcbiAgICAgICAgLy8gU2V0IFNob3J0IERheVxuICAgICAgICBmbXQgPSBmbXQucmVwbGFjZShcIiVhXCIsIHRoaXMuU0hPUlRfREFZU1tkYXRlLmdldERheSgpXSk7XG4gICAgICAgIC8vIFNldCBEYXlcbiAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoXCIlQVwiLCB0aGlzLkRBWVNbZGF0ZS5nZXREYXkoKV0pO1xuICAgICAgICAvLyBTZXQgSG91cnMgLSAyNFxuICAgICAgICBmbXQgPSBmbXQucmVwbGFjZShcIiVIXCIsIHRoaXMuZml4VGltZShkYXRlLmdldEhvdXJzKCkpKTtcbiAgICAgICAgLy8gU2V0IEhvdXJzIC0gMTJcbiAgICAgICAgZm10ID0gZm10LnJlcGxhY2UoXCIlLWxcIiwgdGhpcy5zZXQxMkhvdXIoZGF0ZS5nZXRIb3VycygpKSk7XG4gICAgICAgIC8vIFNldCBNaW5zXG4gICAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFwiJU1cIiwgdGhpcy5maXhUaW1lKGRhdGUuZ2V0TWludXRlcygpKSk7XG4gICAgICAgIC8vIFNldCBTZWNzXG4gICAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFwiJVNcIiwgdGhpcy5maXhUaW1lKGRhdGUuZ2V0U2Vjb25kcygpKSk7XG4gICAgICAgIC8vIFNldCBBTVBNXG4gICAgICAgIGZtdCA9IGZtdC5yZXBsYWNlKFwiJXBcIiwgdGhpcy5BTVBNKTtcblxuICAgICAgICByZXR1cm4gZm10O1xuICAgICAgfVxuICAgIH0sXG4gICAgZ2V0RGF0ZToge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIGdldERhdGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGU7XG4gICAgICB9XG4gICAgfSxcbiAgICBpc0RhdGU6IHtcbiAgICAgIHZhbHVlOiBmdW5jdGlvbiBpc0RhdGUoZCkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGQpID09PSBcIltvYmplY3QgRGF0ZV1cIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIGlzU3RyaW5nOiB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24gaXNTdHJpbmcoc3RyKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3RyKSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIjtcbiAgICAgIH1cbiAgICB9LFxuICAgIHNldDEySG91cjoge1xuICAgICAgdmFsdWU6IGZ1bmN0aW9uIHNldDEySG91cihob3VyKSB7XG4gICAgICAgIHRoaXMuQU1QTSA9IGhvdXIgPCAxMiA/IFwiYW1cIiA6IFwicG1cIjtcbiAgICAgICAgaWYgKGhvdXIgPD0gMTIpIHtcbiAgICAgICAgICByZXR1cm4gaG91cjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gaG91ciAtIDEyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBzZXREYXRlOiB7XG4gICAgICB2YWx1ZTogZnVuY3Rpb24gc2V0RGF0ZSgpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuICAgICAgICBpZiAodGhpcy5pc1N0cmluZyhhcmdzWzBdKSAmJiB0aGlzLmRhdGVfdGVzdC50ZXN0KGFyZ3NbMF0pKSB7XG4gICAgICAgICAgdGhpcy5kYXRlID0gdGhpcy5kYXRlRml4KGFyZ3NbMF0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh0aGlzLmlzU3RyaW5nKGFyZ3NbMF0pKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGUgPSBuZXcgRGF0ZShhcmdzWzBdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMuYXBwbHkobnVsbCwgYXJncykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIERhdGVGb3JtYXR0ZXI7XG59KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVGb3JtYXR0ZXI7Il19
