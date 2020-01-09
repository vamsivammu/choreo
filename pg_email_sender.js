const inlineCss = require('inline-css');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const ejs = require('ejs')
const axios = require('axios').default;
const fs = require('fs');
var QRCode = require('qr-image')
var query_url = 'https://data.saarang.org/v1/query'
const KEY_SECRET = 'Pve6vtrr7ihSHbHk4kYdy1jI'
const ADMIN_TOKEN = 'e76047282b717ef9925649b38d1d8498698bb5aa98379114'

var admin_headers = {
    headers:{
        'Authorization':`Bearer ${ADMIN_TOKEN}`,
        'X-Hasura-Role':'admin'
    }
}

var get_proshow_transactions = {
    "type": "select",
    "args": {
        "table": "proshow_ticket_transactions",
        "columns": ['hasura_id', 'order_id', 'payment_id', 'ticket_data'],
        "where": {
            "$and": [
                {
                    "payment_id": {
                        "$ne": null
                    }
                },
                {
                    "signature": {
                        "$ne": null
                    }
                },
                "confirmed": {
                    "$eq": 1
                }
            ]
        },
        "order_by": [
            {
                "column": "hasura_id",
                "order": "asc"
            },
            {
                "column": "payment_id",
                "order": "asc"
            }
        ],
        "limit": 100,
        "offset": 0
    }
}
var hasura_id_email={}
var hasura_ids=[]
var actual_data=[]
function get_num(obj){
    var sum=0
    Object.keys(obj).forEach(ob=>{
        sum =sum+ obj[ob]
    })
    if(sum>0){
        return true
    }else{
        return false
    }
}
function start_sending_emails(index){

    var hasura_id = actual_data[index].hasura_id
    var email = hasura_id_email[hasura_id.toString()]
    var ticket_data = actual_data[index].ticket_data
    var payment_id = actual_data[index].payment_id
    var order_id = actual_data[index].order_id
    
    var signature = crypto.createHmac('SHA256', KEY_SECRET).update(order_id + '|' + payment_id).digest('hex')
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saarang-proshow-ticket@saarang.org',
            pass: 'saarang123'
        }
    });
    console.log(signature)
    if(!email.includes("@")){
        console.log('email doesnt contain @: '+ hasura_id.toString())
        start_sending_emails(index+1)
        return
    }
    var qr_png = QRCode.image({hasura_id:hasura_id, signature:signature.toString()}, { type: 'png' });
    qr_png.pipe(fs.createWriteStream(__dirname + `/views/temp/${order_id}.png`));
    
    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/proshow_ticket.ejs', 'utf8'), {
        ticket_table_data: ticket_data,
        ticket_holder: email,
        saarang_id: 'SA20U' + String(hasura_id).padStart(5, '0'),
        order_id: order_id
    });

    inlineCss(html_src, { url: ' ', applyTableAttributes: true })
        .then((html) => {
            transporter.sendMail(
                {
                    to: email,
                    from: 'Saarang 2020',
                    subject: 'Saarang 2020 Proshows ticket ' + order_id,
                    html: html,
                    attachments: [
                        {
                            filename: 'logo.png',
                            path: __dirname + '/views/logo.png',
                            cid: 'logo@saarang'
                        },
                        {
                            filename: `${order_id}.png`,
                            path: __dirname + `/views/temp/${order_id}.png`,
                            cid: 'qrcode@saarang'
                        }
                    ]
                },
                function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + email + ' '+ hasura_id.toString());
                        start_sending_emails(index+1)
                    }
                    fs.unlink(__dirname + `/views/temp/${order_id}.png`, function (err) {
                        if (err) {throw err};
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    });
                })
        });
}
function get_and_store_emails(index){
    if(index>=Object.keys(hasura_id_email).length){
        start_sending_emails(0)
        return
    }else{

        axios.get(`https://auth.guideline52.hasura-app.io/v1/admin/user/${hasura_ids[index]}`,admin_headers).then(r1=>{
            var email = r1.data.email
            hasura_id_email[hasura_ids[index]] = email
            get_and_store_emails(index+1)
        }).catch(e=>{
            console.log("error getting user email")
        })

    }
}
axios.post(query_url,get_proshow_transactions,admin_headers).then(r=>{
    var data = r.data

    for(var i=0;i<data.length;i++){
        var ticket_data = data[i].ticket_data
        
        for(var j=0;j<ticket_data.length;j++){
            if(ticket_data[j].name=='Choreo Night' && get_num(ticket_data[j].qtys)){
                actual_data.push({ticket_data:[ticket_data[j]],hasura_id:data[i].hasura_id,payment_id:data[i].payment_id,order_id:data[i].order_id})
                hasura_id_email[data[i].hasura_id.toString()]=''
                break
            }
        }
    }

    hasura_ids = Object.keys(hasura_id_email)
    get_and_store_emails(0)
})

