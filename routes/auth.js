let express = require('express');
let router = express.Router();
const https = require('https');
let debug_redirect = require('debug')('dailyproblem:auth:redirect');
let debug_logout = require('debug')('dailyproblem:auth:logout');

router.get('/redirect', (req, RES, next) => {
  if (req.query.error) {
    debug_redirect('/auth/redirect received error parameter. See "Sign in with Slack".');
    RES.redirect('/');
  } else {
    // https://api.slack.com/docs/oauth

    let CLIENT_ID = process.env.CLIENT_ID;
    let CLIENT_SECRET = process.env.CLIENT_SECRET;
    let CODE = req.query.code;
    const url = `https://slack.com/api/oauth.access?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${CODE}`;

    debug_redirect('We received CODE from User Authorization: %s', CODE);
    debug_redirect('We\'ll send GET with code to Slack OAuth server');

    https.get(url, (res) => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (data) => {
        body += data;
      });
      res.on('end', () => {
        debug_redirect('Received from OAuth: %O', body);
        body = JSON.parse(body);

        if (body.ok === true) {
          req.session.user = {
            name: body.user.name,
            email: body.user.email
          };
          debug_redirect('Stored to session: sess.user = %o', req.session.user);
          debug_redirect('Now our session is: %O', req.session);
        } else {
          debug_redirect('OAuth API returned ok = false');
          RES.redirect('/');  // 각 로직 블록마다 res.redirect를 정상적으로 해줘야 세션이 저장됨
        }

        RES.redirect('/');
      });
    }).on('error', (e) => {
      debug_redirect('Error while sending GET: %s', e);
      RES.redirect('/');
    });
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session.user) {
    debug_logout('user found in session');
    req.session.destroy((err) => {
      if (err) {
        debug_logout('Error while destroying session: %s', err);
      } else {
        debug_logout('Destroyed session successful');
        res.redirect('/');
      }
    });
  } else {
    debug_logout('user not found in session. redirect to /');
    res.redirect('/');
  }
});

module.exports = router;
