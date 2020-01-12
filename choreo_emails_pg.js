const ejs = require('ejs');
const fs = require('fs');
const xlsx = require ('xlsx');
const axios = require('axios').default;
const nodemailer = require('nodemailer');
const inlineCss = require('inline-css');
const crypto = require('crypto');
const QRCode = require('qr-image')

const KEY_SECRET = 'y39ix1oC4VhsllPyOt2Uygi6'

var sent_mails = []

var rows = []


function getType(row){
    if(row.platinum != undefined && row.platinum != null && row.platinum != '')
        return 'Platinum Chair';
    else if(row.gold != undefined && row.gold != null && row.gold != '')
        return 'Gold Chair'
    else if(row.silver != undefined && row.silver != null && row.silver != '')
        return'Silver Chair'
    else
        return 'Gallery'
}   

function getNum(row){
    if(row.platinum != undefined && row.platinum != null && row.platinum != '')
        return row.platinum ;
    else if(row.gold != undefined && row.gold != null && row.gold != '')
        return row.gold
    else if(row.silver != undefined && row.silver != null && row.silver != '')
        return row.silver
    else
        return row.gallery
}   


function send_emails_rec(index){
    if(index >= rows.length){
        console.log('done')
        return
    }
    // var roll_num = rows[index].roll_num;
    // var name = rows[index].name;
    var email = rows[index].email;
    var order_id = rows[index].order_id;
    var hasura_id = rows[index].hasura_id;
    var payment_id = rows[index].payment_id;
    var signature = crypto.createHmac('SHA256', KEY_SECRET).update(order_id + '|' + payment_id).digest('hex')
    var saarang_id = 'SA20U' + hasura_id.toString().padStart(5, '0')

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saarang-proshows-10@saarang.org', /// CHANGE THIS
            pass: 'saarang123',
        }
    });
    

    var qr_png = QRCode.image(JSON.stringify({hasura_id:parseInt(hasura_id), signature:signature.toString()}), { type: 'png' });
    qr_png.pipe(fs.createWriteStream(__dirname + `/views/temp/${order_id}.png`));

    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/proshow_ticket.ejs', 'utf8'), {
       // roll_no: roll_num,
       saarang_id: saarang_id,
       order_id: order_id,
       num: rows[index].gallery != '' && rows[index].gallery != undefined && rows[index].gallery != null ? rows[index].gallery : rows[index].chair,
       type: getType(rows[index])
    });

    inlineCss(html_src, { url: ' ', applyTableAttributes: true })
        .then((html) => {
            transporter.sendMail(
                {
                    to: email,
                    from: 'Saarang 2020',
                    subject: 'Saarang 2020 Proshows ticket',
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
                        // console.log('Email sent to: ' + hasura_id);
                        // sent_mails.push(saarang_id)
                        // send_emails_rec(index + 1)
                    }
                    fs.unlink(__dirname + `/views/temp/${order_id}.png`, function (err) {
                        if (err) {throw err};
                        // if no error, file has been deleted successfully
                        console.log('Email sent to: ' + hasura_id);
                        sent_mails.push(saarang_id)
                        send_emails_rec(index + 1)
                        console.log('File deleted!');
                    });
                })
        }).catch(e=> console.log("Failed email: " + hasura_id));
}

var file = xlsx.readFile('Choreo.xlsx')
var sheetnames = file.SheetNames
rows = xlsx.utils.sheet_to_json(file.Sheets[sheetnames[0]])
// rows.forEach(row=>{
//     console.log(row.gallery != undefined ? 'Gallery' : 'Chair')
// })
// console.log(rows.gallery)
// console.log(rows)
send_emails_rec(0) // CHANGE THIS~+!!!!!

