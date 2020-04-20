let express = require('express');
let router = express.Router();
let debug = require('debug')('dailyproblem:db');
let debug_create = require('debug')('dailyproblem:db:create');
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

router.post('/create', wrapper(async (req, res, next) => {
  let body = req.body;
  let result = {};

  debug_create('We received: %O', body);

  debug_create('We\'ll return: %o', result);
  res.json(result);
}));

module.exports = router;
