// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

// 显示繁忙提示
var showBusy = text => wx.showToast({
  title: text,
  icon: '系统繁忙，请稍等',
  duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
  title: text,
  icon: 'success'
});

getApp().globalData.isSafe = false;
// 显示失败提示
var showModel = (title, content) => {
  wx.hideToast();
  wx.hideLoading();
  wx.showModal({
    title,
    content: JSON.stringify(content),
    showCancel: false
  });
};

var that;

Page({
  data: {    
    equipments:"",
    onlineEquipments:"",
    sn:"",
    isPhoneValid: false,
    isOnly: false
  },
  
  onShow:function(){
    wx.showLoading({
      title: '正在检查设备'
    });
    this.waitOpenID(5, 1000);
  },

  waitOpenID: function (times, duration) {
    that = this;
    var count = 0;
    if (!getApp().globalData.openID) {
      var timer = setInterval(function () {
        count++;
        if (getApp().globalData.openID) {
          clearInterval(timer);
          that.getEquipmentsList();
        }
        if (count >= times) {
          clearInterval(timer);
          showModel('加载失败', '加载设备列表失败，请检查');
          return false;
        }
      }, duration);
    } else {
      that.getEquipmentsList();
    }
  },

  getEquipmentsList: function(){
    qcloud.request({
      url: config.service.listUrl,
      data: {
        openID: getApp().globalData.openID
      },
      success: (res) => {
        that = this;
        wx.hideLoading();
        if (res && res.data) {
          if (res.data) {
            getApp().globalData.equipments = res.data;
            if (res.data.length > 0) {

              var onlineEquipments = res.data.filter((val) => {
                return val.isOnline == "online";
              })
              if (onlineEquipments.length == 0) {
                that.setData({
                  sn: ""
                })
              }
            } else {
              that.setData({
                sn: ""
              })
            }
            that.setData({
              equipments: res.data,
              onlineEquipments: onlineEquipments,
              isOnly: onlineEquipments && (onlineEquipments.length == 1)
            });
            if (that.data.isOnly) {
              that.setData({
                sn: that.data.onlineEquipments[0]['sn_code']
              })
            }
          } else {
            that.setData({
              sn: ""
            })
          }
        } else {
          getApp().globalData.equipments = "";
        }
      },
      fail: (res) => {
        wx.showModel('加载失败', '未能成功获取到设备列表');
      }
    })
  },

  radioChange: function(e){
    var sn = this.data.onlineEquipments.length>0?e.detail.value:"";    
    this.setData({
      sn: sn        
    });    
  },

  checkPhoneValid: function(e){
    that = this;    
    if(/^\s*1[3456789]\d{9}\s*$/.test(e.detail.value)){
      that.setData({
        isPhoneValid:"valid"
      })
    }else{
      that.setData({
        isPhoneValid:"invalid"
      })
    }
  },

  formSubmit: function (e) {
    that = this;
    if (!getApp().globalData.isRegistered) {
      showModel("用户信息不完整", "您的身份信息尚不完整，无法进行绑定。请点击【返回首页】-> 【关于】补充信息");
      return false;
    } 
    //提交数据之前要对数据进行校验，验证数据的合理性
    if(!e.detail.value || !e.detail.value.name){
      showModel("输入信息不完整","病人姓名不可为空");
      return false;
    }

    var age = parseInt(e.detail.value.age);
    if (age && (age>120 || age<0)) {
      showModel("输入信息错误", "请检查病人年龄输入是否正确");
      return false;
    }

    if (e.detail.value.gender == "") {
      e.detail.value.gender = 2;
    }
    
    wx.request({
      url: config.service.inputUrl,
      method:"GET",
      data:{
        patientInfo: e.detail.value,
        openID: getApp().globalData.openID        
      },
      success: (res_input)=>{        
        if(res_input.data.repCode==0){
          showModel("设置病人信息成功","请操作采集盒开始采集数据");
        }else{
          showModel("设置病人信息失败","可能是服务器繁忙。请稍后再试，或者联系管理员");
        }
      }
    })
  },

  formReset: function(e){
    that = this;
    that.setData({
      sn: ''
    })
  },

  onPullDownRefresh: function(){
    that = this;
    getApp().onShow();
    setTimeout(function () {
      that.onShow();
      wx.stopPullDownRefresh();
    }, 1500);
  }
  
})

