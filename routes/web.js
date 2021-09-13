const homecontroller= require('../app/http/controllers/homeController')
const authcontroller= require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')
const guest = require('../app/http/middleware/guest')
function initroutes(app){
    app.get('/', homecontroller().index)
    app.get('/login', guest,authcontroller().login)
    app.post('/login', authcontroller().postLogin)
    app.get('/register', guest, authcontroller().register) 
    app.post('/register',authcontroller().postregister)
    app.post('/logout',authcontroller().logout)
    app.get('/cart',cartController().index)
    app.post('/update-cart',cartController().update)
    
}
module.exports = initroutes