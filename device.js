var mqtt    = require('mqtt');
var DEVICE = "10.0.0.158"
var request = require('request')
var schedule = require('node-schedule');
var MQTT_HOST = "mqtt://10.0.0.57:1883";
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
    console.log('MongoDB disconnected!');
    var now = new Date().getTime();
    // check if the last reconnection attempt was too early
    if (lastReconnectAttempt && now-lastReconnectAttempt<5000) {
        // if it does, delay the next attempt
        var delay = 5000-(now-lastReconnectAttempt);
        console.log('reconnecting to MongoDB in ' + delay + "mills");
        setTimeout(function() {
            console.log('reconnecting to MongoDB');
            lastReconnectAttempt=new Date().getTime();
            mongoose.connect(configDB.url, {server:{auto_reconnect:true}});
        },delay);
    }
    else {
        console.log('reconnecting to MongoDB');
        lastReconnectAttempt=now;
        mongoose.connect(configDB.url, {server:{auto_reconnect:true}});
    }

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
var light_1 = new schedule.RecurrenceRule();
var light_2 = new schedule.RecurrenceRule();
var light_3 = new schedule.RecurrenceRule();
var light_4 = new schedule.RecurrenceRule();
var light_5 = new schedule.RecurrenceRule();

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
        console.dir('headers', res.headers)
        console.dir('status code', res.statusCode)
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
function dolights(state,id){
    var portsend;
    var port;
    var headers = {
        'Authorization': 'Basic c25tcDoxMjM0',
        'content-type': 'text/plain',
        'accepT': '*/*'
    }
    console.log(tempport2)
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

        }
    })
}




}
1
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

        console.log("found lihgts 1")
        tempport1 = light.Lights.port
        light_1.dayOfWeek = [0, new schedule.Range(0, 6)];
        light_1.hour = parseInt(light.Lights.ontimehr)
        light_1.minute = parseInt(light.Lights.ontimemin)

        light1on.reschedule(light_1, function(){
            dolights(1,'Lights 1')
            lights_1_state = true;
        });
        light_1.dayOfWeek = [0, new schedule.Range(0, 6)];
        light_1.hour = parseInt(light.Lights.offtimehr)
        light_1.minute = parseInt(light.Lights.offtimemin)
        light1off.reschedule(light_1, function(){
            dolights(0,'Lights 1')
            lights_1_state = false;
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

            console.log("found lihgts 2")
            tempport2 = light.Lights.port
            light_2.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_2.hour = parseInt(light.Lights.ontimehr)
            light_2.minute = parseInt(light.Lights.ontimemin)

            light2on.reschedule(light_2, function(){
                dolights(1,'Lights 2')
                lights_2_state = true;
            });
            light_2.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_2.hour = parseInt(light.Lights.offtimehr)
            light_2.minute = parseInt(light.Lights.offtimemin)
            light2off.reschedule(light_2, function(){
                dolights(0,'Lights 2')
                lights_2_state = false;
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
            console.log("found lihgts 3")
            tempport3 = light.Lights.port
            light_3.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_3.hour = parseInt(light.Lights.ontimehr)
            light_3.minute = parseInt(light.Lights.ontimemin)

            light3on.reschedule(light_3, function(){
                dolights(1,'Lights 3')
                lights_3_state = true;
            });
            light_3.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_3.hour = parseInt(light.Lights.offtimehr)
            light_3.minute = parseInt(light.Lights.offtimemin)
            light3off.reschedule(light_3, function(){
                dolights(0,'Lights 3')
                lights_3_state = false;
            })

        }).exec(),

        Light.findOne({ 'Lights.id' :  'Lights 4' }, function(err, light) {
            if (err) {
                console.log(err);
                return;
            }

            // if no user is found, return the message
            if (!light)
                return;
            console.log("found lihgts 4")
            tempport4 = light.Lights.port
            light_4.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_4.hour = parseInt(light.Lights.ontimehr)
            light_4.minute = parseInt(light.Lights.ontimemin)

            light4on.reschedule(light_4, function(){
                dolights(1,'Lights 4')
                lights_4_state = true;
            });
            light_4.dayOfWeek = [0, new schedule.Range(0, 6)];
            light_4.hour = parseInt(light.Lights.offtimehr)
            light_4.minute = parseInt(light.Lights.offtimemin)
            light4off.reschedule(light_4, function(){
                dolights(0,'Lights 4')
                lights_4_state = false;
            })

        }).exec()

    ];



}
light_1.dayOfWeek = [0, new schedule.Range(0, 6)];
light_1.hour =7
light_1.minute =0
light_2.dayOfWeek = [0, new schedule.Range(0, 6)];
light_2.hour =19
light_2.minute =0
var light1on = schedule.scheduleJob(light_1, function(){
});

var light1off = schedule.scheduleJob(light_2, function(){
});
var light2on = schedule.scheduleJob(light_1, function(){
});
var light2off = schedule.scheduleJob(light_2, function(){
});
var light3on = schedule.scheduleJob(light_1, function(){
});
var light3off = schedule.scheduleJob(light_2, function(){
});
var light4on = schedule.scheduleJob(light_1, function(){
});
var light4off = schedule.scheduleJob(light_2, function(){
});
