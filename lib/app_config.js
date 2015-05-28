//
exports.AppConfig={
  mongodb_url:'mongodb://localhost:27017/test',
  static_img_path:'/Users/siyaomin/tmp',
  img_path:'/Users/siyaomin/tmp/images/',
  img_d_width:600,
  img_s_width:290,
  img_quality:80,
  port:80
};
//
exports.Ops={

  home:[
    {uri:"/edit/0",label:"NEW+"},
    {uri:"/nav",label:"NAV*"}
  ],
  detail:function(targetId){
    return [
      {uri:"/edit/0",label:"NEW+"},
      {uri:"/edit/"+targetId,label:"EDIT*"},
      {uri:"/del/"+targetId,label:"DELETE-"}
    ];
  },
  about:[
    {uri:"/about/edit",label:"EDIT*"}
  ]
};
