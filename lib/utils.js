var assert = require('assert');
exports.CountDownLatch=function(param,callback){
    assert.ok(param&&param.top&&param.top>0,"top 属性为空或小于1");
    var top=param.top;
    var step=param.step?param.step:1;
    function countDown(){
      top=top-step;
      if(top<=0){
        console.log('CountDownLatch trigger callback');
        callback();
      }
    }
    return {countDown:countDown};
};