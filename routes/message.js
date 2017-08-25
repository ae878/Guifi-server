var express = require('express');

var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);

var router = express.Router();


router.post('/send',function(req,res){

  var message = { content : req.body.content, to : req.body.sender, from : req.body.receiver};

  console.log(message);
  connection.query('INSERT INTO message1 SET ?',message, function(err, rows){
    if(err)
      res.json( err);
    else {
      res.json({result : 'success'});

    }
  });
});


router.post('/show_messages',function(req,res){
  var tofrom = {to : req.body.myId,from : req.body.yourId};
  var fromto = {to : req.body.yourId,from : req.body.myId};

  connection.query('SELECT * FROM message1 WHERE ?? = ? and ??=?',['to',req.body.myId,'from',req.body.yourId], function(err, myReceivedMessage){
    if(err)
      res.json( err);
    else {
      console.log(myReceivedMessage);

      connection.query('SELECT * FROM message1 WHERE ?? = ? and ??=?',['to',req.body.yourId,'from',req.body.myId], function(err, mySendedMessage){
        if(err)
          res.json( err);
        else {
          res.json({"myReceivedMessage" : myReceivedMessage, "mySendedMessage" : mySendedMessage});
        }
      });
    }
  });
});


module.exports = router;
