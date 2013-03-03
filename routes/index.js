var File   = require('../models/file')
  , fs     = require('fs')
  , path   = require('path')
  , config = require('../config.json')

module.exports = function(app) {
  app.get('/', function(req, res) {
    res.render('index', { title: 'tmpy - Sharing temporary files', globals: { maxAge: config['max-age'] } })
  })

  app.post('/upload', function(req, res, next) {
    var file = new File

    file.name = req.files.file.name
    file.size = req.files.file.size
    file.type = req.files.file.type
    file.hash = path.basename(req.files.file.path)
    file.date = new Date

    file.save(function(err) {
      if (err) return next(err)

      res.send('http://localhost:3000/uploads/'+ file.hash +'\n')
    })
  })

  app.get('/uploads/:id', function(req, res, next) {
    File.findOne({ 'hash': req.params.id }, function(err, file) {
      res.download(file.path, file.name)
    })
  })
}
