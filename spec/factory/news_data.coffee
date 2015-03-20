
_ = require 'lodash'

month_list = [31,28,31,30,31,30,31,31,30,31,30,31]

news_data = (num=10)->
  articles = []
  list = [0..num]
  month = 5
  n = 0
  _.forEach list, (i)->
    json = {}

    json.id     = i

    venue_id    = _.random(0, 5)
    json.venues = [{id:venue_id, title:"Venue #{i}"}]

    borough_id     = _.random(0, 5)
    json.boroughs  = [{id:borough_id, title:"Borough #{i}"}]

    json.headline = "News Articles #{i}"
    n++
    date = if n < 10 then "0#{n}" else n
    if n >= month_list[month-1]
      month++
      n = 0
    m = if month < 10 then "0#{month}" else month
    json.published = "2014-#{m}-#{date}"
    json.summary = "<p>Morbi accumsan ipsum eget aliquet accumsan. In ac turpis ac quam tristique molestie sed at diam. Phasellus eleifend ultrices sagittis. Nunc et congue sem. Nam condimentum sollicitudin urna vel sagittis. Nam pharetra bibendum orci sit amet tincidunt. Mauris at purus velit.</p>"
    json.body = "<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Assumenda neque officiis laboriosam aperiam repudiandae molestiae magni iste, velit placeat quae facilis? Esse iste dolorem tempora dolores libero, laborum vel officia.</p>"

    json.meta = {
      title:"News Articles #{i}"
      description:"<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Rerum atque quas, cupiditate incidunt nobis, itaque placeat quasi accusantium, ipsum voluptatem neque excepturi amet modi ex a magni ducimus quam. Impedit.</p>"
    }

    json.images = {
      thumb: {
        src: "http://www.fillmurray.com/g/90/60.url",
        alt: "Thumb Placeholder #{i}"
      },
      main: {
        src: "http://www.fillmurray.com/g/400/300.url",
        alt: "Main Placeholder #{i}"
      }
    }

    if _.random(0, 3) < 2
      json.pdf = {
        src:"/path/to/pdf.pdf"
        text:"Text link"
      }

    articles.push json

  return articles

exports.data = news_data

exports.fulldata = (num=10)->
  data = news_data(num)
  month = 1
  i = 0

  _.forEach data, (d)->
    i++
    date = if i < 10 then "0#{i}" else i
    if i >= month_list[month-1]
      month++
      i = 0
    m = if month < 10 then "0#{month}" else month
    d.pubDate    = new Date(2014,(month-1),i)
    d.formatDate = "#{date}/#{m}/2014"

  data


exports.months = (num=1)->
  data = []
  month = 1
  # month_list = [31,28,31,30,31,30,31,31,30,31,30,31]
  i = 0
  _.forEach [0...60], (t)->
    json = {}

    i++
    date = if i < 10 then "0#{i}" else i
    if i >= month_list[month-1]
      month++
      i = 0
    m = if month < 10 then "0#{month}" else month
    json.pubDate    = new Date(2014,(month-1),i)
    json.published  = "2014-#{m}-#{date}"
    json.formatDate = "#{date}/#{m}/2014"
    data.push(json)

  return data