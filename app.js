const express    = require('express')
const morgan     = require('morgan')
const bodyParser = require('body-parser')
const http       = require('http')
const path       = require('path')
const config     = require('./config.json')

const DEFAULT_PORT = 3000
const app = express()

app.set('port', process.env.PORT || config.listen || DEFAULT_PORT)
app.set('views', './views')
app.set('view engine', 'pug')
app.use(morgan('dev'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('./public'))

require('./routes')(app)
require('./lib/janitor')

http.createServer(app).listen(app.get('port'), () => {
  console.log(`Express server listening on port ${app.get('port')}`)
})
