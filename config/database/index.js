const mongoose = require('mongoose');
var url = 'mongodb://localhost/BaseAPIRest';
mongoose.connect(url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.set(`useFindAndModify`,false);
module.exports = mongoose;