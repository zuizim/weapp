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

/*定义that，用于固定this指向 */
var that;

Page({

  /*定义整个页面需要用到的数据 */
  data: {    
    equipments: "",
    sn: ""
  }, 

  /*页面一出现时进行的操作*/ 
  onShow() {
    that = this;
    if (getApp().globalData.isRegistered) {
      that.setData({        
        equipments: getApp().globalData.equipments
      })
    } else {
      that.setData({        
        equipments: ""
      })
    }
  },

  /*提交勾选表单 */
  formSubmit: function (e) {
    that = this;
    var selectedVal = e.detail.value.checkbox.filter(function (val) {
      return val != "";
    });

    if (selectedVal.length > 0) {
      if(getApp().globalData.isRegistered){
        that.unbindSn(e.detail.value.checkbox);
      }else{
        showModel("解绑失败", "您的用户信息不完整，请先去补充");
        return false;
      }      
    } else {
      showModel("请先选中设备", "系统未检测到选中设备，请检查");
      return false;
    }
  },

  
  /*解绑设备 */
  unbindSn:function(sn){    
    that = this;
    qcloud.request({
      url: config.service.unbindUrl,
      method: "GET",
      data: {
        "openID": getApp().globalData.openID,
        "sn": sn
      },
      success: (unbind_res) => {
        console.dir(unbind_res.data);
        if (unbind_res.data['affectedRows'] == sn.length) {
          showModel("解绑成功", "序列号为" + sn + "的心电工作站解绑成功");
          /*解绑后同时更新设备列表 */
          var oldEquipments = that.data.equipments;
          var newEquipments = [];
          oldEquipments.forEach((val) => {
            if (sn.indexOf(val.sn_code) == -1) {
              newEquipments.push(val)
            }
          });
          that.setData({
            equipments: newEquipments
          });
          getApp().globalData.equipments = newEquipments;
        }
      },
      fail: () => {
        showModel("解绑失败", "请联系管理员")
      }
    })
  },

  /*下拉刷新时更新数据源 */
  onPullDownRefresh: function () {
    that = this;
    getApp().onShow();
    setTimeout(function () {
      that.onShow();
      wx.stopPullDownRefresh();
    }, 1500);
  }

})
