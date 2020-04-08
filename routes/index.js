let express = require('express');
let router = express.Router();
let debug = require('debug')('dailyproblem:index');

router.get('/', (req, res, next) => {
  debug('%o', req.session);
  res.render('index', {user: req.session.user});
});

module.exports = router;
