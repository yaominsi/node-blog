/**
 * 编辑页面js整合
 **/

jQuery(function($){
  $('#item_edit_form').submit(function(){
    var imgids=[];
    $('#img_list_ul li').each(function(){
      if(this.id&&this.id>'0')
      imgids.push(this.id);
    });
    $('#imgids').value=imgids;
    $('#imgids_hidden').val(imgids.join(','));
    return true;
  });
  //图片编辑列表
  var imgTxtList = function(){
    this.con = $('.imgtxt-list');
    this.init();
  }
  imgTxtList.prototype = {
    /**
     * init
     **/
    init:function(){
      console.log('init');
      this.bindEvent();
    },

    /**
     * bindEvent
     **/
    bindEvent:function(){
      var self = this;

      this.con.delegate('a','click',function(event){
        event.stopPropagation();
        var tar = $(this),par = tar.parents('li');

        if(tar.hasClass('J_Top')){
          self.moveTop(par);
        }
        if(tar.hasClass('J_Btm')){
          self.moveBottom(par);
        }
        if(tar.hasClass('J_Preview')){
          //TODO
        }
        if(tar.hasClass('J_Del')){
          self.del(par);
        }
      });
    },

    /**
     * 添加一项
     **/
    add:function(txt,path,id){
      var html = '<li class="imgtxt" id="'+id+'">'+
              '<span class="img-name">'+ txt +'</span>'+
              '<div class="img-act">'+
                '<a class="icon t-btn J_Top">top</a>'+
                '<a class="icon b-btn J_Btm">bottom</a>'+
                '<a target="_blank" href="'+ path +'" class="J_Preview">预览</a>'+
                '<a href="javascript:void(0);" class="J_Del">删除</a>'+
              '</div>'+
            '</li>';
      this.con.append(html);
    },

    /**
     * 删除一项
     **/
    del:function(tar){
      tar.remove();
    },

    /**
     * 向上移动一项
     **/
    moveTop:function(tar){
      tar.insertBefore(tar.siblings().first('li'));
    },

    /**
     * 向下移动一项
     **/
    moveBottom:function(tar){
      tar.insertAfter(tar.siblings().last('li'));
    }
  }

  var imgtxt = new imgTxtList();

  //图片上传
  $('.file-btn').on('change',function(event){
    var fd = new FormData();
    //fd.append('img',this);
    fd.append('file',this.files[0]);
    $.ajax({
      url:'/upload',
      type:"POST",
      data:fd,
      dataType:"json",
      processData:false,
      contentType:false
    }).done(function(res){
      imgtxt.add(res.filename,res.path,res._id);
    });
  });


  //导航编辑列表
  var navCon = function(){
    this.con = $('.ed-tags');
    if(!this.con){return;}

    this.addBtn = this.con.find('.ed-tag-add');

    this.temp = '<div class="ed-tag-item">' + 
                  '<input type="text" value="" class="txt-input"/>' +
                  '<a class="edt-close">X</a>' +
                  '<a class="edt-act edt-hide">编辑</a>' +
                '</div>';
    this.init();
  }
  navCon.prototype = {

    init:function(){
      this.bindEvent();
    },

    bindEvent:function(){
      var self = this;

      this.addBtn.on('click',function(event){
        event.stopPropagation();
        $(self.temp).insertBefore(self.addBtn);
      });

      //dom处理
      this.con.delegate('.ed-tag-item','click',function(event){
        event.stopPropagation();

        var node = $(event.target),
            item = $(this);

        var txtInput = item.find('.txt-input');
        if(node.hasClass('edt-act')){ //编辑
          txtInput.val(item.find('.tag-name').val());
          txtInput.removeClass('edt-hide');
          item.find('.tag-name').addClass('edt-hide');
          return;
        }
        if(node.hasClass('edt-close')){ //删除
          item.remove(item);
          return;
        }

        //add保存
        if(!node.hasClass('.txt-input') && !item.find('.txt-input').hasClass('edt-hide')){
          self.edit(txtInput.val(),function(msg){
            item.find('.tag-name').val(txtInput.val());
            txtInput.addClass('edt-hide');
            item.find('.tag-name').removeClass('edt-hide');
          });
        }
      });

    },

    /**
     * 删除ajax
     **/
    remove:function(tar){
      $.ajax({
         type: "POST",
         url: "some.php",
         data: "id=John&location=Boston",
         success: function(msg){
           tar.remove();
         }
      });
    },

    /**
     * 编辑添加ajax
     **/
    edit:function(tar,fun){
      $.ajax({
         type: "POST",
         url: "some.php",
         data: "id=John&location=Boston",
         success: function(msg){
           fun && fun(msg);
         }
      });
    }
  }

  new navCon();

});