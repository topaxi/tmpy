const mongoose = require('mongoose')
const config   = require('../config.json')

mongoose.Promise = global.Promise
mongoose.connect(config.db.host, config.db.name)

exports.FileSchema = require('./file')
