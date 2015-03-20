
'use strict'
_ = require('lodash')

DateFormatter = require("date-formatter")

module.exports = ($http, $q, setNewsUrl)->
  newsData = []
  urlPath = "/"

  return {
    addDate:(data)->
      return data if _.isEmpty(data)

      _.forEach data, (d)->
        dateFmt   = new DateFormatter(d.published)
        d.pubDate = dateFmt.getDate()
        d.fmtPub  = dateFmt.formatDate("%d %B %Y")

      data

    data:()->
      newsData

    flush:()->
      newsData = []

    getMonths:(data)->
      months = []

      _.forEach data, (d)->

        month = d.published.replace(/(\d{2})*$/, "01")

        ms = _.pluck(months, 'str')

        if !_.contains(ms, month)
          dateFmt = new DateFormatter(month)
          mDate   = dateFmt.getDate()
          months.push {date:mDate, str:month, txt:dateFmt.formatDate("%B, %Y")}

      months

    getData:(type=null)->
      deferred = $q.defer()
      if _.isEmpty(newsData)

        that = @
        $http.get(setNewsUrl.url)
          .success( (data)->
            newsData = that.addDate(data)
            deferred.resolve({data:newsData, months:that.getMonths(newsData)});
          )
          .error ()->
            deferred.reject("An error occurred while fetching items, we have been notified and are investigating.  Please try again later")
      else
        deferred.resolve({data:newsData, months:@getMonths(newsData)});


      deferred.promise

    getUrl:()->
      urlPath

    setUrl:(url)->
      urlPath = url

    setData:(d)->
      newsData = d
  }