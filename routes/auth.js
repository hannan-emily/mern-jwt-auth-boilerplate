require('dotenv').config();
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = require('../models/user');
var bcrypt = require('bcrypt');

var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');

router.post('/login', (req, res, next) => {
  let hashedPass = ''
  let passwordMatch = false

  // Look up the User, using a mongoose model
  User.findOne({email: req.body.email}, function(err, user) {
    hashedPass = user.password
    //compare hashed password to submitted password using bcrypt
    //there is built in bcyrpt function, compareSyc, that does the solve for us
    //the user.password was grabbed from the database as a hashed thing
    //passwordMatch will return either true (they match) or false(they don't)
    passwordMatch = bcrypt.compareSync(req.body.password, hashedPass)
    if (passwordMatch) {
      //The passwords match... make a token
      var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 24 //expires in 24 hours (calculated in seconds by this formula)
      })
      res.json({user, token})
    } else {
      console.log("passwords don't match")
      res.status(401).json({
        error: true,
        message: 'email or password incorrect'
      })
    }
  })
})

router.post('/signup', (req, res, next) => {
  User.findOne({email: req.body.email}, function(err, user) {
    if (user) {
      res.redirect('/auth/signup')
    } else {
      User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
      }).then( (err, user) => {
        if (err) {
          res.send(err)
        } else {
          var token = jwt.sign(user.toObject(), process.env.JWT_SECRET, {
            expiresIn: 60 * 60 * 24
          })
          res.json({user, token})
        }
      })
    }
  })
})

router.post('/me/from/token', (req, res, next) => {
  //Check for presence of a token
  var token = req.body.token || req.query.token
  if (!token) {
    res.status(401).json({message: "Must pass the token!"})
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        res.status(401).send(err)
      } else {
        User.findById({
          '_id': user._id
        }).then( (err, user) => {
          if (err) {
            res.status(401).send(err)
          } else {
            res.json({user, token})
          }
        })
      }
    })
  }
})

module.exports = router;
