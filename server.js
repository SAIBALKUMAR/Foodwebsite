require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const expressLayout = require('express-ejs-layouts') 
const PORT = process.env.PORT || 3300
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport')
const Emitter = require('events')
const util = require('util');
const TextEncoder = new util.TextEncoder();
var mongoose = require('mongoose');
//Set up default mongoose connection

mongoose.connect(process.env.MONGO_CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true});
//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));



//session configuration
const mongoStore = MongoDbStore.create({
  mongoUrl: process.env.MONGO_CONNECTION_URL,
  collectionName: "sessions",
});

const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)



app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    saveUninitialized: false,
    store: mongoStore,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, //cookie valid for 24 hours
  })
);

const passportInit = require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use(express.json())

app.use(express.urlencoded({ extended: false }))
app.use(flash())

app.use((req,res,next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()

})

app.use(express.static('public'))
app.use(expressLayout)
app.set('views', path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')


require('./routes/web')(app)
app.use((req,res) =>{
  res.status(404).render('errors')
})

const server = app.listen(PORT ,() => {
    console.log('Listening on port 3300')
})

const io = require('socket.io')(server)
io.on('connection',(socket) => {
    // Join 
    console.log(socket.id)
    socket.on('join', (orderId) =>{
      console.log(orderId)
      socket.join(orderId)

    })
})

eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) =>{
  io.to('adminRoom').emit('orderPlaced',data)
})