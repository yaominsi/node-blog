var fs = require('fs');
var path = require('path');
var md5 = require('MD5');
var gm = require('gm');
var CountDownLatch = require('./utils').CountDownLatch;
var app_config=require('./app_config.js').AppConfig;
var calFileName=function(param){
  //prefix,md5,width,ext
  var p=null;
  if(param.width){
    p= param.prefix+param.md5+'!!w'+param.width+param.ext;
  }else{
    p= param.prefix+param.md5+param.ext;
  }
  console.log("path:"+p);
  return p;
}
exports.FileKeeper={
  save:function(param,callback){
    var countDownLatch =CountDownLatch({top:2},function(err,result){
      callback(null,param.fileMsg);
    });
    param.fileMsg.md5=md5(param.fileBuffer);
    var ext=path.extname(param.fileMsg.filename);
    param.fileMsg.path=calFileName({prefix:"/images/",md5:param.fileMsg.md5,width:app_config.img_s_width,ext:ext});
    param.fileMsg.path_d=calFileName({prefix:"/images/",md5:param.fileMsg.md5,width:app_config.img_d_width,ext:ext});
    param.fileMsg.path_o=calFileName({prefix:"/images/",md5:param.fileMsg.md5,ext:ext});
    fs.writeFile(calFileName({prefix:app_config.img_path,md5:param.fileMsg.md5,ext:ext}),param.fileBuffer,function(err){console.log(err)});
    
    gm(param.fileBuffer, 'image.jpg')
    .quality(app_config.img_quality)
    .resize(app_config.img_d_width)
    //.noise('laplacian')
    .write(calFileName({prefix:app_config.img_path,md5:param.fileMsg.md5,width:app_config.img_d_width,ext:ext}), function (err) {
      console.log('Created an image from a Buffer!');
      gm(calFileName({prefix:app_config.img_path,md5:param.fileMsg.md5,width:app_config.img_d_width,ext:ext})).size(function(err,result){
        param.fileMsg.d_height=result.height;
        countDownLatch.countDown();
      });
    });
    gm(param.fileBuffer, 'image.jpg')
    .quality(app_config.img_quality)
    .resize(app_config.img_s_width)
    //.noise('laplacian')
    .write(calFileName({prefix:app_config.img_path,md5:param.fileMsg.md5,width:app_config.img_s_width,ext:ext}), function (err) {
      console.log('Created an image from a Buffer!');
      gm(calFileName({prefix:app_config.img_path,md5:param.fileMsg.md5,width:app_config.img_s_width,ext:ext})).size(function(err,result){
        param.fileMsg.s_height=result.height;
        countDownLatch.countDown();
      });
    });
   
  }
}