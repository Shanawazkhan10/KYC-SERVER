const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const axios = require('axios')
const app = express();
var multer  = require('multer')
var fs =require('fs')
const path = require('path');
var FormData = require('form-data');
// const base64_decode = require("base64_decode")
var router = express.Router();
//use cors to allow cross origin resource sharing
var auth = 'Basic ' + Buffer.from("AIY3H1XS5APT2EMFE54UWZ56IQ8FPKFP" + ':' + "GO75FW2YAZ6KQM3F1ZSGQVUQCZPXD6OF").toString('base64');
 // for BANK verify
   var axiosConfiguration = {
          headers: {
         "authorization":auth,
         'content-Type': 'application/json',
          }
        };

  var axiosConfigurationOrc = {
          headers: {
         "authorization":auth,
         'content-Type': 'multipart/form-data',
          }
        };
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);

// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
let books = [];
app.get('/home', function(req, res) {
  console.log('Inside Home Login');
  res.writeHead(200, {
    'Content-Type': 'application/json',
  });
  console.log('Books : ', JSON.stringify(books));
  res.end(JSON.stringify(books));
});

// PAN OCR
app.post('/panocr',function(req,res){

let base64String = req.body.front_part
let base64Image = base64String.split(';base64,').pop();
fs.writeFile('image.png', base64Image, {encoding: 'base64'}, function(err) {
});

fs.readFile('/image.png', (err, data) => {
  console.log(data)
 })
var content = fs.readFileSync('./image.png');
  const panocrdata ={
    front_part : content
  }
  axios.post('https://ext.digio.in:444/v3/client/kyc/analyze/file/idcard',panocrdata, axiosConfigurationOrc)
.then((res)=>{
  console.log("Response",res)
   console.log("SUCCESS ORC VERIFY")
          res.send(res)
})
.catch((err)=>{
  console.log('Error',err)
   console.log("Failed VERIFY")
          res.send(err)
})
 books.push(panocrdata)
})

// for bank
app.post('/bank',function(req,res){

   var dataTobank = {
        beneficiary_account_no: req.body.beneficiary_ifsc,
    beneficiary_ifsc: req.body.beneficiary_ifsc,
    // date_of_birth: req.body.date_of_birth,
        };
        axios.post('https://ext.digio.in:444/client/verify/bank_account', dataTobank, axiosConfiguration)
        .then((res) => {
          console.log("Response: ", res);
           console.log("SUCCESS BANK VERIFY")
          res.send(res)
         
        })
        .catch((err) => {
          console.log("error: ", err);
          console.log("FAILED BANK VERIFY")
          res.send(err)
        })
  books.push(dataTobank);


  // console.log(books);
})
app.post('/create', function(req, res) {

   var dataToPost = {
        pan_no: req.body.pan_no,
    full_name: req.body.full_name,
    date_of_birth: req.body.date_of_birth,
        };

        // for PAN verify
        axios.post('https://ext.digio.in:444/v3/client/kyc/pan/verify', dataToPost, axiosConfiguration)
        .then((res) => {
          console.log("Response: ", res);
           console.log("SUCCESS PAN VERIFY")
          res.send(res)
         
        })
        .catch((err) => {
          console.log("error: ", err);
          console.log("FAILED")
          res.send(err)
        })
  books.push(dataToPost);

});

//start your server on port 3001
app.listen(3001, () => {
  console.log('Server Listening on port 3001');
});