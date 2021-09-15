const order = require("../../../models/order")
function statusController() {
    return {
        update(req,res) {
            order.updateOne({_id: req.body.orderId}, { status: req.body.status }, (err, data) => {
                
                if(err) {
                    return res.redirect('/admin/orders')
                }
                const eventEmitter = req.app.get('eventEmitter')
                eventEmitter.emit('orderUpdated', { id: req.body.orderId, status: req.body.status})
                res.redirect('/admin/orders')
            })
        }

    }
}

module.exports = statusController