
var MongoClient = require('mongodb').MongoClient;
var app_config=require('./app_config.js').AppConfig;
var ObjectID = require('mongodb').ObjectID;
var CountDownLatch = require('./utils').CountDownLatch;
exports.About={
  about:function(param,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      db.collection('about').findOne({},{sort:[['_id','descending']]},function(err,about){
        if(err) callback(err);
        console.log("err result:"+JSON.stringify(err));
        db.collection('navs').find({del:false},{sort:[['ordering','ascending']]}).toArray(function(err,navs){
          db.close();
          if (err) {callback(err)};
          callback(err,{item:about,navs:navs});
        });

      });
    });
  },
  //
  edit:function(param,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      db.collection('about').findOne({},{sort:[['_id','descending']]},function(err,result){
        if (err) {callback(err)};
        console.log("error:"+JSON.stringify(err));
        db.collection('attaches').find({ref_id:result._id},{sort:[['ordering','ascending']]}).toArray(function(err,imgs){
          console.log("attaches:"+JSON.stringify(err));
          db.close();
          if (err) {callback(err)};
          result.imgs=imgs;
          callback(err,{item:result});
        });
      });
    });
  },
  //
  submit:function(param,callback){
    console.log(JSON.stringify(param));
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      if(err) callback(err);
      db.collection('attaches').findOne({_id:ObjectID(param.imgids[0])},{fields:{path:1}},function(err,result){
        if(err) callback(err);
        param.img=result.path;
        db.collection('about').insert([param],function(err,result){
          if(err) callback(err);
          var countDownLatch=CountDownLatch({top:param.imgids.length,step:1},function(err,result){
            db.close();
            callback();
          });
          for(var i in param.imgids){
            db.collection('attaches').updateMany({_id:ObjectID(param.imgids[i])},{$set:{ref_id:param._id,ordering:i}},function(err,result){
              console.log(JSON.stringify(err));
              countDownLatch.countDown();
            });
          }

        });
      });
      
    });
  }
};