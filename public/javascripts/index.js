$(window).load(function(){
  var init_params={
      itemSelector: '.isotope-item',
      layoutMode: 'masonry'
    };

  var loc=document.location.href;
  var inx=loc.indexOf('#');
  if(inx>0){
    var filterValue=loc.substr(inx+1);
    $('#filters li').removeClass('active');
    $("li[data-filter='."+filterValue+"']").addClass('active');
    if(filterValue=='*'){
      init_params.filter= filterValue;
    }else{
      init_params.filter= "."+filterValue;
    }
    
  }else{
    init_params.filter= "*";
  }

  var iso = $('.bd-container').isotope(init_params);
  

   $('#filters li').on('click', function(event) {
    event.stopPropagation();
    $('#filters li').removeClass('active');
    var filterValue = $( this ).attr('data-filter');
    iso.isotope({ filter: filterValue });
    $(this).addClass('active');
  });

  //

  $('.J_Edit').on('click',function(){
    var t=$(this);
    $('#nav_id_input').val(t.attr('_id'));
    $('#nav_label_input').val(t.attr('label'));
    $('#nav_save_btn').val('修改');
  });
  var layzr = new Layzr();
});
