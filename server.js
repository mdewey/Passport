const express = require("express")
const mustacheExpress = require("mustache-express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const User = require('./models/user')
const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const session = require("express-session")


mongoose.connect("mongodb://localhost/sampleApp", () => {
    console.log("connected to the mongod!!!!")
});

const app = express()

// define how we auth a user
passport.use("login", new LocalStrategy((username, password, next) => {
    User.authenticate(username, password, (err, user) => {
        if (err) {
            return next(err)
        }
        if (user) {
            return next(null, user)
        } else {
            return next(null, false, { message: "No user found" })
        }
    })
}))

passport.use('signup', new LocalStrategy((username, password, next) => {
    let data = {
        username: username,
        password: password
    }
    // create a user
    User
        .create(data)
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

passport.deserializeUser(function(id, next) {
    //MW
    User.findById(id, function(err, user) {
      next(err, user)
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

app.post('/', (req, res) => {
    let data = {
        username: req.body.username,
        password: req.body.password
    }
    res.render("nothome", data);
})

app.post('/signup', passport.authenticate("signup", {
    successRedirect: "/restricted",
    failureRedirect: "/"
}))


app.get('/restricted', (req, res) => {
    res.render("restricted", req.user)
})


app.listen(3000, () => {
    console.log("Started on 3000!")
})