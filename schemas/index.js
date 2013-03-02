var mongoose = require('mongoose')
  , config   = require('../config.json')

mongoose.connect(config.db.host, config.db.name)

exports.FileSchema = require('./file')
