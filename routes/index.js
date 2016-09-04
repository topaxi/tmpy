const File   = require('../models/file')
const fs     = require('fs')
const path   = require('path')
const config = require('../config.json')
const multer = require('multer')

const upload = multer({
  dest: path.join(__dirname, '../uploads')
})

const schema = config.https ? 'https' : 'http'

const {
  basename
} = require('path')

module.exports = app => {
  app.get('/', (req, res) => {
    res.render('index', {
      title: 'tmpy - Sharing temporary files',
      clientGlobals: { maxAge: config['max-age'] }
    })
  })

  app.post('/upload', upload.any(), (req, res, next) => {
    let file = new File
    let [ uploadedFile ] = req.files;

    file.name     = uploadedFile.originalname
    file.size     = uploadedFile.size
    file.type     = uploadedFile.mimetype
    file.filehash = uploadedFile.filename
    file.date     = new Date

    file.save(err => {
      if (err) return next(err)

      res.send(
        `${schema}://${config.hostname}/uploads/${file.hash}\n`
      )
    })
  })

  app.get('/uploads/:id', (req, res, next) => {
    File.findOne({ 'hash': req.params.id }, (err, file) => {
      if (err) return next(err)

      // Try to view images and text inline
      if (file.type == 'text/plain' || /^image\//.test(file.type)) {
        res.type(file.type)
        res.set('Content-Disposition', `inline; filename="${file.name}"`)
        res.sendFile(file.path)
      }
      else {
        res.download(file.path, file.name)
      }
    })
  })
}
