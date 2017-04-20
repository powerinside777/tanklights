var mqtt    = require('mqtt');
var DEVICE = "10.0.0.158"
var request = require('request')
var schedule = require('node-schedule');
var MQTT_HOST = "mqtt://10.0.0.61:1883";
var MQTT_BROKER_USER = 'josh';
var MQTT_BROKER_PASS = 'Isabella2030';
var mongoose = require('mongoose');
var configDB = require('./models/database.js');
var tempport1 =""
var tempport2 =""
var tempport3 =""
var tempport4=""
var lights_1_state =false;
var lights_2_state =false;
var lights_3_state =false;
var lights_4_state =false;
var Light       		= require('./models/lights');
var db = mongoose.connection;
mongoose.Promise = require('q').Promise
var lastReconnectAttempt;
var settings = {
    username:MQTT_BROKER_USER,
    password:MQTT_BROKER_PASS
}

mongoose.connect(configDB.url,{server:{auto_reconnect:true}},function(err) {
    if (err)
        return console.error(err);

}); // connect to our database
db.on('error', function(error) {
    console.error('Error in MongoDb connection: ' + error);
    mongoose.disconnect();
});
db.on('disconnected', function() {
    setTimeout(function() {
        console.log('MongoDB disconnected!');
        var now = new Date().getTime();
        // check if the last reconnection attempt was too early

        if (lastReconnectAttempt && now - lastReconnectAttempt < 5000) {
            // if it does, delay the next attempt
            var delay = 5000 - (now - lastReconnectAttempt);
            console.log('reconnecting to MongoDB in ' + delay + "mills");
            setTimeout(function () {
                console.log('reconnecting to MongoDB');
                lastReconnectAttempt = new Date().getTime();
                mongoose.connect(configDB.url, {server: {auto_reconnect: true}});
            }, delay);
        }
        else {
            console.log('reconnecting to MongoDB');
            lastReconnectAttempt = now;
            mongoose.connect(configDB.url, {server: {auto_reconnect: true}});
        }
    },60000)
});
db.on('connected', function() {
    updatetimes();
    console.log('conected');

});
var mqtt_client  = mqtt.connect(MQTT_HOST,settings);
mqtt_client.on('connect', function () {
    mqtt_client.subscribe('home/fish/lights');
    console.log('MQTT:','connected');
});
var light_1_on = new schedule.RecurrenceRule();
var light_1_off = new schedule.RecurrenceRule();
var light_2_on = new schedule.RecurrenceRule();
var light_2_off = new schedule.RecurrenceRule();
var light_3_on = new schedule.RecurrenceRule();
var light_3_off = new schedule.RecurrenceRule();
var light_4_on = new schedule.RecurrenceRule();
var light_4_off = new schedule.RecurrenceRule();
var light_5_on = new schedule.RecurrenceRule();
var light_5_off = new schedule.RecurrenceRule();
mqtt_client.on('message', function (topic, message) {
    console.log('MQTT:'+topic+':'+message.toString());
    if(topic == 'home/fish/lights') {
        var data = message.toString()
        var arr = data.split(",")
        if (arr[0] == "later") {

            Light.findOne({ 'Lights.id' :  arr[1] }, function(err, light) {
                if (err)
                    return;

                // if no user is found, return the message
                if (!light)
                    return;

                light.Lights.ontimehr = arr[2]
                light.Lights.ontimemin = arr[3]
                light.Lights.offtimehr = arr[4]
                light.Lights.offtimemin = arr[5]
                // save
                light.save(function (err) {
                    if (err)
                        throw err;

                    updatetimes()
                    return;
                });
            });

        }
        if (arr[0] == "now"){

            dolights(arr[1], arr[2])

        }
    }
});
setInterval(function(){
    var headers = {
        'Authorization': 'Basic c25tcDoxMjM0',
        'content-type': 'text/plain',
        'accepT': '*/*'
    }
    var options = {
        url: 'http://10.0.0.158:80/status.xml',
        method: 'GET',
        headers: headers
    }
    request(options, function (err, res, body) {
        if (err) {
            console.dir(err)
            return
        }

        console.dir(body)
        var arr = body.split(",");
        var l1 = parseInt(tempport1) + 9;
        var l2 = parseInt(tempport2) + 9;
        var l3 = parseInt(tempport3) + 9;
        var l4 = parseInt(tempport4) + 9;
        console.log(arr[l2])

        if(arr[l1] == '0' && lights_1_state == true)
            dolights(1,'Lights 1')
        else if (arr[l1] == '1' && lights_1_state == false)
            dolights(0,'Lights 1')

        if(arr[l2] == '0' && lights_2_state == true)
            dolights(1,'Lights 2')
        else if (arr[l2] == '1' && lights_2_state == false)
            dolights(0,'Lights 2')

        if(arr[l3] == '0' && lights_3_state == true)
            dolights(1,'Lights 3')
        else if (arr[l3] == '1' && lights_3_state == false)
            dolights(0,'Lights 3')

        if(arr[l4] == '0' && lights_4_state == true)
            dolights(1,'Lights 4')
        else if (arr[l4] == '1' && lights_4_state == false)
            dolights(0,'Lights 4')


    })

},2000000)
function updatedblightstate (id,value) {
  Light.findOne({ 'Lights.id' :  id }, function(err, light) {
    if (err)
      return;

    // if no user is found, return the message
    if (!light)
      return;

    light.Lights.currentstate = value
    // save
    light.save(function (err) {
      if (err)
        throw err;

      updatetimes()
      return;
    });
  });
}
function dolights(state,id){
    var portsend;
    var port;
    var headers = {
        'Authorization': 'Basic c25tcDoxMjM0',
        'content-type': 'text/plain',
        'accepT': '*/*'
    }

    switch(id){
        case "Lights 1":
            port = tempport1;
            break;
        case "Lights 2":
            port = tempport2;
            break;
        case "Lights 3":
            port = tempport3;
            break;
        case "Lights 4":
            port = tempport4;
            break;

    }
            switch (port) {
                case "1" :
                    portsend = '1000000000000000'
                    break;
                case "2" :
                    portsend =
                        '0100000000000000'
                    break;
                case "3" :
                    portsend =
                        '0010000000000000'
                    break;
                case "4" :
                    portsend =
                        '0001000000000000'
                    break;
                case "5" :
                    portsend =
                        '0000100000000000'
                    break;
                case "6" :
                    portsend =
                        '0000010000000000'
                    break;
                case "7" :
                    portsend =
                        '0000001000000000'
                    break;
                case "8" :
                    portsend =
                        '0000000100000000'
                    break;
                case "9" :
                    portsend =
                        '0000000010000000'
                    break;
                case "10" :
                    portsend =
                        '0000000001000000'
                    break;
                case "11" :
                    portsend =
                        '0000000000100000'
                    break;
                case "12" :
                    portsend =
                        '0000000000010000'
                    break;
                case "13" :
                    portsend =
                        '0000000000001000'
                    break;
                case "14" :
                    portsend =
                        '0000000000000100'
                    break;
                case "15" :
                    portsend =
                        '0000000000000010'
                    break;
                case "16" :
                    portsend =
                        '0000000000000001'
                    break;

            }
            console.log(portsend)
            if (state == 1) {
                var options = {
                    url: 'http://10.0.0.158:80/ons.cgi?led=' + portsend,
                    method: 'GET',
                    headers: headers
                }

            }
            else {
                var options = {
                    url: 'http://10.0.0.158:80/offs.cgi?led=' + portsend,
                    method: 'GET',
                    headers: headers
                }
            }

if(port !="") {


    request(options, function (err, res, body) {
        if (err) {
            console.dir(err)
            return
        }
        console.dir('headers', res.headers)
        console.dir('status code', res.statusCode)
        console.dir(body)
        if (body == "Success!") {
            mqtt_client.publish("home", id + '=' + state);
            console.log(id+"="+state)
        }
    })
}




}

function updatetimes(){
    var promises = [


    Light.findOne({ 'Lights.id' :  'Lights 1' }, function(err, light) {
        if (err) {
            console.log(err);
            return;
        }

        // if no user is found, return the message
        if (!light)
            return;

        console.log("found lihgts 1 " +light.Lights.ontimehr +":"+light.Lights.ontimemin +"off" +light.Lights.offtimehr+ ":"+light.Lights.offtimemin)

        tempport1 = light.Lights.port
        light_1_on.dayOfWeek = [0, new schedule.Range(0, 6)];
        light_1_on.hour = parseInt(light.Lights.ontimehr)
        light_1_on.minute = parseInt(light.Lights.ontimemin)
        lights_1_state == light.Lights.currentstate
        light1on.reschedule(light_1_on, function(){
            dolights(1,'Lights 1')
            lights_1_state = true;
            console.log("ra code from updatetime Light 1 on ")
            updatedblightstate('Lights 1',true)
        });
        light_1_off.dayOfWeek = [0, new schedule.Range(0, 6)];
        light_1_off.hour = parseInt(light.Lights.offtimehr)
        light_1_off.minute = parseInt(light.Lights.offtimemin)
        light1off.reschedule(light_1_off, function(){
            dolights(0,'Lights 1')
            lights_1_state = false;
            console.log("ra code from updatetime Light 1 off ")
          updatedblightstate('Lights 2',false)
        })

    }).exec(),
        Light.findOne({ 'Lights.id' :  'Lights 2' }, function(err, light) {

            if (err) {
                console.log(err);
                return;
            }

            // if no user is found, return the message

            if (!light)
                return;

            console.log("found lihgts 2 " +light.Lights.ontimehr +":"+light.Lights.ontimemin +"off" +light.Lights.offtimehr+ ":"+light.Lights.offtimemin)

            tempport2 = light.Lights.port
            light_2_on.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_2_on.hour = parseInt(light.Lights.ontimehr)
            light_2_on.minute = parseInt(light.Lights.ontimemin)
            lights_2_state == light.Lights.currentstate

             light2on.reschedule(light_2_on, function(){
                dolights(1,'Lights 2')
                lights_2_state = true;
                console.log("ra code from updatetime Light 2 on ")
               updatedblightstate('Lights 2',true)
            });
            light_2_off.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_2_off.hour = parseInt(light.Lights.offtimehr)
            light_2_off.minute = parseInt(light.Lights.offtimemin)
            light2off.reschedule(light_2_off, function(){
                dolights(0,'Lights 2')
                lights_2_state = false;
                console.log("ra code from updatetime Light 2 off ")
              updatedblightstate('Lights 2',false)
            })

        }).exec(),
        Light.findOne({ 'Lights.id' :  'Lights 3' }, function(err, light) {
            if (err) {
                console.log(err);
                return;
            }

            // if no user is found, return the message
            if (!light)
                return;
            console.log("found lihgts 3 "+light.Lights.currentstate +light.Lights.ontimehr +":"+light.Lights.ontimemin +"off" +light.Lights.offtimehr+ ":"+light.Lights.offtimemin)

            tempport3 = light.Lights.port
            light_3_on.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_3_on.hour = parseInt(light.Lights.ontimehr)
            light_3_on.minute = parseInt(light.Lights.ontimemin)

          lights_3_state == light.Lights.currentstate
          light3on.reschedule(light_3_on, function(){
                dolights(1,'Lights 3')
                lights_3_state = true;
                console.log("ra code from updatetime Light 3 on ")
                updatedblightstate('Lights 3',true)
            });
            light_3_off.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_3_off.hour = parseInt(light.Lights.offtimehr)
            light_3_off.minute = parseInt(light.Lights.offtimemin)
            light3off.reschedule(light_3_off, function(){
                dolights(0,'Lights 3')
                lights_3_state = false;
                console.log("ra code from updatetime Light 3 off ")
              updatedblightstate('Lights 3',false)
            })

        }).exec(),

        Light.findOne({ 'Lights.id' :  'Lights 4' }, function(err, light) {
            if (err) {
                console.log(err);
                return;
            }

            // if no user is found, return the message
            if (!light)
                return; +
                console.log("found lihgts 4 " +light.Lights.ontimehr +":"+light.Lights.ontimemin +"off" +light.Lights.offtimehr+ ":"+light.Lights.offtimemin)
            tempport4 = light.Lights.port
            light_4_on.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_4_on.hour = parseInt(light.Lights.ontimehr)
            light_4_on.minute = parseInt(light.Lights.ontimemin)
             lights_4_state == light.Lights.currentstate
             light4on.reschedule(light_4_on, function(){
                dolights(1,'Lights 4')
                lights_4_state = true;
                console.log("ra code from updatetime Light 4 on ")
               updatedblightstate('Lights 4',true)
            });
            light_4_off.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_4_off.hour = parseInt(light.Lights.offtimehr)
            light_4_off.minute = parseInt(light.Lights.offtimemin)
            light4off.reschedule(light_4_off, function(){
                dolights(0,'Lights 4')
                lights_4_state = false;
                console.log("ra code from updatetime Light 4 off ")
                updatedblightstate('Lights 4',false)
            })

        }).exec()

    ];



}

var light1on = schedule.scheduleJob(light_1_on, function(){
    dolights(0,'Lights 1')
    lights_1_state = true;
    console.log("ra code from main Light 1 on ")
  updatedblightstate('Lights 1',true)
});

var light1off = schedule.scheduleJob(light_1_off, function(){
    dolights(0,'Lights 1')
    lights_1_state = false;
    updatedblightstate('Lights 1',false)
    console.log("ra code from updatetime Light 1 off ")
});
var light2on = schedule.scheduleJob(light_2_on, function(){
    dolights(1,'Lights 2')
    lights_2_state = true;
    console.log("ra code from main Light 2 on ")
    updatedblightstate('Lights 2',true)
});
var light2off = schedule.scheduleJob(light_2_off, function(){
    dolights(0,'Lights 2')
    lights_2_state = false;
    console.log("ra code from main Light 2 off ")
    updatedblightstate('Lights 2',false)
});
var light3on = schedule.scheduleJob(light_3_on, function(){
    dolights(1,'Lights 3')
    lights_3_state = true;
    console.log("ra code from main Light 3 on ")
    updatedblightstate('Lights 3',true)
});
var light3off = schedule.scheduleJob(light_3_off, function(){
    dolights(0,'Lights 3')
    lights_3_state = false;
    console.log("ra code from main Light 3 off ")
    updatedblightstate('Lights 3',false)
});
var light4on = schedule.scheduleJob(light_4_on, function(){
    dolights(1,'Lights 4')
    lights_4_state = true;
    console.log("ra code from main Light 4 on ")
    updatedblightstate('Lights 4',true)
});
var light4off = schedule.scheduleJob(light_4_off, function(){
    dolights(0,'Lights 4')
    lights_4_state = false;
    console.log("ra code from main Light 4 off ")
    updatedblightstate('Lights 4',false)
});

