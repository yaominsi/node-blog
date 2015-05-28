var express = require('express');
var session = require('cookie-session');
var router = express.Router();
var Busboy = require('busboy');
var assert = require('assert');
var app_config=require('../lib/app_config.js').AppConfig;
var app_ops=require('../lib/app_config.js').Ops;
var Works=require('../lib/works.js').Works;
var About=require('../lib/about.js').About;
var Admin=require('../lib/admin.js').Admin;
var Navs=require('../lib/navs.js').Navs;
var FileKeeper=require('../lib/file_keeper.js').FileKeeper;
var Attaches=require('../lib/attaches.js').Attaches;
/* GET home page. */
router.get('/', function(req, res, next) {
  var ops=[];
  if (req.session.user) {
    ops=app_ops.home;
  };
  Works.load(null,function(err,result){
    res.render('index', { title: '珊的作品墙',items:result.works,navs:result.navs,user:req.session.user,ops:ops});
  });
});
//明细
router.get('/d/:id', function(req, res, next) {
  var id=req.params.id;
  var ops=[];
  if(req.session.user){
    ops=app_ops.detail(id);
  }
  if(!id){
    res.render('tip', { title: "我不知道你在做什么呀！",ops:ops});
    return;
  }
  console.log("start query...");
  Works.detail(id,function(err,result){
    res.render('detail', { title: result.title,id:req.params.id,item:result ,navs:result.navs,user:req.session.user,ops:ops});
  });
  
});
//about
router.get('/about', function(req, res, next) {
  var ops=[];
  if(req.session.user){
    ops=app_ops.about;
  }
  About.about(null,function(err,result){
    res.render('about', { title: '闲扯',item:result.item,navs:result.navs ,user:req.session.user,ops:ops});
  });
});
//about 编辑页面
router.get('/about/edit', function(req, res, next) {
  About.edit(null,function(err,result){
    res.render('about_edit', { title: 'About me 页面编辑~',item:result.item ,imgs:result.imgs,user:req.session.user});
  });
  
});
//about 提交
router.post('/about/submit', function(req, res, next) {
  var param={};
  param.title=req.param('title');
  param.desc=req.param('desc');
  param.imgids=req.param('imgids').split(',');
  About.submit(param,function(err,result){
    console.log(JSON.stringify(err));
  });
  res.redirect('/about');
});
//auth 
router.get('/l', function(req, res, next) {

  res.render('login', { title: '这是你吗？'});
});
//auth 提交认证
router.post('/auth', function(req, res, next) {
  var user={};
  user.name=req.param('name');
  user.pwd=req.param('pwd');
  Admin.login(user,function(err,result){
    if(result.ok){
      //set up session
      req.session.name=user.name;
      req.session.user=user;
      console.log(req.session.user.name);
      res.redirect('/');
    }else{
      res.render('tip', { title: '粗错辣，你造吗？',message:'这不是你，压根不认识你呀？',user:user});
    }
  });
  
});
//edit
router.get('/edit/:id', function(req, res, next) {
  var targetId=req.params.id;
  if (!req.session.user) {
    res.redirect("/l");
  };
  
  //判断是编辑还是添加  
  var item={title:"",label:"",desc:"",type:"",_id:"0",imgids:""};
  console.log(targetId);
  if(!targetId||targetId!='0'){
    Works.detail(req.params.id,function(err,result){
      res.render('edit', { title: 'edit blog',user:req.session.user,item:result,navs:result.navs,user:req.session.user});  
    });
  }else{
    console.log("new works");
    Navs.load(null,function(err,result){
      res.render('edit', { title: 'new blog new blog',user:req.session.user,item:item,navs:result,user:req.session.user});  
    })
  }
});

//delete
router.get('/del/:id', function(req, res, next) {
  var targetId=null;
  if (!req.session.user) {
    res.redirect("/l");
  };
  targetId=req.params.id;
  //判断是编辑还是添加  
  var item={};
  console.log(targetId);
  Works.del(targetId,function(err,result){
    res.render('tip', { title: '注意辣，删除了~~',message:'靠，删除了再也找不到了。。。。。。。。。',user:req.session.user,item:item});
  });
});
//导航管理
router.get('/nav', function(req, res, next) { 
  if (!req.session.user) {
    res.redirect("/l");
  };
  Navs.load(null,function(err,result){
    res.render('nav',{title:'左侧导航编辑',user:req.session.user,items:result});
  });
});

//导航管理
router.post('/nav/a/save', function(req, res, next) {
  
  if (!req.session.user) {
    res.redirect("/l");
  };
  var item={};
  item._id=req.param('_id');
  item.label=req.param('label');
  console.log("save nav:"+JSON.stringify(item));
  if(!item.label){
    res.redirect("tip",{user:req.session.user,message:"标签怎么也得写点东西吧？"});
  }
  item.del=false;
  Navs.saveSingle(item,function(err,result){
    if (err) {
      console.log(JSON.stringify(err));
    }
  })
  
  res.redirect('/nav');
});
router.post('/nav/save', function(req, res, next) {
  
  if (!req.session.user) {
    res.redirect("/l");
  };
  var ids=req.param('_ids');
  var idarray=ids.split(',');
  Navs.saveList(idarray,function(err,result){
    if (err) {res.render('error',{message:'message',error:err})};
    res.redirect('/nav');
  });
});
//upload file
router.post('/upload', function(req, res, next) {
  if (!req.session.user) {
    res.redirect("/l");
  };
  var busboy = new Busboy({ headers: req.headers });
  var fileMsg={};
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    var flen=0;
    var buffers=[];
    fileMsg={fieldname:fieldname,filename:filename,encoding:encoding,mimetype:mimetype};
    file.on('data', function(data) {
      buffers.push(data);
      flen=flen+data.length;
    });
    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
      var inx=0;
      var fbuffer=new Buffer(flen);
      for(var i in buffers){
        buffers[i].copy(fbuffer,inx);
        inx+=buffers[i].length;
      }
      FileKeeper.save({fileMsg:fileMsg,fileBuffer:fbuffer},function(err,result){
        Attaches.insert(fileMsg,function(err,result){
          res.setHeader('Content-Type', 'application/json');
          res.json(fileMsg);
        });
      });
    });
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + val);
    });
  busboy.on('finish', function() {
    console.log('Done parsing form!');
  });
  req.pipe(busboy);
});
//post
router.post('/item/submit', function(req, res, next) {
  if (!req.session.user) {
    res.redirect("/l");
  };
  var item={};
  item._id=req.param('id');
  item.title=req.param('title');
  item.label=req.param('label');
  item.desc=req.param('desc');
  item.type=req.param('type');
  if(req.param('imgids')){
    item.imgids=req.param('imgids').split(',');
  }
  Works.save(item,function(err,result){
    res.redirect("/d/"+result._id);
  });
  //判断是编辑还是添加  
});
module.exports = router;