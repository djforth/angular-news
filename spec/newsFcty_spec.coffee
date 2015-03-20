require 'angular'
require 'angular-mocks'
require '../lib/news.coffee'
_ = require 'lodash'

newsData = require("./factory/news_data.coffee")
mockdata = newsData.data()
fctyTests = require('factory-tests')


describe 'News Factory', ->
  ctrl = rootScope = httpBackend = fcty = promise = deferred = srv =  null


  beforeEach ->
    angular.mock.module('$news')

    angular.mock.inject ($q, $rootScope, $httpBackend, NewsFcty, setNewsUrl)->
      httpBackend = $httpBackend;
      setNewsUrl.url = "/api/news.json"
      fcty      = NewsFcty
      deferred  = $q.defer()
      promise   = deferred.promise
      rootScope = $rootScope


  it 'should start with empty request', ->
    expect(fcty.data().length).toEqual(0)

  fctyTests.setFlushData(()->
    return fcty
  , mockdata)

  describe 'addDate function', ->
    mc = data = null
    beforeEach ->
      mc = _.slice(mockdata,0, 2)
      data = fcty.addDate(mc)

    it 'should set publish date', ->
      date1 = new Date(2014,4,1)
      date2 = new Date(2014,4,2)

      expect(data[0].pubDate).toEqual(date1)
      expect(data[1].pubDate).toEqual(date2)

    it 'should set format date', ->
      expect(data[0].fmtPub).toEqual("1 May 2014")
      expect(data[1].fmtPub).toEqual("2 May 2014")


  describe 'getMonths', ->
    md = months = null
    beforeEach ->
      data = newsData.months()

      months = fcty.getMonths(data)


    it 'should return a list of months', ->
      expect(months.length).toEqual(3)
      data = [
        {date:new Date(2014,0,1), str:"2014-01-01", txt:"January, 2014"},
        {date:new Date(2014,1,1), str:"2014-02-01", txt:"February, 2014"},
        {date:new Date(2014,2,1), str:"2014-03-01", txt:"March, 2014"}]

      expect(months).toEqual(data)

  describe 'getData', ->
    beforeEach ->
      spyOn(fcty, "addDate").and.returnValue([_.first(mockdata)])
      spyOn(fcty, "getMonths").and.returnValue([{date:new Date(2014,4,1), str:"2014-05-01", txt:"May, 2014"}])
      # fcty.setUrl("/api/news/test.json")


    #See support/utils/factory_test.coffee - Test Promises
    fctyTests.testPromises(()->
      return fcty # Passes Fcty to test - Work around
    # Data being sent
    , [_.first(mockdata)]
    # Error msg
    , "An error occurred while fetching items, we have been notified and are investigating.  Please try again later"
    # Response data to resolve Error
    ,{data:[_.first(mockdata)], months:[{date:new Date(2014,4,1), str:"2014-05-01", txt:"May, 2014"}]}
    )


    #See support/utils/factory_test.coffee - Test HTTP Request
    fctyTests.testHTTPRequest(()->
      return fcty # Passes Fcty to test - Work around
    #URL Request
    , "/api/news.json"
    # Data being sent
    , _.first(mockdata, 1)
    # Error msg
    , "An error occurred while fetching items, we have been notified and are investigating.  Please try again later"
    # Response data to resolve Error
    ,{data:[_.first(mockdata)], months:[{date:new Date(2014,4,1), str:"2014-05-01", txt:"May, 2014"}]}
    )


