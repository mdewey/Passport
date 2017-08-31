const express = require("express")
const mustacheExpress = require("mustache-express")
const bodyParser = require("body-parser")
const User = require('./models/user')
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const session = require("express-session")
const bcrypt = require('bcryptjs')
const models = require("./models")


const app = express()

// define how we auth a user
passport.use("login", new LocalStrategy((username, password, next) => {
    models.User
        .findOne({ where: { username } })
        .then(user => {
            
            // check againt the password
            if (bcrypt.compareSync(password, user.passwordHash)) {
                return next(null, {username:user.username, id: user.id})
            } else {
                return next(null, false, { message: "Noooooope" })
            }
        })
        .catch(err => {
            return next(err)
        })
}))

passport.use('signup', new LocalStrategy((username, password, next) => {
    let data = {
        username: username,
        password: password
    }
    // create a user
    models.User
        .build(data)
        .save()
        .then(user => {
            // save to database
            return next(null, user);
        })
        .catch(err => next(err))
}))

// freeze-dry the user
passport.serializeUser((user, next) => {
    //MW
    next(null, user.id)
})

passport.deserializeUser(function (id, next) {
    models.User.findOne({
        where: {
            id: id
        }
    }).then(user => {
        next(null, {username:user.username, id: user.id});
    })
})


app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
}));


app.use(passport.initialize());
app.use(passport.session());


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.engine("mustache", mustacheExpress())

app.set("views", "./views")
app.set("view engine", "mustache")
app.use(express.static("public"))

app.get('/', (req, res) => {
    res.render("home")
})

app.post('/', passport.authenticate("login", {
    successRedirect: "/restricted",
    failureRedirect: "/"
}))

app.post('/signup', passport.authenticate("signup", {
    successRedirect: "/restricted",
    failureRedirect: "/"
}))

app.get('/logout', (req, res) => {
    // clear the sessions
    req.session.destroy();
    // logout of passport
    req.logOut();
    res.redirect('/');
})

// restrict users!!!

const restrictAccess = (req, res, next) => {
    if (req.user) {
        return next()
    } else {
        return res.redirect('/')
    }
}

app.get('/restricted', restrictAccess, (req, res) => {
    console.log("a", req.user)
    res.render("restricted", req.user)
})


app.listen(3000, () => {
    console.log("Started on 3000!")
})