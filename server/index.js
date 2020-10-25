require('dotenv').config()
const express = require('express')
// const sql = require('./config/db.js')

const app = express()
const port = process.env.PORT || 5000
const db = require('./config/db')

db.authenticate().then(() => {
  console.log('Connection has been established successfully')
}).catch((err) => {
  console.log('Unable to connect to the database: ', err)
})

app.get('/', (req, res) => {
  res.send('hello')
})

app.use(`${process.env.API_BASE_URL}/forms`, require('./routes/forms'))

app.listen(port, () => {
  console.log(`Express server is running on localhost:${port}`)
})
