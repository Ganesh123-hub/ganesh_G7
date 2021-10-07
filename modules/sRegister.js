const mongoose = require ('mongoose');

mongoose.connect('mongodb://localhost:27017/DEMO_DB', 
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,});

var db = mongoose.Collection;

var register_schema = new mongoose.Schema({ 
	                             Id: {type: String}, Name: {type: String},
                           Password: {type: String}, Email: {type: String},
                           Phone: {type: String}, JoinDate: {type: String},
                           Role: {type: String}, Department: {type: String},
                           CreatedBy: {type: String}, CreatedDate: {type: String},
                           Gender: {type: String}, JoinDate: {type: Date, Default:Date.now},
                           Status: {type: String},
                           ModifiedBy:{type: String}, ModifiedDate:{type: Date, Default:Date.now}
                                         })
 var register_data = mongoose.model('Employees', register_schema);

 module.exports = register_data;
