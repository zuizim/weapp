/**
 * @fileOverview 演示会话服务和 WebSocket 信道服务的使用方式
 */

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../config');

// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
});

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
});

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    });
};

var that;

/**
 * 使用 Page 初始化页面，具体可参考微信公众平台上的文档
 */
Page({

    /**
     * 初始数据，我们把服务地址显示在页面上
     */
    data: {
        userInfo: "",
        openID: "",
        unionID: "",
        isRegistered: false,
        phoneNumber: "",
        validSeconds: 0,
        verifyCode: "",
        isCodeValid: false,
        inviteCode: "",
        sendTime: ""
    },   

    onReady: function(){
      that = this;
      wx.showLoading({
        title: '正在获取用户信息'
      })
      var openID = getApp().globalData.openID;      
      var isRegistered = getApp().globalData.isRegistered;
      that.setData({
        userInfo: getApp().globalData.userInfo
      });
      wx.hideLoading();
      if(!openID){
        that.setData({
          openID: ""
        });
        showModel("无法正常使用","由于无法获取到您的身份信息，相应功能无法正常使用，非常抱歉");
        return false;
      }

      that.setData({
        openID: openID,
        unionID: getApp().globalData.unionID
      });   

      if (!isRegistered) {
        that.setData({
          isRegistered: false
        });
        showModel("无法正常使用", "由于你的身份信息不完整，部分功能尚不能正常使用。请尽快完善。");        
        return false;
      }

      that.setData({
        isRegistered: true,
        isCodeValid: "valid",
        inviteCode: that.data.userInfo.inviteCode || "noNeed"
      });      
    },

    setInviteCode: function (e) {      
      that = this;
      var inputedCode = e.detail.value;      
      if (inputedCode.length>0) {
        if (inputedCode.length==6) {          
          qcloud.request({
            url: config.service.checkInviteCodeUrl,
            data: {
              inviteCode: inputedCode
            },
            success: (res_code) => {
              if (res_code.data == "1") {
                that.setData({
                  inviteCode: inputedCode
                })
              } else {
                that.setData({
                  inviteCode: "wrong"
                })
              }
            }
          })  
        }else{
          that.setData({
            inviteCode: "wrong"
          })
        }              
      }
    },

    setPhoneNumber: function(e){
      that = this;      
      if (/^\s*1[3456789]\d{9}\s*$/.test(e.detail.value)) {
        that.setData({
          phoneNumber: e.detail.value.replace(/^(\s*)|(\s*)$/,"")          
        })        
      } else {
        that.setData({
          phoneNumber:"wrong"          
        })
      }
      that.setData({
        verifyCode: "",
        isCodeValid: false
      })
    },

    sendSmsCode: function(){     
      that = this;      
      if (that.data.phoneNumber.length==11) {
        if (that.data.sendTime == "") {
          that.setData({
            sendTime: +new Date()
          })
        } else {
          var now = +new Date();
          if ((now - that.data.sendTime) < 15000) {            
            return false;
          } else {
            that.setData({
              sendTime: +new Date()
            })
          }
        }
        
        that.setData({
          validSeconds: 30
        })        
        qcloud.request({
          url: config.service.sendSmsUrl,
          data:{
            phone: that.data.phoneNumber
          },
          success: (result) => {            
            if(result.data!=-1){
              /*开始验证码倒计时30秒 */
              var validSeconds = 30;
              var timer = setInterval(()=>{
                validSeconds -= 1;
                that.setData({
                  validSeconds: validSeconds
                });
                if (validSeconds <= 0) {
                  clearInterval(timer);
                }
              }, 1000)
            }
          }
        })
      }
    },

    checkVerifyCode: function (e) {
      //"校验验证码是否正确";
      that = this;
      if (e.detail.value.length==4) {
        qcloud.request({
          url: config.service.checkCodeUrl,
          data:{
            phoneNumber: that.data.phoneNumber,
            verifyCode: e.detail.value
          },
          success: (result)=>{
            console.dir(result.data);            
            that.setData(
              {isCodeValid:result.data?"valid":"invalid"}
            )            
          }
        })
      } else {
        that.setData(
          {isCodeValid:"invalid"}
        )
      }
    },

    formSubmit: function (e) {      
      that = this;
      if (e.detail.value && e.detail.value.fullname && e.detail.value.phone) {
        qcloud.request({
          url: config.service.infoUrl,
          data:{
            openID: that.data.openID,
            unionID: that.data.unionID,
            userInfo: e.detail.value
          },
          success: (result)=>{            
            if (result.data['code']==0) {
              showModel("提交成功", result.data['msg']);
              that.onSubmitSuccess(e.detail.value);
              getApp().onShow();
              that.onReady();
            } else {
              showModel("提交失败", result.data['msg']);
            }
          }
        })
      } else {
        showModel("提交失败", "信息不够完整，请检查");
      }
    },
    
    onSubmitSuccess: function (data) {     
      getApp().globalData.isRegistered = true;
      getApp().globalData.isSafe = true;
      getApp().globalData.userInfo.fullName = data.fullname;
      getApp().globalData.userInfo.userPhone = data.phone;
      getApp().globalData.userInfo.email = data.email; 
      getApp().globalData.userInfo.hospitalID = data.hospital;     
    },
    
    onPullDownRefresh: function () {
      that = this;
      getApp().onShow();
      that.onReady();
      setTimeout(function () {             
        wx.stopPullDownRefresh();
      }, 1500);
    }
});
