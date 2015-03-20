'use strict';
var DateFormatter, _, dateFmt;

_ = require('lodash');

DateFormatter = require("date-formatter");

dateFmt = new DateFormatter();

module.exports = function($http, $q) {
  var newsData, urlPath;
  newsData = [];
  urlPath = "/";
  return {
    addDate: function(data) {
      if (_.isEmpty(data)) {
        return data;
      }
      _.forEach(data, function(d) {
        d.pubDate = dateFmt.dateFix(d.published);
        return d.fmtPub = dateFmt.formatDate(d.pubDate, "%d %B %Y");
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
        var mDate, month, ms;
        month = d.published.replace(/(\d{2})*$/, "01");
        ms = _.pluck(months, 'str');
        if (!_.contains(ms, month)) {
          mDate = dateFmt.dateFix(month);
          return months.push({
            date: mDate,
            str: month,
            txt: dateFmt.formatDate(mDate, "%B, %Y")
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
        $http.get("/api/news.json").success(function(data) {
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
