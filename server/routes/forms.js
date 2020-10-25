const express = require('express')
const router = express.Router()
const Form = require('../models/Form')

router.get('/', (req, res) => {
  Form.findAll().
    then(forms => {
      console.log(forms)
      res.send(forms)
    }).catch(err => {
    console.log(err)
    res.send(err)
  })
})

module.exports = router