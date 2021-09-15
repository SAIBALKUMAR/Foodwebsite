const order = require("../../../models/order")

function AdminOrderController() {
    return {
        index( req,res) {
            order.find({status: { $ne: 'completed'}},null,{ sort: {'dateTime':-1}}).populate('customerId','-password').exec((err, orders) => {
                if(req.xhr) {
                   return res.json(orders)
                }
                res.render('admin/orders')
            })
        }
    }
}
module.exports = AdminOrderController