const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

const flash = require('connect-flash');
const session = require('express-session');

const passport = require('passport');

const app = express();

// db config
const db = require('./config/keys').mongoURI;

//passport config
require('./config/passport')(passport);

// connect mongodb
mongoose.connect(db, { useNewUrlParser: true})
    .then(() => console.log('Mongodb connected.'))
    .catch(e => console.log(e));

//ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

// bodyparse
app.use(express.urlencoded({ extended: true }));

// express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

// global vars
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 3000;
app.listen(3000, console.log(`Server is running at port ${PORT}`));