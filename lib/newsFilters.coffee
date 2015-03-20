
'use strict'
_ = require('lodash')

module.exports = ()->
  (data, ftr)->
    return data if _.isNull(ftr) or _.isUndefined(ftr)

    month = ftr.date.getMonth()
    year  = ftr.date.getFullYear()

    _.filter data, (d)->
      d.pubDate.getMonth() == month and d.pubDate.getFullYear() == year

# exports.paginationFilter = ()->
#   (data, current, offset)->
#     start = current * offset
#     end   = start + offset
#     data.slice(start, end)


