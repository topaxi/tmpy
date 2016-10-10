const express = require('express')
const morgan  = require('morgan')
const http    = require('http')
const path    = require('path')
const config  = require('./lib/config')

const app = express()

app.set('port', config.port)
app.set('ip', config.ip)
app.set('views', './views')
app.set('view engine', 'pug')
app.use(morgan(config.logger))
app.use(express.static('./public'))
app.use('/js', express.static('./node_modules/clipboard/dist'))

require('./routes')(app)
require('./lib/janitor')

http.createServer(app).listen(app.get('port'), app.get('ip'), () => {
  console.log(`Express server listening on port ${app.get('port')} and ip ${app.get('ip')}`)
})
