const ejs = require('ejs');
const fs = require('fs');
const xlsx = require ('xlsx');
const axios = require('axios').default;
const nodemailer = require('nodemailer');
const inlineCss = require('inline-css');

var sent_mails = []

var rows = []


function send_emails_rec(index){
    if(index >= rows.length){
        console.log('done')
        return
    }
    var roll_num = rows[index].roll_num;
    var name = roll_num.split("@")[0];
    var email = roll_num.toLowerCase()
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saarang-proshows-5@saarang.org',
            pass: 'saarang123',
        }
    });
    
    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/ikollege.ejs', 'utf8'), {
       roll_no: roll_num,
       name: name,
       type: 'Gallery'
    });

    inlineCss(html_src, { url: ' ', applyTableAttributes: true })
        .then((html) => {
            transporter.sendMail(
                {
                    to: email,
                    from: 'Saarang 2020',
                    subject: 'Saarang 2020 Proshows ticket ' + roll_num,
                    html: html
                },
                function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent to: ' + roll_num);
                        sent_mails.push(roll_num)
                        send_emails_rec(index + 1)
                    }
                })
        });
}

var file = xlsx.readFile('Choreo.xlsx')
var sheetnames = file.SheetNames
rows = xlsx.utils.sheet_to_json(file.Sheets[sheetnames[0]])
// console.log(rows)
send_emails_rec(0)

