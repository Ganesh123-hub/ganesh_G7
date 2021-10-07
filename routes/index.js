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
    var sRegister= require('../modules/sRegister');

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

     // ------------- LOGIN PAGE ----------------
router.get ('/', function(req, res, next) { 
  var loginUser = localStorage.getItem('loginUser')
    if(loginUser) { //res.redirect('/header');
         if(localStorage.getItem('loginUserRole') =='hr') 
                  res.redirect('/header');
         else if(localStorage.getItem('loginUserRole') =='employee') 
                  res.redirect('/employeeDashboard');
    }
      else res.render('index', { lmsg:'', id:'', pass:'' });
});
router.post ('/index', function(req, res, next) {  
  var existUser = sRegister.findOne({Email: req.body.email});  
      existUser.exec((err, doc) => {    
           if(err)  throw err;   
                      
           else if (req.body.email === '' || req.body.pwd === '')  {               
                            res.render('index', { lmsg: 'Input all Fields',
                                  id: req.body.email, pass: req.body.pwd });
          }
           else if (doc === null) {
                          res.render('index', { lmsg: 'Invalid Id or Password',
                                    id: req.body.email, pass: req.body.pwd }); 
          }  
            else if(req.body.pwd === cryptr.decrypt(doc.Password)) {
                     var token = jwt.sign({ userID: doc._id }, 'loginToken');
                     localStorage.setItem('userToken', token);
                     localStorage.setItem('loginUser', doc.Name);  
                     localStorage.setItem('loginUserId', doc.Id);
                     localStorage.setItem('loginUserRole', doc.Role);
                     localStorage.setItem('loginUserEmail', doc.Email);  
                       
                       if(doc.Role === 'hr')   res.redirect('/header'); 
                        else if(doc.Role ==='employee')  
                          res.redirect('/employeeDashboard')
                       /*else {
                            var ln = 'unkown Login';  
                            res.render('index', { lmsg:ln, id:'', pass:'' });
                         }*/
          } 
           else { 
                res.render('index', { lmsg: 'Invalid Id or Password',
                              id: req.body.email, pass: req.body.pwd });
           }
              
      });           
});

//--------------------------------------------
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
      sRegister.find({}).exec(function(err, data) { 
                if(err)  throw err;
               getEmployee = data;     
      });
    }

// ----------------- Get Header Page on Login --------------------------
      router.get ('/header', checkLogin,  function(req, res, next) { 
           var loginUser = localStorage.getItem('loginUser');
            res.render('header', {user: loginUser, get_role:getRole, 
                                  get_dept:getDept, get_employee:getEmployee}); 
      });

// =========== ADD ROLE ================
  router.get ('/addRole', checkLogin, function(req, res, next) {  
     res.render('addRole', {user:loginUser, get_role:'', db_msg: '', ad_msg: ''});
 });
  router.post ('/addRole', 
                [check('role1',"Role is required").not().isEmpty(),
                 check('role1',"Enter Character please").trim().isAlpha(),
                ], 
                 function(req, res, next) { 
   var loginUser = localStorage.getItem('loginUser');
   var rr = (req.body.role1).toLowerCase();
   const errors = validationResult(req);
   if (!errors.isEmpty()) 
          res.render('addRole', { ad_msg:errors.mapped(), user:loginUser, db_msg:'' });

     else if(rr) {
          var loginUser = localStorage.getItem('loginUser');
          var existRole = sRole.findOne({Role: rr });
          existRole.exec((err, eRole)=>{
               if (eRole){ message = "Role Already Exist"; 
                     res.render('addRole', { db_msg: message, user: loginUser, ad_msg: '' }); 
              }
                 else {     
                       var insertedRole = new sRole({ Role: rr }); 
                           insertedRole.save((err, doc) => { 
                                if(doc) {
                                   message = "inserted successfully";
                                   res.render('addRole', {db_msg:message, user:loginUser, ad_msg:''}); 
                                    
                                    fetchRole();
                                }
                          });  
                 }  
          });   
   } 
  });

 // --------- VIEW ROLE --------------------    
router.get ('/viewRole', checkLogin, function(req, res, next) {  
              fetchRole();  
         var roleId = req.params.id;
             var rDelete = sRole.deleteOne({_id: roleId});
                 rDelete.exec(function(err){
                    if(err)  throw err; 

                res.render('viewRole', {user:loginUser, get_role:getRole}); 
             });
        
});

  //---------- DELETE ROLE ----------------
    router.get ('/viewRole/delete/:id', checkLogin, function(req, res, next) {  
             var roleId = req.params.id;
             var rDelete = sRole.deleteOne({_id: roleId});
                 rDelete.exec(function(err){
                    if(err)  throw err;  
             });  fetchRole();     
                
            res.redirect('/viewRole');            
    });

// ===================== ADD NEW DEPT ============================
router.get ('/addDept', checkLogin, function(req, res, next) {  
         fetchDept();
         res.render('addDept', {user:loginUser, ad_msg:'', db_msg:'', get_dept:getDept});
});
       
router.post ('/addDept', 
                [check('dept1', "Dept is required").not().isEmpty(),
                 check('dept1', "Enter Character please").isAlpha(),
                ], 
                 function(req, res, next) {  
   var loginUser = localStorage.getItem('loginUser');
   var dd = (req.body.dept1).toLowerCase();
   const errors = validationResult(req);
   if (!errors.isEmpty(dd)) 
          res.render('addDept', { ad_msg: errors.mapped(), user: loginUser, db_msg: '' });
      
  else if(dd) {
          var loginUser = localStorage.getItem('loginUser');
          var existDept = sDept.findOne({Dept: dd });
          existDept.exec((err, eDept)=>{
               if (eDept){ message = "Dept Already Exist"; 
                     res.render('addDept', { db_msg: message, user: loginUser, ad_msg: '' });   
               }  else {     
                       var insertedDept = new sDept({ Dept: dd }); 
                           insertedDept.save((err, doc) => { 
                                if(doc) {
                                   message = "inserted successfully";
                                   res.render('addDept', {db_msg:message, user:loginUser, ad_msg:''}); 
                                    
                                    fetchDept(); 
                                }
                          });  
                 }  
          });   
   }  

});

     // --------- VIEW DEPT --------------------    
router.get ('/viewDept', checkLogin, function(req, res, next) {  
         var loginUser = localStorage.getItem('loginUser');
              fetchDept();
          
         var deptId = req.params.id;
             var dDelete = sDept.remove({_id: deptId});
                 dDelete.exec(function(err){
                    if(err)  throw err;  

                res.render('viewDept', {user:loginUser, get_dept:getDept});
             }); 
        
});

  //---------- DELETE DEPT ----------------
    router.get ('/viewDept/delete/:id', checkLogin, function(req, res, next) {  
          var loginUser = localStorage.getItem('loginUser');
             var deptId = req.params.id;
             var dDelete = sDept.deleteOne({_id: deptId});
                 dDelete.exec(function(err){
                    if(err)  throw err;  
             });
                 fetchDept();     
                
            res.redirect('/viewDept');            
    });
      // ----------------------- LOGOUT ---------------------
router.get('/logout', function(req, res, next) { 
      localStorage.removeItem('userToken');
      localStorage.removeItem('loginUser');
      localStorage.removeItem('loginUserId');
      localStorage.removeItem('loginUserRole');
      localStorage.removeItem('loginUserRole');
      res.redirect('/');
})

// =========
 


module.exports = router; 
