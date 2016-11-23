
var mongoose = require('mongoose');

// define the schema for our user model

var fishtanklights = mongoose.Schema({

    Lights           : {
        id              : String,
        port        : String,
        ontimehr        : String,
        ontimemin        : String,
        offtimehr     : String,
        offtimemin     : String
    }


});


module.exports = mongoose.model('Light',fishtanklights);
