const ejs = require('ejs');
const fs = require('fs');
const xlsx = require ('xlsx');
const axios = require('axios').default;
const nodemailer = require('nodemailer');
const inlineCss = require('inline-css');

var sent_mails = []

var rows = []


function getType(row){
    if(row.fan_pass != undefined && row.fan_pass != null && row.fan_pass != '')
        return 'Fan Pass';
    else if(row.bowl != undefined && row.bowl != null && row.bowl != '')
        return 'Bowl'
    else 
        return 'Gallery'
}   

function send_emails_rec(index){
    if(index >= rows.length){
        console.log('done')
        return
    }
    var saarang_id = rows[index].saarang_id;
    var email = rows[index].email;
    var name = rows[index].name;
    // var email = roll_num.toLowerCase() + "@smail.iitm.ac.in"
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saarang-proshows-5@saarang.org', /// CHANGE THISSS!!!!!!!
            pass: 'saarang123',
        }
    });
    
    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/onground_hospi.ejs', 'utf8'), {
       saarang_id: saarang_id,
       name: name,
       type: getType(rows[index])
    });

    inlineCss(html_src, { url: ' ', applyTableAttributes: true })
        .then((html) => {
            transporter.sendMail(
                {
                    to: email,
                    from: 'Saarang 2020',
                    subject: 'Saarang 2020 Proshows ticket ' + name,
                    html: html
                },
                function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent to: ' + email);
                        sent_mails.push(email)
                        send_emails_rec(index + 1)
                    }
                })
        }).catch(e=> console.log("Failed email: " + email));
}

var file = xlsx.readFile('Choreo.xlsx') ///TODOOOOOO: CHange this
var sheetnames = file.SheetNames
rows = xlsx.utils.sheet_to_json(file.Sheets[sheetnames[0]])
// rows.forEach(row=>{
//     console.log(row.gallery != undefined ? 'Gallery' : 'Chair')
// })
// console.log(rows.gallery)
// console.log(rows)
send_emails_rec(0)