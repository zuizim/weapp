/**
 * @fileOverview 演示会话服务和 WebSocket 信道服务的使用方式
 */

// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../../../config');

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

Page({
  data: {
    equipments: "",
    selectedEquipments: new Object()
  },
  
  onShow() {
    that = this;
    if (getApp().globalData.isRegistered) {
      that.setData({
        isRegistered: true,
        equipments: getApp().globalData.equipments
      })
    } else {
      that.setData({
        isRegistered: false,
        equipments: ""
      })
    }
  },

  checkboxChange: function(e){
    that = this;     
    that.data.equipments.forEach((val)=>{
      if(e.detail.value.indexOf(val.sn_code)!=-1){
        val.checked = true;
        if(that.data.selectedEquipments[val.sn_code]){
          val.nick_name = that.data.selectedEquipments[val.sn_code];
        }
      }else{
        val.checked = false;
        that.data.selectedEquipments[val.sn_code] = "";
        delete that.data.selectedEquipments[val.sn_code];
      }
    });    
    that.setData({
      equipments: that.data.equipments,
      selectedEquipments: that.data.selectedEquipments
    });    
  }, 
  
  bindNicknameInput: function(e){
    that = this;
    var obj = that.data.selectedEquipments;
    obj[e.target.id] = e.detail.value;
    that.setData({
      selectedEquipments: obj
    });    
  },

  formSubmit: function (e) {
    that = this;    
    
    if (e.detail.value.checkbox.length > 0) {
      qcloud.request({
        url: config.service.nickNameUrl,
        method: "GET",
        data: {'nickNames':this.data.selectedEquipments},
        success: (result)=>{
          /*别名设置成功后，需要同步更新equipments数据 */
          var res = true;          
          result.data.forEach((val)=>{
            if(val!=1){
              res = false;
            }
          })

          if(res){
            showModel("设置成功","别名已经更新成功");
            that.data.equipments.forEach((val)=>{                            
              that.data.selectedEquipments.hasOwnProperty(val.sn_code) && (val.nick_name = that.data.selectedEquipments[val.sn_code]);  
              val.checked = false;            
            })
            that.setData({
              equipments: that.data.equipments
            })
          }

          getApp().globalData.equipments = that.data.equipments;

        }
      })
    } else {
      showModel("请先选中设备", "系统未检测到选中设备，请检查");
    }
  },
  
  onPullDownRefresh: function () {
    that = this;
    getApp().onShow();
    setTimeout(function () {
      that.onShow();
      wx.stopPullDownRefresh();
    }, 1500);
  }
});