let express = require('express');
let router = express.Router();
let debug = require('debug')('dailyproblem:validation');
let debug_BOJ = require('debug')('dailyproblem:validation:validateBOJ');
let axios = require('axios');
let cheerio = require('cheerio');
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

const validateBOJ = async (problem) => {
  /*
    validateBOJ(problem) =>
    {
      status: 'ok' / 'notfound' / 'unknown',
      problem: 문제 번호,
      title (ok일 때만): '문제 제목'
    }
   */
  const BOJ_PROBLEM_URL = 'https://www.acmicpc.net/problem/';
  const target_url = BOJ_PROBLEM_URL + problem;
  debug_BOJ('Send GET to: %s', target_url);

  let result = {};
  result.problem = problem;

  await axios.get(target_url)
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
    });

  debug_BOJ('We\'ll return: %o', result);
  return result;
};

router.post('/boj', wrapper(async (req, res, next) => {
  let body = req.body;
  debug('Received: %s', body);

  // isAnon 체크되면 이런 식으로 옴 : { problem: '3', comment: '2', isAnon: 'on' }
  // 체크 안되면 키가 없음

  debug('validate BOJ problem : %s', body.problem);
  const v_res = await validateBOJ(body.problem);
  debug('We received: %o', v_res);

  let result = {};
  // res.json({}) to return json response

  if (v_res.status === 'ok') {
    // 문제 검증 확인됨

    debug('Send /db/create request');
    // TODO: Session validation must be operated here
    // TODO: Separate as db_operation.js
    // TODO: Separate as module, not route
    // TODO: How to?

    /*
    await axios.post('/db/create', {
      problem_id: v_res.problem,
      title: v_res.title,
      comment: body.comment,
      author: body.author,
      author_email: body.author_email,
      // is_anon: (body.isAnon === 'on'),
      is_anon: false,
      status: 0,  // 0: 처리 전, 1: 처리 완료, -1: 반려
    })
      .then((res) => {
        debug(res);
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      });
    */

    // TODO: One recommendation per one day

    let addDoc = await db.collection('recommendations').add({
      problem_id: v_res.problem,
      title: v_res.title,
      comment: body.comment,
      author: body.author,
      author_email: body.author_email,
      // is_anon: (body.isAnon === 'on'),
      is_anon: false,
      status: 0,
      datetime: admin.firestore.FieldValue.serverTimestamp(),
    }).then((ref) => {
      debug('Success on DB addDoc: %o', ref);
      result.status = 'ok';
    }).catch((err) => {
      debug('Error on DB addDoc: %s', err);
      result.status = 'error';
    });

    result.status = 'ok';
    result.message = '서버 Queue에 추천 문제가 성공적으로 등록되었습니다.';
  } else if (v_res.status === 'notfound') {
    // 해당 번호의 문제가 없음
    result.status = 'error';
    result.message = '해당 문제를 찾을 수 없습니다.';
  } else {  // unknown
    // unknown error
    result.status = 'error';
    result.message = '알 수 없는 에러가 발생했습니다.';
  }

  debug('We\'ll return: %o', result);
  res.json(result);
}));

/*
/validation/boj에서 return해주는 response의 형식은?
{
  status: ok / error
  // ok면 문제 검증 후 DB에 등록 완료.
  // --> 완료 메시지 띄우고, clear form, fetch table
  // error면 진행 불가
  // --> 에러 메시지 띄우고 그대로
  message: 'notfound' /
}
 */

module.exports = router;
