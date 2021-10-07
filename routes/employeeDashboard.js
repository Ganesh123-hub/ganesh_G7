var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var { matchedData, sBody } = require('express-validator');
var { check, validationResult } = require('express-validator');

 var sLeave = require('../modules/sLeave');
 var sRegister = require('../modules/sRegister'); 

var router = express.Router();

 function checkLogin (req, res, next){
     var userToken = localStorage.getItem('userToken');
   try { var decoded = jwt.verify(userToken, 'loginToken'); } 
   catch(err) { res.redirect('/employeeDashboard') }  
    // next();
} 

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch'); 
} 

  var idRegexp = /^[a-zA-Z]+[0-9]+$/;
  
// ----------------------------------
    router.get ('/', function(req, res, next) { 
       var loginUser = localStorage.getItem('loginUser'); 
       var loginUserId = localStorage.getItem('loginUserId');
       sRegister.findOne({Id:loginUserId}).exec(function(err, dt){
          if(dt)  res.render('employeeDashboard', {user:loginUser, Data:dt});
       });
   });

   router.get ('/create', function(req, res, next) { 
       var loginUser = localStorage.getItem('loginUser'); 
       var loginUserId = localStorage.getItem('loginUserId');        
       sRegister.findOne({Id:loginUserId}).exec(function(err, dt){
           if(dt)  res.render('leaveForm', {user:loginUser, db_msg:'', vData:'', Data:dt});
       }); 
  });  
   router.post ('/leave', function(req, res, next){ 
    var loginUser = localStorage.getItem('loginUser');
    var loginUserId = localStorage.getItem('loginUserId');
    var loginUserEmail = localStorage.getItem('loginUserEmail');
    var leaveFormDetails = {   Id:req.body.id,
                     eId:loginUserId,  Name:loginUser,
                    Email:loginUserEmail, Reason:req.body.reason,
                    Sdate:req.body.sdate, Edate:req.body.edate,
                    FormDate:new Date(), Response: "Applied",
                    Sort_Date: new Date()
               }; //res.send(leaveFormDetails);

     sLeave.findOne({Id:req.body.id}).exec(function(err, dt){        
       if(!(req.body.id).match(idRegexp)){ 
            res.render('leaveForm', {user:loginUser, vData:leaveFormDetails, Data:dt,
                                    db_msg:"Id must contains alpha and then number only"});
        }   
        else if(dt !== null){
            res.render('leaveForm', {user:loginUser, vData:leaveFormDetails,
                                    Data:dt, db_msg:"Id Exists Already !"});
         } else {
              var insertedleaveFormDetails = new sLeave(leaveFormDetails);
                   insertedleaveFormDetails.save((err, doc) => { 
                       if(err)  throw err;   
                         res.redirect('/employeeDashboard/view');
                   });  
            }
     });     
   });

// ---------------------------
router.get ('/view', function(req, res, next) { //console.log(empDt);
       var loginUser = localStorage.getItem('loginUser');
       var loginUserId = localStorage.getItem('loginUserId');
       var perPage = 7;  
       var page = req.params.page || 1; 
        sRegister.findOne({Id:loginUserId}).exec(function(err, dt){ 
         sLeave.find({eId:loginUserId}).skip((perPage*page)-perPage).limit(perPage)
               .sort({ Sort_Date:-1, Response_Date:-1}).exec(function(err, pageData){
                   if(err) throw err;
              sLeave.countDocuments({Id:loginUserId}).exec((err, count) => {
                   if(err) throw err;
                  res.render('viewLeaves', {user:loginUser, Leaves:pageData, Data:dt, msg:'',
                       cirrent:page, totalPages:Math.ceil(count/perPage) });
              })
          }); 
        });
     });  

// -----------------
 router.get ('/view/delete/:id', function(req, res, next) {
   var loginUser = localStorage.getItem('loginUser');
    var loginUserId = localStorage.getItem('loginUserId');
   var employeeId = req.params.id; 
      sLeave.deleteOne({_id: employeeId}).exec(function(err){
              if(err)  throw err; 
     });
         res.redirect('/employeeDashboard/view');
 }); 

// -----------
 var employeeId;
 router.get ('/view/edit/:id', function(req, res, next) {
    var loginUser = localStorage.getItem('loginUser');
    var loginUserId = localStorage.getItem('loginUserId');
     employeeId = req.params.id;
    sRegister.findOne({Id:loginUserId}).exec(function(err, dt){ //console.log(dt.Name);
    sLeave.findOne({_id: employeeId}).exec(function(err, doc){ //console.log(doc.FormDate);
              if(err)  throw err; 

  // fetch Sdate from datbase and set into input field
    var sDbDate = new Date(doc.Sdate);
       var syyyy = sDbDate.getFullYear();
        var sm = sDbDate.getMonth();
        var sd = sDbDate.getDate();

  var sRealMonth = sm + 1;
    if(sRealMonth<10) var smm = ("0"+sRealMonth); 
    else var smm =(realMonth);

   if(sd<10) var sdd = ("0"+sd); 
    else var sdd =(sd);

var stDate = (syyyy+"-"+smm+"-"+sdd);  //console.log(stDate);
 
// fetch Edate from datbase and set into input field
 var eDbDate = new Date(doc.Edate);
       var eyyyy = eDbDate.getFullYear();
        var em = eDbDate.getMonth();
        var ed = eDbDate.getDate();

  var eRealMonth = em + 1;
    if(eRealMonth<10) var emm = ("0"+eRealMonth); 
    else var emm =(eRealMonth);

   if(sd<10) var edd = ("0"+ed); 
    else var edd =(ed);

var endDate = (eyyyy+"-"+emm+"-"+edd);  // console.log(endDate);

        res.render('leaveUpdate', {user:loginUser, Data:dt, fData:doc, vData:'', 
                                   sDbDate:stDate, eDbDate:endDate, });
             
    }); });
 });

 // -----------
 router.post ('/edit/', function(req, res, next) { //res.send("Edited");
    var loginUser = localStorage.getItem('loginUser');
    var loginUserId = localStorage.getItem('loginUserId');
  
    var upData = {Sdate:req.body.sdate, Edate:req.body.edate, 
                  Reason:req.body.reason, ModifiedDate:new Date(),
                  Sort_Date: new Date()};  
    sRegister.findOne({Id:loginUserId}).exec(function(err, dt){ 
    sLeave.updateOne({_id:employeeId}, upData).exec(function(err, doc){
              if(err)  throw err;
                 res.redirect('/employeeDashboard/view');
             // res.render('leaveUpdate', {user:loginUser, Data:dt, fData:'', vData:'', 
               //                    sDbDate:'', eDbDate:''});
    });  });
 });
module.exports = router; 
