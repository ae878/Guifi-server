var express = require('express');
var router = express.Router();
var multer = require('multer');
var Thumbler = require('thumbler');
var mysql = require('mysql');
var dbconfig = require('../config/database.js');
var connection = mysql.createConnection(dbconfig);
var vidStreamer = require('vid-streamer')
var path = require('path'), __parentDir = path.dirname(__dirname);
var videoScreen = require('video-screen');


var fs = require('fs');

var thumbler = require('video-thumb');
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

router.get('/show',function(req,res){
  fs.readdirSync(__parentDir+ '/public/uploads').forEach(file => {
    console.log(file);
  });
  console.log('/public/uploads/thumbnail');

  fs.readdirSync(__parentDir+ '/public/uploads/thumbnail').forEach(file => {
    console.log(file);
  })

  console.log('/public');

  fs.readdirSync(__parentDir+ '/public').forEach(file => {
    console.log(file);
  })
  console.log("/routespublic");


    fs.readdirSync(__parentDir+'/public/uploads/thumnnail').forEach(file => {
      console.log(file);
    })

});

router.get('/delete_t/:name',function(req,res){
  fs.unlink(__parentDir+ '/public/uploads/thumbnail/'+req.params.name, function (err) {
    if (err)
      throw err;
    console.log('successfully deleted text2.txt');
  });

});

router.get('/delete/:name',function(req,res){
  fs.unlink(__parentDir+ '/public/uploads/'+req.params.name, function (err) {
    if (err)
      throw err;
    console.log('__parentDir'+'/public/uploads/'+req.params.name);
  });

});

router.get('/upload',function(req,res){
  res.render('upload');

});
router.post('/upload',  upload.fields([{name: 'VRvideo', maxCount: 1
         }, {
           name: 'images', maxCount: 3
         }]), function(req, res){
  console.log(req.files); // 콘솔(터미널)을 통해서 req.file Object 내용 확인 가능.



    var day='';
    for(i=0;i<req.body.day.length;i++){
      day = day+req.body.day[i];
    }

    var path1,path2,path3;

    if(req.files.images[0]){
      path1 = req.files.images[0].path;
    }

    if(req.files.images[1]){
  path2 = req.files.images[1].path;
    }

    if(req.files.images[2]){
  path3 = req.files.images[2].path;
    }



  var video = { title : req.body.title, theme : req.body.theme ,
                description : req.body.description, time : req.body.time,
                thumbnail1 : path1,thumbnail2 :path2,
                 thumbnail3 : path3,day: day,
              price : req.body.price, tag:req.body.tag, like : 0,view : 0,url : req.files.VRvideo[0].path,user_id : req.body.userid };

console.log(video);

  connection.query('SELECT * FROM guideTbl WHERE user_id = ?',req.body.userid, function(err, videoRows){
    if(err){
      console.log('1'+err);
      res.json( err);
    }
    else {
      if(videoRows.length>0){
        connection.query('INSERT INTO video SET ?',video, function(err, rows){
          if(err){
            console.log('2'+err);
            res.json( err);
          }
          else {
              res.json({result : 'success'});
          }
        });
      }
      else{
        res.json({result : "id가 없습니다."});
      }
      }
  });
});

router.get('/download/:id', function(req, res){
  connection.query('SELECT url from video where id=? ',req.params.id, function(err, rows){
    if(err)
      res.json(err);
    else {
      res.json(rows);
    }
  });
});

//예약
router.post('/reserve', function(req, res){

  var reserve = '';
  connection.query('SELECT reservation From video WHERE id= ?',req.body.videoId, function(err, videoReservation){
    if(err)
      res.json(err);
    else {
      if(videoReservation.length==0){
        reserve = req.body.date;
      }else{
        reserve = videoReservation[0].reservation+','+req.body.date;
      }

      connection.query('UPDATE video SET reservation = ? WHERE id= ?',[reserve,req.body.videoId], function(err, rows){
        if(err)
          res.json(err);
        else {
          var reservation = {title : req.body.title,video_id : req.body.videoId,user_id : req.body.userId, guide_id : req.body.guideId,date : req.body.date};
          connection.query('INSERT INTO reservation SET ?',reservation, function(err, reservation){
            if(err)
              res.json(err);
            else {
              res.json({"result":"success"});
            }
          });
        }
      });
    }
  });

});



//상세 페이지
router.get('/detail/:id', function(req, res){

  connection.query('SELECT * From video where id = ?',req.params.id, function(err, videoInfo){
    if(err)
      res.json(err);
    else {

      connection.query('UPDATE video SET view = view+1 where id = ?',videoInfo[0].id, function(err, info){
        if(err)
          res.json(err);
        else {
          connection.query('UPDATE guideTbl SET view = view+1 where user_id = ?',videoInfo[0].user_id, function(err, rows){
            if(err)
              res.json(err);
            else {
              res.json(videoInfo);
            }
          });
        }
      });
    }
  });

});

//전체 리스트(랭크순)
router.get('/list', function(req, res){
  connection.query('SELECT *from video', function(err, rows){
    if(err)
      res.json(err);
    else {
      res.json(rows);
    }
  });
});

//가이드 좋아요 순 랭킹 리스트
router.get('/rank/like', function(req, res, next) {
  connection.query('SELECT * FROM video ORDER BY ?', 'like', function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//가이드 뷰수 순 랭킹 리스트
router.get('/rank/view', function(req, res, next) {
  connection.query('SELECT * FROM video ORDER BY ?', 'view',function(err, rows){
    if(err)
      res.json( err);
    else {
      console.log(rows);
      res.json(rows);
    }
  });
});

//좋아요
router.post('/like', function(req, res){

  connection.query('SELECT like_list from userTbl where user_id = ?',req.body.userid, function(err, likeList){
    if(err)
      res.json('1'+err);
    else {

      var newLikeList;

      if(likeList.length==0){
        newLikeList = req.body.videoId;
      }else{
        newLikeList = likeList[0].like_list+','+req.body.videoId;
      }

      connection.query('UPDATE userTbl SET like_list = ? where user_id = ?',[newLikeList,req.body.userid], function(err){
        if(err)
          res.json('2'+err);
        else {
          connection.query('UPDATE video v SET v.like =v.like+1 where id = ?',req.body.videoId, function(err){
            if(err)
              res.json('3'+err);
            else {
              res.json({"result":"success"});
            }
          });
        }
      });

    }
  });
});

module.exports = router;
