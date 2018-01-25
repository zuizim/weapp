/**
 * @fileOverview 微信小程序的入口文件
 */

var qcloud = require('./vendor/qcloud-weapp-client-sdk/index');
var config = require('./config');

var that;
App({
    /**
     * 小程序初始化时执行，获取用户信息，以及用户唯一标识
     */
  globalData: {      
    userInfo:"",
    openID: "" ,
    isSafe: true,
    isRegistered: false,
    unionID:"",
    equipments: ""    
  },

  onShow: function () {
    that = this;
    if (wx.getSetting) {
      wx.getSetting({
        success(res) {          
          if (!res.authSetting['scope.userInfo']) {
            wx.authorize({
              scope: 'scope.userInfo',
              success() {                
                that.onAuthorized();
              },
              fail() {
                wx.showModal({
                  title: '授权失败',
                  content: '由于您选择了拒绝授权，无法识别您的身份信息，相应功能无法正常使用。请谅解。',
                  showCancel: false
                })
              }
            })
          } else {
            that.onAuthorized();
          }
        }
      })  
    } else {
      that.onAuthorized();
    }
      
  },

  onAuthorized: function () {
    that = this;
    wx.login({
      success: function (res_login) {
        if (res_login && res_login.code) {
          wx.getUserInfo({
            withCredentials: true,
            success: (res_user) => {
              if (res_user) {
                getApp().globalData.userInfo = res_user.userInfo;
              }
              getApp().getOpenID(res_login.code, res_user.encryptedData, res_user.iv);
            }
          })
        } else {
          getApp().globalData.isSafe = false;
        }
      },
      fail: function (err) {
        getApp().globalData.isSafe = false;
      }
    })
  },

  getOpenID: function (loginCode, userEncryptedData, userIV) {
    that = this;
    qcloud.request({
      url: config.service.decryptUrl,
      method: "GET",
      data: {
        code: loginCode,
        encryptedData: userEncryptedData,
        iv: userIV
      },
      success: (res_decrypt) => {        
        if (res_decrypt && res_decrypt.data) {
          if (res_decrypt.data['repCode'] == 1) {
            
            getApp().globalData.openID = res_decrypt.data['openID'];
            getApp().globalData.unionID = res_decrypt.data['unionID'];
            getApp().globalData.isSafe = true;

          } else if (res_decrypt.data['repCode'] == 2) {

            getApp().globalData.isRegistered = true;
            getApp().globalData.isSafe = true;            
            var userInfo = res_decrypt.data['userInfo'];
            
            getApp().globalData.openID = userInfo.xOpenID;
            getApp().globalData.unionID = userInfo.unionID;
            getApp().globalData.userInfo.fullName = userInfo.fullName;
            getApp().globalData.userInfo.age = userInfo.age;
            getApp().globalData.userInfo.email = userInfo.email;
            getApp().globalData.userInfo.userPhone = userInfo.userPhone;
            getApp().globalData.userInfo.inviteCode = userInfo.inviteCode;
            getApp().globalData.userInfo.hospitalID = userInfo.hospitalID;

            that.getEquipmentList(userInfo.xOpenID);
            if(userInfo.unionID==''){
              wx.showModal({
                title: '请关注公众号',
                content: '关注【百慧医疗网络服务】公众号后，结合小程序使用，可以收到实时的报告提醒',
                showCancel: false
              });
            }
          }else{
            getApp().globalData.isSafe = false;
          }
        }
      }
    });   
  },

  getEquipmentList: function (openID) {
    that = this;
    qcloud.request({
      url: config.service.listUrl,
      data: {
        openID: openID
      },
      success: (res) => {
        that = this;
        if (res && res.data) {
          if (res.data) {
            res.data.sort(function (a, b) { return b.isOnline - a.isOnline });
            getApp().globalData.equipments = res.data;            
          }
        }
      }
    })
  }
  
});