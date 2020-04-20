let express = require('express');
let router = express.Router();
let debug = require('debug')('dailyproblem:db');
let Firestore = require('@google-cloud/firestore');
let admin = require('firebase-admin');

const db = new Firestore({
  projectId: process.env.GOOGLE_PROJECT_ID,
});

const wrapper = asyncFn => {
  return (async (req, res, next) => {
    try {
      return await asyncFn(req, res, next)
    } catch (error) {
      return next(error)
    }
  })
};

router.get('/', wrapper(async (req, res, next) => {
  debug('%o', req.session);

  res.render('index', {
    user: req.session.user,
    recommendations: recommendations,
  });
}));

module.exports = router;
