const Order = require('../../../models/order')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
function orderController () {
    return {
        store(req,res) { 
            
            const {phone, address, stripeToken, paymentType } = req.body
            if(phone == "" || address == "") {
              res.json({message:'All fields are important'});
              return res.redirect('/cart')
            }
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart.items,
                phone: phone,
                address: address,
                paymentType:paymentType,
                
                
            })
            
            order.save().then(result =>{
                Order.populate(result, { path: 'customerId'}, (err, placedOrder) =>{
                //req.flash('success','Order placed successfully')
                if (paymentType === 'card') {
                    stripe.charges.create({
                        amount: req.session.cart.totalPrice*100, 
                        source:  stripeToken,
                        currency: 'inr',
                        description: `Pizza order: ${placedOrder._id}`
                    }).then(() => {
                        placedOrder.paymentStatus = true;
                        placedOrder.save().then((ord) => {
                            const eventEmitter = req.app.get('eventEmitter')
                             eventEmitter.emit('orderPlaced', ord)
                             delete req.session.cart
                             return res.json({message:'Payment successfull. Order placed successfully'});
                        }).catch((err) =>{
                            console.log(err)

                        })
                    }).catch((err) => { 
                        delete req.session.cart
                        return res.json({message:'order placed but Payment failed. You can pay at delivery time'});
                    })

                }
                else {
                delete req.session.cart
                return res.json({message:'order placed successfully'})
                }
              
            })
            }).catch((err) => {
                return res.status(500).json({message:'Something went wrong'})
            })

        },
        async index(req,res) {
            const orders= await Order.find({

                 customerId: req.user._id},null,{sort: { 'createdAt': -1}})
                 
            res.render('customers/orders',{ orders: orders, moment: moment})

        },
        async show( req, res) {
            const order = await Order.findById(req.params.id)
            if(req.user._id.toString() === order.customerId.toString()) {
               return res.render('customers/singleOrder', { order })
            } 
            return res.redirect('/')

            },

        }
    }

module.exports = orderController