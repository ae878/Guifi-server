var express = require('express');
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var multer = require('multer');
var path = require('path'), __parentDir = path.dirname(__dirname);

var connection = mysql.createConnection(dbconfig);
var router = express.Router();


var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, __parentDir+ '/public/uploads')
  },
  filename: function (req, file, cb) {
    file.uploadedFile = {
       name: Date.now(),
       ext: file.mimetype.split('/')[1]
     };
     cb(null, file.uploadedFile.name + '.' + file.uploadedFile.ext);
  }
});


var upload = multer({storage: storage});
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});





router.post('/signup',upload.single('image'),function(req,res){
  console.log(req.body);

  var profile;
  if(req.file != null){
    profile = req.file.path;
  }

  var user = { user_name : req.body.name, password : req.body.password ,
                phone : req.body.mobile,user_id : req.body.userid ,profile : profile};

  connection.query('INSERT INTO userTbl SET ?',user, function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      res.json({result : 'success'});
    }
  });
});


router.post('/signin',function(req,res){
  console.log(req.body);

  connection.query('SELECT user_id from userTbl where user_id=? and password = ?',[req.body.userid,req.body.password], function(err, rows){
    if(err)
      res.json(err);
    else {
      if(rows.length>0){
        res.json({result : 'user'});
      }else{
        connection.query('SELECT user_id from guideTbl where user_id=? and password = ?',[req.body.userid,req.body.password], function(err, rows){
          if(err)
            res.json(err);
          else {
            if(rows.length>0){
              res.json({result : 'guide'});
            }else{
              res.json({result : '아이디 또는 비밀번호가 일치하지 않습니다.'});
            }
          }
        })
;
      }
    }
  });

});


router.post('/update_info',function(req,res){
  console.log(req.body);


  connection.query('Update userTbl SET user_name =? and password=? and phone = ? WHERE user_id = ? ',[req.body.name,
    req.body.password,req.body.mobile,req.body.userId] , function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      res.json({result : 'success'});
    }
  });

});


router.get('/reservation_list/:userId',function(req,res){


  var reservedata = [];
  connection.query('SELECT * from reservation WHERE user_id =? ',req.params.userId , function(err, reservation){
    if(err)
      res.json( err);
    else {
      console.log(reservation.length);

      for(i=0;i<reservation.length ; i++){
        console.log(i);

            var temp = {
              title : reservation[i].title,
              date : reservation[i].date,
              guide : reservation[i].guide_id
            };
            reservedata.push(temp);

            console.log(temp);


          }
          res.json(reservedata);
        }
      });

  });


module.exports = router;
