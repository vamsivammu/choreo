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
    var roll_num = rows[index].roll_num;
    var name = rows[index].name;
    var email = roll_num.toLowerCase() + "@smail.iitm.ac.in"
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'saarang-proshows-5@saarang.org', /// CHANGE THISSS!!!!!!!
            pass: 'saarang123',
        }
    });
    
    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/ikollege.ejs', 'utf8'), {
       roll_no: roll_num,
       name: name,
       type: getType(rows[index])
    });

    inlineCss(html_src, { url: ' ', applyTableAttributes: true })
        .then((html) => {
            transporter.sendMail(
                {
                    to: email,
                    from: 'Saarang 2020',
                    subject: 'Updated Saarang 2020 Proshows ticket ' + roll_num,
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
        }).catch(e=> console.log("Failed email: " + roll_num));
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