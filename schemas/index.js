const mongoose = require('mongoose')
const config   = require('../lib/config')

mongoose.Promise = global.Promise
mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@${config.db.host}/${config.db.name}`);

exports.FileSchema = require('./file')
