const File   = require('../models/file')
const config = require('../config.json')
const fs     = require('fs')
const async  = require('async')
const maxAge = config['max-age'] * 60 * 1000

!function run() {
  console.log('Janitor goes to work!')

  let now = Date.now()

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
