const File   = require('../models/file')
const config = require('./config')
const fs     = require('fs')
const async  = require('async')
const maxAge = config['max-age'] * 60 * 1000

!function run() {
  console.log('Janitor goes to work!')

  let now = Date.now()

  File.find({}).then(files => {
    if (!files.length) return rerun()

    async.eachLimit(files, 2, function(file, done) {
      if (now - file.date < maxAge) return done()

      console.log('Removing', file.path)
      file.deleteOne().then(() => fs.unlink(file.path, done), done)
    }, rerun)
  }).catch(err => {
    console.error('Janitor failed', err)
    rerun()
  })

  function rerun() {
    console.log('Janitor finished work after %dms', Date.now() - now)

    setTimeout(run, 1000 * 60 * config.janitor)
  }
}()
