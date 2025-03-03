const express = require('express')
const bodyParser = require('body-parser')
const routes = require('./routes/index') // Import routes
const { sequelize } = require('./model')

const app = express()
app.use(bodyParser.json())
app.use('/api', routes)

app.set('sequelize', sequelize)
app.set('models', sequelize.models)

module.exports = app
