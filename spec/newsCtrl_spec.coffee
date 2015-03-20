require 'angular'
require 'angular-mocks'
require '../lib/news.coffee'
_ = require 'lodash'

newsData = require("./factory/news_data.coffee")
mockdata = newsData.fulldata(100)

ctrlTests = require('controller-tests')


describe 'News Ctrl', ->
  ctrl = rootScope = scope = httpBackend = fcty = promise = deferred =  monthsStub = paginationStub = null
  service = resizeSrv = null

  beforeEach ->
    angular.mock.module('$news')

    angular.mock.inject(($q, $sce, $rootScope, $controller, NewsFcty, PaginationService, resizer)->
      scope = $rootScope.$new()
      rootScope = $rootScope

      resizeSrv = resizer
      #Resizer
      spyOn(resizeSrv, "windowSize").and.returnValue({width:500})
      spyOn(resizeSrv, "getDevice").and.returnValue("Desktop")
      spyOn(resizeSrv, "trackSize")

      #Pagination set up
      service = PaginationService
      spyOn(service, "setPage")

      #Setup promise stubbing
      deferred  = $q.defer()
      promise   = deferred.promise
      spyOn(NewsFcty, 'getData').and.returnValue(promise)
      fcty = NewsFcty

      #Sets up filter stubbing
      monthsStub     = jasmine.createSpy().and.returnValue(_.first(mockdata, 31))
      paginationStub = jasmine.createSpy().and.returnValue(_.first(mockdata, 10))
      filter = jasmine.createSpy().and.callFake((d)->
        if d == "monthFilter" then monthsStub else paginationStub

      )


      ctrl = $controller("NewsCtrl", {
        $scope: scope,
        $sce: $sce,
        $filter:filter
      })
    )

  describe 'setup', ->
    it 'should exist', ->
      expect(ctrl).toBeDefined()

    it 'should set defaults', ->
      defaults = {selectedMonth:null, error:null, locations:[], newsArticles:[], itemCount:0}

      ctrlTests.checkValues(scope, defaults)

    it 'resizer functions', ->
      expect(resizeSrv.windowSize).toHaveBeenCalled()
      expect(resizeSrv.getDevice).toHaveBeenCalled()
      expect(resizeSrv.trackSize).toHaveBeenCalled()

  describe 'hideAtMobile', ->
    it 'should return false if desktop', ->
      scope.device = "desktop"
      expect(scope.hideAtMobile()).toBeTruthy()

    it 'should return false if Tablet', ->
      scope.device = "tablet"
      expect(scope.hideAtMobile()).toBeTruthy()

    it 'should return true if mobile', ->
      scope.device = "mobile"
      expect(scope.hideAtMobile()).toBeFalsy()


  describe "getNews Functionality", ->

    setUp = ()->
      {scope:scope, deferred:deferred}
    months = [{date:new Date(2014,0,1), str:"2014-01-01", txt:"January, 2014"}]

    # Tests if promise success
    ctrlTests.promiseData(setUp, {data:mockdata, months:months}, {newsArticles:mockdata, months:months, itemCount:101})


    #Tests if promise failure
    ctrlTests.promiseError(setUp, "There an Error", {error:"There an Error"})


  describe 'filter tests', ->
    beforeEach ->
      scope.newsArticles  = mockdata
      scope.selectedMonth = {date:new Date(2014, 0, 1)}
      filtered = scope.filteredNews()

    it 'should call month filter', ->
      expect(monthsStub).toHaveBeenCalled()
      expect(monthsStub).toHaveBeenCalledWith(mockdata, {date:new Date(2014, 0, 1)})

    it 'should call pagination filter', ->
      expect(paginationStub).toHaveBeenCalled()
      expect(paginationStub).toHaveBeenCalledWith(_.first(mockdata, 31))



