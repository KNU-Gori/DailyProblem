let express = require('express');
let router = express.Router();
let debug = require('debug')('dailyproblem:validation');



router.post('/boj', (req, res, next) => {
  debug('Received: %s', req.body);

  // isAnon 체크되면 이런 식으로 옴 : { problem: '3', comment: '2', isAnon: 'on' }
  // 체크 안되면 키가 없음



});

// /validation/boj에서 return해주는 response의 형식은?
// status:
//

module.exports = router;
