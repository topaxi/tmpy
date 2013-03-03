var File   = require('../models/file')
  , config = require('../config.json')
  , fs     = require('fs')
  , async  = require('async')
  , maxAge = config['max-age'] * 60 * 1000

!function run() {
  var now = Date.now()

  // TODO: File.remove({})?
  File.find({}, function(err, files) {
    async.eachLimit(files, 2, function(file, done) {
      if (now - file.date >= maxAge) {
        file.remove()
        fs.unlink(file.path, done)
      }
    })

    setTimeout(run, 1000 * 60 * config.janitor)
  })
}()
