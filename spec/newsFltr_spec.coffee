require 'angular'
require 'angular-mocks'
require '../lib/news.coffee'
_ = require 'lodash'

newsData = require("./factory/news_data.coffee")
mockdata = newsData.months()

ctrlTests = require('controller-tests')


describe 'News Filters', ->
  filter =  null

  beforeEach ->
    angular.mock.module('$news')

    angular.mock.inject ($filter)->
      filter  = $filter

  it 'should be defined', ->
    expect(filter).toBeDefined()

  it "should return back all list if nothing past", ->
    filtered = filter("monthFilter")(mockdata)
    expect(filtered).toEqual(mockdata)

  it "should return back only month", ->

    filtered = filter("monthFilter")(mockdata, {date:new Date(2014, 0, 1)})
    jan = _.slice(mockdata, 0, 31)
    expect(filtered.length).toEqual(31)
    expect(filtered).toEqual(jan)


