
var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var { matchedData, sBody } = require('express-validator');
var { check, validationResult } = require('express-validator');
var Cryptr = require('cryptr');
var cryptr = new Cryptr('myTotalSecretKey');
// var bcrypt = require('bcryptjs');
    var sRole = require('../modules/sRole');   
    var sDept = require('../modules/sDept');
    var sRegister = require('../modules/sRegister');

     var router = express.Router();

     function checkLogin (req, res, next){
   var userToken = localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
       res.redirect('/')
  }  next();
}

if(typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

// -----------------------------------------------
          var getRole, getDept, getEmployee;
    function fetchRole() {
      sRole.find({}).exec(function(err, data) {
                if(err)  throw err;
                getRole = data;     
      });
    }
    function fetchDept() {
      sDept.find({}).exec(function(err, data) {
                if(err)  throw err;
                getDept = data;     
      });
    }
    function fetchEmployee() {
      sRegister.find({}).exec(function(err, data){ 
                if(err)  throw err;
               getEmployee = data;     
      }); 
    }   fetchEmployee(); 

        // ------------- ADD EMPLOYEE -------------------
router.get ('/', checkLogin, function(req, res, next) {   
       var loginUser = localStorage.getItem('loginUser'); 
                fetchRole();
                fetchDept();
                fetchEmployee();
     res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg: '', db_msg: '', vData:''});
}); 
 router.post('/', [ check('id', "Enter Number please").isNumeric().isLength({ min: 1 }),                  
                  check('name', "Characters are alloewd only").trim().not().isNumeric(),
                  check('email').isEmail(),
                  check('phone', "Enter 10 Integer at Least").isNumeric().isLength({min:10}),
                 /* check('jdate', ""), check('pass', ""), check('cpass', ""), 
                  check('dept', "")   */               
                ],
    function(req, res, next) {   
     var loginUser = localStorage.getItem('loginUser');
             fetchRole();
             fetchDept();
             fetchEmployee();

     const result = validationResult(req);   //console.log(result)

    const validData = { Id:req.body.id,  Name:req.body.name,
                         Email:req.body.email,  Phone:req.body.phone,
                         Pass:req.body.pass,   cPass:req.body.cpass,
                         JoinDate:req.body.jdate,  Role:req.body.role,
                         Dept:req.body.dept,  Status:req.body.status,
                      }; //console.log(req.body.jdate);
       
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
             res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                   ad_msg:'', db_msg:message, vData:validData});
     }
       else if (!result.isEmpty()) {  
                   res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                   ad_msg:result.mapped(), db_msg: '', vData:validData});
      } 
        else if(req.body.pass != req.body.cpass){  
             message = "Password Not Mached !";
             res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg:'', db_msg: message, vData:validData});  
      } 
       else {   
            sRegister.findOne({Id:req.body.id}).exec(function(err, data) {
              if(data !== null) { 
                  message = "Id Exists Already !"; 
                  res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg:'', db_msg:message,  vData:validData});
              } else { 
               // var loginUser = localStorage.getItem('loginUser');
                  sRegister.findOne({Email:req.body.email}).exec(function(err, data) {
                     if(data !== null) { 
                        message = "Email Exists Already !"; 
                        res.render('addEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                                     ad_msg:'', db_msg:message, vData:validData});
                     } else {
                          // var cryptPass = bcrypt.hashSync(req.body.pass, 10);   // salt = 10 
                             var encryptPass = cryptr.encrypt(req.body.pass);  
                           var insertedEmployee = new sRegister({
                                          Id: req.body.id,
                                          Name: req.body.name,
                                          Email: req.body.email,    
                                          Password: encryptPass,
                                          Phone: req.body.phone,     
                                          Role: req.body.role,
                                          Department: req.body.dept,
                                          JoinDate: req.body.jdate,
                                          Status: req.body.status,
                                          CreatedDate: Date(),
                                           CreatedBy: loginUser 
                                      }); // res.send(req.body.phone);
  
                          insertedEmployee.save((err, doc) => {  
                              if(doc){
                                 message = "inserted successfully";
                                res.render('addEmployee', {user:loginUser, get_dept:getDept, 
                                     ad_msg: '', get_role:getRole , db_msg:message, vData:''});
                                  
                                  fetchEmployee();
                                }
                          });           
                        }     
                  });
                }
            });
       }
});

// -------------------------- view Employee ----------------
router.get ('/viewEmployee', checkLogin, function(req, res, next){  // res.send("ok")
            fetchEmployee(); 
   var loginUser = localStorage.getItem('loginUser');
            //  fetchEmployee();  fetchRole();   fetchDept();
          var employeeId = req.params.id;
             var eDelete = sRegister.deleteOne({_id: employeeId});
                 eDelete.exec(function(err){
                    if(err)  throw err;
                  });       
                res.render('viewEmployee', {user:loginUser, get_employee:getEmployee,  msg:''});  
               
});

// -------------------------------
router.get ('/viewEmployee/delete/:id', checkLogin, function(req, res, next) {  
          var loginUser = localStorage.getItem('loginUser');  //res.end("ok"); 
             var employeeId = req.params.id;
             var eDelete = sRegister.deleteOne({_id: employeeId,});
                 eDelete.exec(function(err){
                    if(err)  throw err; 
             });
                  fetchEmployee(); 
              res.redirect('/addEmployee/viewEmployee');         
    });

// ----------------------- 
       var employeeId, decryptPass, encryptPass, dbId, dbEmail, getEmp;
  router.get ('/viewEmployee/edit/:id', checkLogin, function(req, res, next) {   
          var loginUser = localStorage.getItem('loginUser');  
          fetchEmployee();  fetchRole();   fetchDept();   
           employeeId = req.params.id; 
      
        sRegister.findOne({_id:employeeId}).exec(function(err, data){
               if(data){
                getEmp = data;
                dbId = data.Id;
                dbEmail = data.Email;
                 encryptPass = data.Password; 
              } 
              //  return (getEmp+dbId+dbEmail+encryptPass);
               res.render('updateEmployee', {user:loginUser, get_employee:getEmp, db_msg:'',
                          ad_msg:'', get_role:getRole, get_dept:getDept, msg:'', ID:dbId,
                         Pass:cryptr.decrypt(encryptPass), vData:'', uiPass:'' }); 
           }); 
  });

   // var upPass, uData;   
 router.post('/viewEmployee/edit/',  
                [ // check('id', "Enter Number please").isNumeric().isLength({ min: 1 }),                  
                  check('name', "Characters are alloewd only").trim().not().isNumeric(),
                  check('email').isEmail(),
                  check('mobile', "Enter 10 Integer at Least").isNumeric().isLength({min:10}),                
                ],
    function(req, res, next) {   // console.log(getEmp); 
      var loginUser = localStorage.getItem('loginUser'); 
      const result = validationResult(req);
       
    var uData = { Pass:req.body.pass,  cPass:req.body.cpass };
    var upData = { _id:employeeId, Id:dbId,  
                   Name:req.body.name,  Email:req.body.email,  
                   Phone:req.body.mobile,  Dept:req.body.dept, 
                   Role:req.body.role,    Status:req.body.status,
                   Password:cryptr.encrypt(req.body.pass), 
                   ModifiedBy:loginUser,  ModifiedDate:new Date()
                };  

          function renderPage(){
                   res.render('updateEmployee', {user:loginUser, get_dept:getDept,
                           get_role:getRole, get_employee:getEmployee,  ad_msg:'',
                           db_msg:message, vData:upData, uiPass:uData, ID:dbId });
          }
          function funUpdate(){
            var update = sRegister.save(upData);
                 update.exec(function(err, doc) { if(doc) { 
                            message = "Records Updated successfully"; renderPage(); }
                  });
          }
    if (!result.isEmpty()) {  
                  const validData = matchedData(req);
                   res.render('updateEmployee', {user:loginUser, get_dept:getDept, get_role:getRole,
                      get_employee:getEmployee, ad_msg:result.mapped(), vData:upData, db_msg:'',
                      uiPass:uData, ID:dbId });
  } 
   else if(req.body.pass != req.body.cpass){   
             message = "Password Not Mached !";
              renderPage();
  } 
   else {    // console.log(req.body.pass);   console.log(cryptr.encrypt(req.body.pass));
     sRegister.findOne({Email: req.body.email}).exec(function(err, data){  
       if(data !== null){
          if(req.body.email !== dbEmail) { message = "Email Already Exists";  renderPage(); }
           else {  
              update = sRegister.updateOne({_id:employeeId}, upData);
                 update.exec(function(err, doc) { 
                       if(doc) { //fetchEmployee();
                            
                            res.render('viewEmployee', {user:loginUser, get_employee:getEmployee,
                              msg:"ID "+dbId+" have been updated"});
                        }     
                  });
            } 
       } else { // res.send(updata);
            update = sRegister.updateOne({_id:employeeId}, upData);   
              update.exec(function(err, doc) { 
                       if(doc) { fetchEmployee();
                            //message = "Records Updated successfully"; 
                            res.render('viewEmployee', {user:loginUser, get_employee:getEmployee,
                              msg:"ID "+dbId+" have been updated"});
                        }     
                  });
       }

          
     });
   } 
  });      
module.exports = router; 

 
     
 