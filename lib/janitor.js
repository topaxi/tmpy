var File   = require('../models/file')
  , config = require('../config.json')
  , fs     = require('fs')
  , async  = require('async')
  , maxAge = config['max-age'] * 60 * 1000

!function run() {
  console.log('Janitor goes to work!')

  var now = Date.now()

  // TODO: File.remove({})?
  File.find({}, function(err, files) {
    if (!files.length) return rerun()

    async.eachLimit(files, 2, function(file, done) {
      if (now - file.date < maxAge) return done()

      console.log('Removing', file.path)
      file.remove()
      fs.unlink(file.path, done)
    }, rerun)
  })

  function rerun() {
    console.log('Janitor finished work after %dms', Date.now() - now)

    setTimeout(run, 1000 * 60 * config.janitor)
  }
}()
