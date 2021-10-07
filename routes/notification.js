 var express = require('express');
var bodyParser = require('body-parser');

var sLeave = require('../modules/sLeave');

//var empDash = require('./employeeDashboard.js')
var router = express.Router();

if (typeof localStorage === "undefined" || localStorage === null) {
      var LocalStorage = require('node-localstorage').LocalStorage;
          localStorage = new LocalStorage('./scratch');
  }

      function checkLogin (req, res, next){
     var userToken = localStorage.getItem('userToken');
   try { var decoded = jwt.verify(userToken, 'loginToken'); } 
   catch(err) { res.redirect('/') }  
     next();
}   var loginUser = localStorage.getItem('loginUser');

// ------------
 router.get ('/', function(req, res, next) { 
   var loginUser = localStorage.getItem('loginUser');
   sLeave.find().sort({Sort_Date: -1}).exec((err, doc) => {
   	  if(doc) //res.send(doc);
   	  res.render('notification', {user:loginUser, Leave:doc});
   });
 }); 
 
   router.post ('/approve', function(req, res, next) { 
    // var loginUser = localStorage.getItem('loginUser'); 
     sLeave.updateOne({_id:req.body.empId},{$set:{Response:"Approve", Response_Date:new Date()}})
           .exec(function(err, doc){ });
      res.redirect('/notification');

   });
   router.post ('/cancel', function(req, res, next) { 
    // var loginUser = localStorage.getItem('loginUser');
     sLeave.updateOne({_id:req.body.empId},{$set:{Response:"Cancel", Response_Date:new Date()}})
                   .exec(function(err, doc){ });
      res.redirect('/notification');

   });
 // ----------
 module.exports = router;