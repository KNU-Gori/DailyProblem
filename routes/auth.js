let express = require('express');
let router = express.Router();
const https = require('https');

router.get('/redirect', (req, RES, next) => {
  if (req.query.error) {
    console.log('/auth get error!');
    RES.redirect('/');
  } else {
    // we received 'code'
    // send request to OAuth server
    let CLIENT_ID = process.env.CLIENT_ID;
    let CLIENT_SECRET = process.env.CLIENT_SECRET;
    let CODE = req.query.code;
    const url = `https://slack.com/api/oauth.access?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${CODE}`;

    https.get(url, (res) => {
      res.setEncoding("utf8");
      let body = "";
      res.on("data", data => {
        body += data;
      });
      res.on("end", () => {
        body = JSON.parse(body);
        console.log(body);

        if (body.ok === true) {
          req.session.user = {
            name: body.user.name,
            email: body.user.email
          };
          console.log(`stored to session: sess.user = ${JSON.stringify(req.session.user)}`);

          console.log(`now our session is: `);
          console.log(req.session);

        } else {
          console.log('OAuth api error!');
          RES.redirect('/');  // 각 로직 블록마다 res.redirect를 정상적으로 해줘야 세션이 저장됨
        }

        RES.redirect('/');
      });
    }).on('error', (e) => {
      console.error(e);
      RES.redirect('/');
    });
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router;
