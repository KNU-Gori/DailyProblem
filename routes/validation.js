let express = require('express');
let router = express.Router();

router.post('/boj', (req, res, next) => {
  console.log('Received: ');
  console.log(req.body);

  // isAnon 체크되면 이런 식으로 옴 : { problem: '3', comment: '2', isAnon: 'on' }
  // 체크 안되면 키가 없음


});

module.exports = router;
