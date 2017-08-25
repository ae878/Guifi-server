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

//가이드 회원가입
router.post('/signup',upload.single('image'),function(req,res){
  console.log(req.body);

  var profile;
  if(req.file != null){
    profile = req.file.path;
  }

  var user = { user_name : req.body.name, password : req.body.password ,
                phone : req.body.mobile,user_id : req.body.userid,intro : req.body.intro,profile:profile };
  connection.query('SELECT user_id FROM userTbl WHERE user_id = ? ',req.body.userid , function(err, rows){
    if(err)
      res.json("d"+ err);
    else {
      if(rows.length > 0){
        console.log('1'+rows);
        res.json({result : '이미 존재하는 아이디 입니다.'});

      }else{
        console.log('3'+rows);

        connection.query('INSERT INTO guideTbl SET ?',user, function(err, rows){
          if(err)
            res.json('d'+ err);
          else {
            console.log('233'+rows);
            res.json({result : 'success'});
          }
        });
      }

    }
  });
});



router.post('/signin',function(req,res){

  connection.query('SELECT user_id from guideTbl where user_id=? and password = ?',[req.body.userid,req.body.password], function(err, rows){
    if(err)
      res.json(err);
    else {
      if(rows.length>0){
        res.json({result : 'success'});
      }else{
        res.json({result : '아이디 또는 비밀번호가 일치하지 않습니다.'});
      }
    }
  });

});




  router.post('/update_info',function(req,res){

    console.log(req.body);
  //  var user = { UserName : req.body.name, Password : req.body.password , Phone : req.body.mobile,UserID : req.body.userid,Intro : req.body.intro };
    connection.query('Update guideTbl SET user_name =? and password=? and phone = ? and intro = ?  WHERE user_id = ? ',[req.body.name,
      req.body.password,req.body.mobile,req.body.intro,req.body.userid] , function(err, rows){
      if(err)
        res.json({"result" : err});
      else {
        res.json({result : 'success'});
      }
    });

});

//가이드 상세 정보
router.post('/info', function(req, res, next) {
  connection.query('SELECT * FROM guideTbl WHERE user_id = ?',req.body.userid, function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//예약된 코스
router.get('/reservation_list/:guideId',function(req,res){
  console.log(req.body);


  var reservedata = [];
  connection.query('SELECT * from reservation WHERE guide_id =? ',req.params.guideId , function(err, reservation){
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

//가이드 좋아요 순 랭킹 리스트
router.get('/rank/like', function(req, res, next) {
  var query = "SELECT * FROM guideTbl ORDER BY guideTbl.like DESC LIMIT 5";
  var data = [];

  connection.query(query, function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      for(i=0;i<rows.length;i++){
        var guide = {
          user_name: rows[i].user_name,
          phone: rows[i].phone,
          user_id: rows[i].user_id,
          like: rows[i].like,
          view: rows[i].view,
          intro: rows[i].intro
        }
        data.push(guide);
      }

      res.json(data);
    }
  });
});

//가이드 뷰수 순 랭킹 리스트
router.get('/rank/view', function(req, res, next) {

  var data = [];
  var query ="SELECT * FROM guideTbl ORDER BY guideTbl.view DESC LIMIT 5";
  connection.query(query, function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      for(i=0;i<rows.length;i++){
        var guide = {
          user_name: rows[i].user_name,
          phone: rows[i].phone,
          user_id: rows[i].user_id,
          like: rows[i].like,
          view: rows[i].view,
          intro: rows[i].intro
        }
        data.push(guide);
      }

      res.json(data);
    }
  });
});




module.exports = router;
