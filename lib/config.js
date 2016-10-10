const path = require('path')
const defaultsDeep = require('lodash.defaultsdeep')
const configfile = require('../config.json')

const defaults = {
  hostname: '',
  https: false,
  port: 8080,
  ip: '127.0.0.1',
  'upload-dir': path.join(__dirname, '../uploads'),
  logger: 'dev',
  db: {
    host: 'localhost',
    name: 'tmpy',
    user: 'tmpy',
    password: 'tmpy'
  },
  'max-age': 15,
  janitor: 5
}

const env = {
  hostname: process.env.TMPY_HOSTNAME,
  https: process.env.TMPY_HTTPS === 'true',
  port: process.env.TMPY_PORT,
  ip: process.env.TMPY_IP,
  'upload-dir': process.env.TMPY_UPLOAD_DIR,
  logger: process.env.TMPY_LOGGER,
  db: {
    host: process.env.TMPY_DB_HOST,
    name: process.env.TMPY_DB_NAME,
    user: process.env.TMPY_DB_USER,
    password: process.env.TMPY_DB_PASSWORD
  },
  'max-age': process.env.TMPY_MAX_AGE,
  janitor: process.env.TMPY_JANITOR
}

module.exports = defaultsDeep({}, env, configfile, defaults)
