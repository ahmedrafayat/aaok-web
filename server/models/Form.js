const Sequelize = require('sequelize')
const db = require('../config/db')

const Form = db.define('forms', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
  },
  title: {
    type: Sequelize.STRING,
  },
  createdAt: {
    type: Sequelize.DATE
  },
  updatedAt: {
    type: Sequelize.DATE
  }
})

module.exports = Form