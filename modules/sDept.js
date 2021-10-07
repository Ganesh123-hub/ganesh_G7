const mongoose = require ('mongoose');

mongoose.connect('mongodb://localhost:27017/DEMO_DB', 
	{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true,});

var db = mongoose.Collection;

var dept_schema = new mongoose.Schema({ Dept: {type: String} })
var dept_data = mongoose.model('Depts', dept_schema);

module.exports = dept_data;