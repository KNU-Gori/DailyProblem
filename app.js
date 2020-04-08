let dotenv = require('dotenv');

let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let session = require('express-session');

let indexRouter = require('./routes/index');
let authRouter = require('./routes/auth');
let validationRouter = require('./routes/validation');

dotenv.config();

let app = express();

app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
  // default it uses MemoryStore
}));

app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/validation', validationRouter);

module.exports = app;
