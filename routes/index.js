let express = require('express');
let router = express.Router();

router.get('/', (req, res, next) => {
  console.log(req.session);
  res.render('index', {user: req.session.user});
});

module.exports = router;
