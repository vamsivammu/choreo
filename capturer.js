const crypto = require('crypto')
const axios = require('axios')

const admin = {
	headers: {
		'Content-Type': 'application/json'
		'Authorization': 'Bearer bae7eda08141d3ac455f59d69a5c24d6ba7d896ec4bde935'
	}
}



var order_id = 'order_E31tRBKjS0ECwd'
var payment_id = 'pay_E2gREfINkr82Jt'
var signature = crypto.createHmac('SHA256', KEY_SECRET).update(order_id + '|' + payment_id).digest('hex')

var body = {
	order_id: order_id,
	payment_id: payment_id,
	signature: signature
}

axios.post('https://api.saarang.org/sales/aep-capture', body, admin).then(r=>{
	console.log(200)
})
.catch(e=>{
	console.log(e.message)
})