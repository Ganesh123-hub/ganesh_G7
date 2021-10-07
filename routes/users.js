/*var express = require('express');
var router = express.Router();

// GET users listing. 
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;
*/


var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');
var cryptr = require('cryptr');
var jwt = require('jsonwebtoken');
var { matchedData, sBody } = require('express-validator');
var { check, validationResult } = require('express-validator');

    var sRole = require('../modules/sRole');   
    var sDept = require('../modules/sDept');
    var sRegister= require('../modules/sRegister');

     var router = express.Router();

     function checkLogin (req, res, next){
   var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
       res.redirect('/')
  }  next();
}


if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

// ------------- ADD EMPLOYEE -------------------
router.get ('/addEmployee', checkLogin, function(req, res, next) {  
         var loginUser = localStorage.getItem('loginUser'); 
         
     res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg: '', db_msg: '', vData:''});
}); 

router.post('/addEmployee', 
                [ check('id', "Enter Number please").isNumeric().isLength({ min: 1 }),
                  
                  check('name', "").trim(),
                  check('email').isEmail(),
                  check('mobile', "Enter 10 Integer at Least").isNumeric().isLength({min:10}),
                  check('date', ""), check('pass', ""), check('cpass', ""), 
                  check('dept', "")                  
                ],
    function(req, res, next) {   
     var loginUser = localStorage.getItem('loginUser');
     sRole.find({}).exec(function(err, data) {
                if(err)  throw err;
                getRole = data;     
          }); 
       
          sDept.find({}).exec(function(err, data) {
                if(err)  throw err;
                getDept = data;     
          });
     const result = validationResult(req);   //console.log(result)

     const validData = { id: req.body.id, name: req.body.name,
                         email: req.body.email, mobile: req.body.mobile,
                         pass: req.body.pass,  cpass: req.body.cpass,
                         date: req.body.date, role: req.body.role,
                         dept: req.body.dept, status: req.body.status,
                      }; //console.log(validData);
       
      if( req.body.id == '' || req.body.name == '' || req.body.date == ''
         || req.body.email == '' || req.body.mobile == ''  
         || req.body.pass == '' || req.body.cpass == '') {
               message = "All Fields are Required !";

               res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                   ad_msg:'', db_msg: message, vData:validData});      
     } 
     else if(req.body.dept=="SELECT" || req.body.role=="SELECT"
                    || req.body.status=="SELECT") {
           message = "Please Select All Fields !";
        console.log(req.body.role);
             res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                   ad_msg:'', db_msg: message, vData:validData});
     }
       else if (!result.isEmpty()) {  
                  const validData = matchedData(req);
                   res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                   ad_msg:result.mapped(), db_msg: '', vData:validData });
      } 
        else if(req.body.pass != req.body.cpass){  
             message = "Password Not Mached !";
           const validData = matchedData(req);
             res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg:'', db_msg: message, vData:validData});  
    } 
       else {   //res.send("ok"); }
           // var loginUser = localStorage.getItem('loginUser');
            sRegister.findOne({Id:req.body.id}).exec(function(err, data) {
              if(data !== null) { 
                  message = "Id Exists Already !"; 
                  res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg:'', db_msg:message, vData:'', vData:validData});
              } else { 
               // var loginUser = localStorage.getItem('loginUser');
                  sRegister.findOne({Email:req.body.email}).exec(function(err, data) {
                     if(data !== null) { 
                        message = "Email Exists Already !"; 
                        res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg:'', db_msg:message, vData:'', vData:validData});
                     } else {
                           var cryptPass = bcrypt.hashSync(req.body.pass, 10);   // salt = 10   
                           var insertedEmployee = new sRegister({
                                          Id: req.body.id,
                                          Name: req.body.name,
                                          Email: req.body.email,    
                                          Password: cryptPass,
                                          Mobile: req.body.mobile,     
                                          Role: req.body.role,
                                          Department: req.body.dept,
                                          JoinDate: req.body.jdate,
                                          Status: req.body.status,
                                          CreatedDate: Date(),
                                           CreatedBy: loginUser 
                                      });  res.send(insertedEmployee);
  
               /*   insertedEmployee.save((err, doc) => { 
                        if(doc)  message = "inserted successfully";
                        //console.log("inserted")
                         res.render('addEmployee', {user:loginUser, get_dept:getDept, 
                                   get_role:getRole , db_msg: '', vData:''});
                    }); */
                }
                  });
                }
            });
       }
}); 
 
  // --------- VIEW EMPLOYEE --------------------    
/* router.get ('/viewEmployee', checkLogin, function(req, res, next) {  
         var loginUser = localStorage.getItem('loginUser');
         
         sDept.find({}).exec(function(err, data) {
                if(err)  throw err;
                 getEmployee = data;     
          }); // res.redirect('/viewRole'); 
         var employeeId = req.params.id;
             var eDelete = sRegister.remove({_id: deptId});
                 eDelete.exec(function(err){
                    if(err)  throw err;  
             });
        res.render('viewEmployee', {user:loginUser, get_employee:getEmployee});
});   */  

module.exports = router; 