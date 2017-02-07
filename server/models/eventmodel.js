var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
	title: String,
	startDate: Date,
	img: String,
	createdBy: String

});

mongoose.model('Event', EventSchema);