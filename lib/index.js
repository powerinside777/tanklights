var net = require('net');
var os = require('os');
var path = require('path');
var socket;
var connected = false;
var statusDisplay = {'Power':'','Input':'','Lamp':'','Lamp2':''};
var statusUser = {'Power':'','Input':''};

var Display = function(ip,port,Commands,callback) {
  var that = this;
  this.ip = ip;
  this.port = port;
  this.device = ip;
  this.intervile = 0;
  this.Commands = Commands;
  callback(this);

};

Display.prototype.exec = function(command) {

  var that = this;

  that.makeCommandRequest(command);


};

Display.prototype.status = function(command) {
  var that = this;
    var string = command.toString()
    console.log(string)
  if (string.search(this.Commands.RSP_ON) != -1) {
    statusDisplay.Power = 'ON'
    if(statusDisplay.Power !=statusUser.Power ){
      if(statusUser.Power == 'ON'){
        that.exec(this.Commands.CMD_ON)
      }
      else{
        that.exec(this.Commands.CMD_OFF)
      }
    }
  }
  else if (string.search(this.Commands.RSP_OFF) != -1) {
    statusDisplay.Power = 'OFF'
    if(statusDisplay.Power !=statusUser.Power ){
      if(statusUser.Power == 'ON'){
        that.exec(this.Commands.CMD_ON)
      }
      else{
        that.exec(this.Commands.CMD_OFF)
      }
    }
  }
  else if (string.search(this.Commands.RSP_HDMI1) != -1) {
    statusDisplay.Input = 'HDMI1'
    if(statusDisplay.Input !=statusUser.Input ){
      if(statusUser.Input == 'HDMI1'){
        that.exec(this.Commands.CMD_HDMI1)
      }
      else if(statusUser.Input == 'HDMI2'){
        that.exec(this.Commands.CMD_HDMI2)
      }
      else if(statusUser.Input == 'HDMI3'){
        that.exec(this.Commands.CMD_HDMI3)
      }
      else if(statusUser.Input == 'HDMI4'){
        that.exec(this.Commands.CMD_HDMI4)
      }
    }
  }
  else if (string.search(this.Commands.RSP_HDMI2) != -1) {
    statusDisplay.Input = 'HDMI2'
    if(statusDisplay.Input !=statusUser.Input ){
      if(statusUser.Input == 'HDMI1'){
        that.exec(this.Commands.CMD_HDMI1)
      }
      else if(statusUser.Input == 'HDMI2'){
        that.exec(this.Commands.CMD_HDMI2)
      }
      else if(statusUser.Input == 'HDMI3'){
        that.exec(this.Commands.CMD_HDMI3)
      }
      else if(statusUser.Input == 'HDMI4'){
        that.exec(this.Commands.CMD_HDMI4)
      }
    }
  }
  else if (string.search(this.Commands.RSP_HDMI3) != -1) {
    statusDisplay.Input = 'HDMI3'
    if(statusDisplay.Input !=statusUser.Input ){
      if(statusUser.Input == 'HDMI1'){
        that.exec(this.Commands.CMD_HDMI1)
      }
      else if(statusUser.Input == 'HDMI2'){
        that.exec(this.Commands.CMD_HDMI2)
      }
      else if(statusUser.Input == 'HDMI3'){
        that.exec(this.Commands.CMD_HDMI3)
      }
      else if(statusUser.Input == 'HDMI4'){
        that.exec(this.Commands.CMD_HDMI4)
      }
    }
  }
  else if (string.search(this.Commands.RSP_HDMI4) != -1) {
    statusDisplay.Input = 'HDMI4'
    if(statusDisplay.Input !=statusUser.Input ){
      if(statusUser.Input == 'HDMI1'){
        that.exec(this.Commands.CMD_HDMI1)
      }
      else if(statusUser.Input == 'HDMI2'){
        that.exec(this.Commands.CMD_HDMI2)
      }
      else if(statusUser.Input == 'HDMI3'){
        that.exec(this.Commands.CMD_HDMI3)
      }
      else if(statusUser.Input == 'HDMI4'){
        that.exec(this.Commands.CMD_HDMI4)
      }
    }
  }
  else if (string.search(this.Commands.RSP_VGA1) != -1) {
    statusDisplay.Input = 'VGA1'
    if(statusDisplay.Input !=statusUser.Input ){
      if(statusUser.Input == 'HDMI1'){
        that.exec(this.Commands.CMD_HDMI1)
      }
      else if(statusUser.Input == 'HDMI2'){
        that.exec(this.Commands.CMD_HDMI2)
      }
      else if(statusUser.Input == 'HDMI3'){
        that.exec(this.Commands.CMD_HDMI3)
      }
      else if(statusUser.Input == 'HDMI4'){
        that.exec(this.Commands.CMD_HDMI4)
      }
    }
  }
  else if (string.search(this.Commands.RSP_SLOT) != -1) {
    statusDisplay.Input = 'SLOT'
    if(statusDisplay.Input !=statusUser.Input ){
      if(statusUser.Input == 'HDMI1'){
        that.exec(this.Commands.CMD_HDMI1)
      }
      else if(statusUser.Input == 'HDMI2'){
        that.exec(this.Commands.CMD_HDMI2)
      }
      else if(statusUser.Input == 'HDMI3'){
        that.exec(this.Commands.CMD_HDMI3)
      }
      else if(statusUser.Input == 'HDMI4'){
        that.exec(this.Commands.CMD_HDMI4)
      }
    }
  }
  else if (string.search(this.Commands.RSP_LAMP) != -1) {
    statusDisplay.Lamp = string.replace(string.RSP_LAMP,"");
  }
  else if (string.search(this.Commands.RSP_LAMP2) != -1) {
    statusDisplay.Lamp2 = string.replace(string.RSP_LAMP2,"");
  } 


};

Display.prototype.send = function(command) {
  var that = this;

  if(connected == false){
    socket = net.connect(this.port, this.ip);
  }
  else
    socket.write(command);


  socket.on('connect', function() {
    socket.write(command);
    connected = true;
    console.log('conected')
  });
  socket.on('data',function(data){
    var string1 = data.toString()
    if (string1.search('PJLINK 0') != -1)
      socket.write(command);
    else {
      that.status(data);
      socket.destroy()
    }
  });
  socket.on('close', function () {
    connected = false;
  });

  socket.on('error', function(error) {
    var errorMsg;

    if (error.code === 'EHOSTUNREACH' || error.code === 'ECONNREFUSED') {
      errorMsg = 'Display Remote Client: Device is off or unreachable';
    } else {
      errorMsg = 'Display Remote Client: ' + error.code;
    }


  });

  socket.on('timeout', function() {

  });
};

Display.prototype.makeCommandRequest = function(code, callback) {

  var body = this.Commands.CMD_HEADER+code+this.Commands.CMD_TERMINATOR;
    console.log('COMMANDSEND:',body);

    if (this.Commands.CMD_ON.search(code) != -1){
        statusUser.Power = 'ON'
      this.send(body, function callback(err) {
      });
    }
    if (this.Commands.CMD_OFF.search(code) != -1){
        statusUser.Power = 'OFF'
      this.send(body, function callback(err) {
      });
    }
    if (this.Commands.CMD_HDMI1.search(code) != -1){
        statusUser.Input = 'HDMI1'
    }
    if (this.Commands.CMD_HDMI2.search(code) != -1){
        statusUser.Input = 'HDMI2'
    }
    if (this.Commands.CMD_HDMI3.search(code) != -1){
        statusUser.Input = 'HDMI3'
    }
    if (this.Commands.CMD_HDMI4.search(code) != -1){
        statusUser.Input = 'HDMI4'
    }


};

Display.prototype.getCommandCode = function(command, callback) {

  this.getCommandList(function(list) {
    if(command !== undefined && callback !== undefined) {
      callback(command);
    }
  });

};

Display.prototype.request = function(callback) {


  var body;
  var that = this;

  if(this.intervile == 1){

    if(statusDisplay.Power == 'ON') {
      body = this.Commands.CMD_HEADER + this.Commands.STATUS_INPUT + this.Commands.CMD_TERMINATOR;
    }
  }
  if(this.intervile == 0){
    body = this.Commands.CMD_HEADER+this.Commands.STATUS_POWER+this.Commands.CMD_TERMINATOR;
  }
  if(this.intervile ==2) {
    if (this.Commands.STATUS_LAMP.length > 0) {
      body = this.Commands.CMD_HEADER + this.Commands.STATUS_LAMP + this.Commands.CMD_TERMINATOR;
    }
  }
  if(this.intervile ==3){
    if(this.Commands.STATUS_LAMP2.length > 0) {
      body = this.Commands.CMD_HEADER + this.Commands.STATUS_LAMP2 + this.Commands.CMD_TERMINATOR;
    }
  }
  console.log('COMMANDSEND:',body);

    if(this.intervile >= 3)
      this.intervile = 0;
    else
      this.intervile = this.intervile + 1;
    if(body != undefined) {
      this.send(body)
    }

  setTimeout(this.request.bind(this), 3000);
};

exports.Displayclass = Display;
