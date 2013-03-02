var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , config  = require('./config.json')

app = express()

app.configure(function(){
  app.set('port', process.env.PORT || config.listen || 3000)
  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')
  app.use(express.favicon())
  app.use(express.logger('dev'))
  app.use(express.bodyParser({ keepExtensions: false, uploadDir: path.join(__dirname, 'public/uploads') }))
  app.use(express.methodOverride())
  app.use(app.router)
  app.use(express.static(path.join(__dirname, 'public')))
});

app.configure('development', function(){
  app.use(express.errorHandler())
});

require('./routes')(app)
require('./lib/janitor')

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'))
});
