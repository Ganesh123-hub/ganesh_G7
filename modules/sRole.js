const mongoose = require ('mongoose');

mongoose.connect('mongodb://localhost:27017/DEMO_DB', 
	{ useNewUrlParser: true, useUnifiedTopology: true, });

 var db = mongoose.Collection;

var role_schema = new mongoose.Schema({ Role: {type: String} })
var role_data = mongoose.model('Roles', role_schema);

module.exports = role_data; 