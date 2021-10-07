const mongoose = require ('mongoose');

mongoose.connect('mongodb://localhost:27017/DEMO_DB', 
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,});

var db = mongoose.Collection;

var leave_schema = new mongoose.Schema({ 
	                       Id: {type: String}, Name: {type: String},
                           Reason: {type: String}, Email: {type: String},
                           Sdate: {type: Date}, Edate: {type: Date},
                           FormDate: {type: Date}, eId: {type: String},
                           ModifiedBy: {type: String},  ModifiedDate: {type: Date},
                           Response: {type: String}, Response_Date: {type: Date},
                           Sort_Date: {type: Date},
                            })
var leave_data = mongoose.model('Leaves', leave_schema);

module.exports = leave_data;


