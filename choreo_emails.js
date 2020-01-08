const express = require('express');
const config = require('../config');
const sgMail = require('@sendgrid/mail');
const ejs = require('ejs');
const fetch = require('node-fetch');
const fs = require('fs');
const QRCode = require('qr-image');
const QRImage = require('qr-image')
const xlsx = require ('xlsx');
const cloudinary = require('cloudinary');
const axios = require('axios').default
const rzp = require('razorpay')
const nodemailer = require('nodemailer');
const inlineCss = require('inline-css');
const crypto = require('crypto');
const moment = require('moment')
const QUERY_URL = 'https://data.saarang.org/v1/query';
const AUTH_URL = 'https://auth.saarang.org/v1/user/info'
const ADMIN_TOKEN = "e76047282b717ef9925649b38d1d8498698bb5aa98379114";
const admin_headers={
    headers:{
        'Authorization':`Bearer ${ADMIN_TOKEN}`
    }
}
var sent_mails = []

var rows = []


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
            user: 'saarang-proshows-5@saarang.org',
            pass: 'saarang123',
        }
    });
    
    let html_src = ejs.render(fs.readFileSync(__dirname + '/views/ikollege.ejs', 'utf8'), {
       roll_num: roll_num,
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
rows = xlsx.utils.sheet_to_json(file.Sheets[sheetnames[0])
send_emails_rec(0)

