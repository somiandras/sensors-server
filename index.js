const express = require('express');
const app = express();
const dbase = require('./dbase');
const db = new dbase();
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const helmet = require('helmet');

app.use(helmet());
app.use(require('morgan')('combined'));
app.use(express.json());

// Token set in env variable in shell script
const accept_token = process.env.ACCEPT_TOKEN

passport.use(new Strategy(
  function(token, cb) {
    if (token === accept_token) {
      return cb(null, true);
    } else {
      return cb(null, false);
    }
  }
));

app.post('/readings', 
  passport.authenticate('bearer', { session: false }),
  function(req, res){
    let data = req.body;

    db.insert(data)
    .then(function() {
      res.status(200).send();
    })
    .catch(function(err) {
      console.log(err.stack);
      res.status(500).send();
    });
  }
);

app.use(function (err, req, res, next) {
  console.log(err.stack)
  res.status(500).send();
})

console.log('Listening on port 3333');
app.listen(3333);
