
const ejs = require('ejs');
const fs = require('fs');
const xlsx = require ('xlsx');
const axios = require('axios').default
const rzp = require('razorpay')
const nodemailer = require('nodemailer');
const inlineCss = require('inline-css');
const QUERY_URL = 'https://data.saarang.org/v1/query';
const AUTH_URL = 'https://auth.saarang.org/v1/user/info'
const ADMIN_TOKEN = "e76047282b717ef9925649b38d1d8498698bb5aa98379114";
const admin_headers={
    headers:{
        'Authorization':`Bearer ${ADMIN_TOKEN}`
    }
}
var sent_mails = []
function send_emails_rec(rows,index){
    if(index>=rows.length){
        console.log('done')
        return
    }
    var ticket_data = [{id:4,name:'Choreo Night',qtys:{Gallery:0,Chair:0},datetime:"2020-01-09T13:30:00+00:00"}]
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saarang-proshow-ticket@saarang.org',
            pass: 'saarang123'
        }
    });
    
    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/proshow_ticket.ejs', 'utf8'), {
        ticket_table_data: ticket_data,
        ticket_holder: email,
        saarang_id: roll_num,
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
                        console.log('Email sent: ' + info.response);
                    }
                    fs.unlink(__dirname + `/views/temp/${order_id}.png`, function (err) {
                        if (err) throw err;
                        // if no error, file has been deleted successfully
                        console.log('File deleted!');
                    });
                })
        });
}

var file = xlsx.readFile('Choreo.xlsx')
var sheetnames = file.SheetNames
sheetnames.forEach(sheet=>{
    var rows = xlsx.utils.sheet_to_json(file.Sheets[sheet])
    for(var i=0;i<rows.length;i++){
        var each_row = rows[i]
        
    }
})

