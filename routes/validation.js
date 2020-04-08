let express = require('express');
let router = express.Router();
let debug = require('debug')('dailyproblem:validation');
let debug_BOJ = require('debug')('dailyproblem:validation:validateBOJ');
let axios = require('axios');
let cheerio = require('cheerio');

const validateBOJ = (problem) => {
  const BOJ_PROBLEM_URL = 'https://www.acmicpc.net/problem/';
  const target_url = BOJ_PROBLEM_URL + problem;
  debug_BOJ('Send GET to: %s', target_url);

  let result = {};

  axios.get(target_url)
    .then((res) => {
      debug_BOJ('Received : %o', res);
      if (res.status === 200 || res.status === 201) {
        result.status = 'ok';  // problem exists

        // get problem title
        const $ = cheerio.load(res.data);
        result.title = $('#problem_title').text();
      }
    })
    .catch((err) => {
      let res = err.response;
      debug_BOJ('ERR Received : %o', res);
      if (res.status === 404) {
        result.status = 'notfound';  // problem not found 404
      }
    })
    .finally(() => {
      if (result.status === undefined) {
        debug_BOJ('result.status is not set. Maybe unknown error?');
        result.status = 'unknown';  // unknown error
      }

      debug_BOJ('We\'ll return: %o', result);
      return result;
    });
};

router.post('/boj', (req, res, next) => {
  let body = req.body;
  debug('Received: %s', body);

  // isAnon 체크되면 이런 식으로 옴 : { problem: '3', comment: '2', isAnon: 'on' }
  // 체크 안되면 키가 없음

  debug('validate BOJ problem : %s', body.problem);
  let validate_res = validateBOJ(body.problem);
  

});

// /validation/boj에서 return해주는 response의 형식은?
// status:
//

module.exports = router;
