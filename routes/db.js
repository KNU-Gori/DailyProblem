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

  // TODO: One recommendation per one day

  let addDoc = await db.collection('recommendations').add({
    problem_id: body.problem_id,
    title: body.title,
    comment: body.comment,
    author: body.author,
    author_email: body.author_email,
    is_anon: body.is_anon,
    status: body.status,
    datetime: admin.firestore.FieldValue.serverTimestamp(),
  }).then((ref) => {
    debug_create('Success on DB addDoc: %o', ref);
    result.status = 'ok';
  }).catch((err) => {
    debug_create('Error on DB addDoc: %s', err);
    result.status = 'error';
  });

  debug_create('We\'ll return: %o', result);
  res.json(result);
}));

module.exports = router;
