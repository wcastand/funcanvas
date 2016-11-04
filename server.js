const browserify = require('browserify')
const bankai = require('bankai')
const http = require('http')
const path = require('path')

const client = path.join(__dirname, 'client.js')

const assets = bankai()
const css = assets.css({ use: ['sheetify-stylus']})
const js = assets.js(browserify, client)
const html = assets.html()

http.createServer((req, res) => {
  switch (req.url) {
    case '/': return html(req, res).pipe(res)
    case '/bundle.js': return js(req, res).pipe(res)
    case '/bundle.css': return css(req, res).pipe(res)
    default: return res.statusCode = 404 && res.end('404 not found')
  }
}).listen(8080)
