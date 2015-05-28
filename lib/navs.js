var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var app_config=require('./app_config.js').AppConfig;
var ObjectID = require('mongodb').ObjectID;
var CountDownLatch = require('./utils').CountDownLatch;

exports.Navs={
  load:function(param,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      db.collection('navs').find({del:false},{sort:[['ordering','ascending']]}).toArray(function(err,navs){
        console.log("navs:"+JSON.stringify(navs));
        db.close();
        callback(err,navs);
      });
    });
  },
  //
  saveSingle:function(param,callback){
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      console.log(JSON.stringify(err));
      if(!param._id||param._id.length==0){
        param._id=null;
        db.collection('navs').insert([param],function(err,result){
          db.close();
          if(err) callback(err);
          callback(err,result);
          console.log("insert nav err:"+err);
          console.log("insert nav result:"+result);
        });
      }else{
        db.collection('navs').update({_id:ObjectID(param._id)},{$set:{label:param.label}},function(err,result){
          db.close();
          if(err) callback(err);
          callback(err,result);
          console.log("update nav err:"+err);
          console.log("update nav result:"+result);
        });
      }
      
    });
  },
//
  saveList:function(param,callback){
    assert.ok(param,'参数为空');
    MongoClient.connect(app_config.mongodb_url, function(err, db) {
      db.collection('navs').updateMany({},{$set:{del:true}},function(err,result){
        if (err) {callback(err,result)};
        var countDownLatch=CountDownLatch({top:param.length},function(err,result){
          db.close();
        })
        for(var i in param){
          db.collection('navs').update({_id:ObjectID(param[i])},{$set:{ordering:i,del:false}},function(err,result){
            countDownLatch.countDown();
            if (err) {callback(err);};
          });
        }
        callback(err,result);
      })
    });
  }//,
}
