const express = require("express")
const mustacheExpress = require("mustache-express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const User = require('./models/user')

mongoose.connect("mongodb://localhost/sampleApp", () => {
    console.log("connected to the mongod!!!!")
}); 

const app = express()


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

app.post('/signup', (req,res) =>{
    let data = {
        username: req.body.username,
        password: req.body.password
    }
    // create a user
     User
      .create(data)
      .then(doc => {
          // save to database
          res.render("nothome")
      })
      .catch(err => res.json(err))

})


app.listen(3000, () => {
    console.log("Started on 3000!")
})