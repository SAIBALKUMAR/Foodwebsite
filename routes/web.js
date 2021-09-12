const homecontroller= require('../app/http/controllers/homeController')
const authcontroller= require('../app/http/controllers/authController')
const cartController = require('../app/http/controllers/customers/cartController')

function initroutes(app){
    app.get('/', homecontroller().index)
    app.get('/cart',cartController().index)
    app.get('/login',authcontroller().login)
    app.get('/register',authcontroller().register) 
    app.post('/update-cart',cartController().update)
}
module.exports = initroutes