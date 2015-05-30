var MongoClient = require('mongodb').MongoClient;
var app_config=require('./app_config.js').AppConfig;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
var CountDownLatch = require('./utils').CountDownLatch;
exports.Works={

  //全量加载
  load:function(params,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      db.collection('works').find({}).toArray(function(err,works){
        console.log("works load err:"+JSON.stringify(err));
        console.log("works:"+(works?works.length:0));
        db.collection('navs').find({del:false},{sort:[['ordering','ascending']]}).toArray(function(err,navs){
          db.close();
          callback(err,{works:works,navs:navs});
        });
      });
    });
  },
  //
  detail:function(_id_str,callback){
    //断言
    var id=ObjectID(_id_str);
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      db.collection('works').findOne({_id:id},function(err,works){
        console.log(err);
        if(err) callback(err);
        var item=works;
        db.collection('attaches').find({ref_id:id},{fields:{path:1,path_d:1,filename:1,d_height:1},sort:[['ordering','ascending']]}).toArray(function(err,imgs){
          console.log("attaches err:"+JSON.stringify(err));
          console.log("attaches:"+JSON.stringify(imgs));
          item.imgs=imgs;
          
          db.collection('navs').find({del:false},{sort:[['ordering','ascending']]}).toArray(function(err,navs){
            db.close();
            item.navs=navs;
            callback(err,item);
          });
        });
      });
    });
  },
  //
  //全量加载
  del:function(params,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      console.log(JSON.stringify(err));
      db.collection('works').remove({_id:ObjectID(params)},function(err,result){
        db.close();
        callback(err,result);
      });
    });
  },
  //
  save:function(item,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      assert.equal(null, err);
      if(item.imgids){
        db.collection('attaches').findOne({_id:ObjectID(item.imgids[0])},{fields:{path:1,s_height:1}},function(err,result){
          item.img=result.path;
          item.s_height=result.s_height?result.s_height:app_config.img_s_width;
          if(!item._id||item._id!='0'){
            item._id=ObjectID(item._id);
            db.collection('attaches').updateMany({ref_id:item._id},{$set:{ref_id:null}},function(err,result){
              db.collection('works').update({_id:item._id},{$set:item},function(err,result){
            
                //更新附件表
                if(item.imgids){
                  var countDownLatch=CountDownLatch({top:item.imgids.length},function(err,callback){
                    db.close();
                  });
                  for(var i in item.imgids){
                    db.collection('attaches').update({_id:ObjectID(item.imgids[i])},{ $set: { ref_id : item._id,ordering:i}},function(err,result){
                      countDownLatch.countDown();
                      console.log("update att err:"+err); 
                    });          
                  }
                }
                callback(err,item);
              });
            
            });
          }else{
            console.log('创建works：'+item._id);
            item._id=null;
            db.collection('works').insert([item],function(err,result){
              //更新附件表
              if(item.imgids){
                var countDownLatch=CountDownLatch({top:item.imgids.length},function(err,callback){
                    db.close();
                  });
                for(var i in item.imgids){
                  db.collection('attaches').update({_id:ObjectID(item.imgids[i])},{ $set: { ref_id : item._id,ordering:i }},function(err,result){
                    countDownLatch.countDown();
                    console.log(JSON.stringify(err));
                  });          
                }
              }
              callback(err,item);
            });
          }
        });
      }
    });
  }//,
}