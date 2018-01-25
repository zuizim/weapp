// 引入 QCloud 小程序增强 SDK
var qcloud = require('../../../../vendor/qcloud-weapp-client-sdk/index');

// 引入配置
var config = require('../../../../config');

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
    sn: '',
    scanData:'',    
    scanData:""
  },  

  /*扫码绑定 */
  scanCode: function () {
    that = this;
    var sn = "";
    var openID = getApp().globalData.openID;
    if (!openID) {
      showModel("无法绑定", "系统未能获取到您的身份信息，请检查");
      return false;
    }
    wx.scanCode({
      success: function (scan_res) {        
        if (scan_res && scan_res.result) {
          that.bindEquipment(scan_res.result, openID);
        } else {
          sn = "二维码中不包含设备序列号，请检查";
        }
        that.setData({
          sn: sn,
          scanData: scan_res.result
        })
      },
      fail: function (res) {
        that.setData({
          sn: "未能成功获取到二维码的数据，绑定失败"
        })
      }
    })
  },  

  /*绑定设备 */
  bindEquipment: function(scanData,openID){
    that = this;
    wx.request({
      url: config.service.bindUrl,
      data: {
        scanData: scanData,
        openID: openID
      },
      success: (res_bind) => {
        console.dir(res_bind.data);
        if (res_bind.data['code'] == 0) {
          showModel("绑定成功", res_bind.data['msg']);
          /*同时更新设备列表*/
          getApp().globalData.equipments.push({ 'sn_code': scanData['a'], 'nick_name': '', 'isOnline': true });
          /*直接跳转到录入页 */          
          setTimeout(function(){            
            wx.switchTab({
              url: '/pages/input/index'
            })
          },1500);
        } else {
          showModel("绑定失败", res_bind.data['msg']);          
        }
        scanData = JSON.parse(scanData)
        that.setData({
          sn: scanData['a']
        });
      },
      fail:(err)=>{
        console.dir(err);
        showModel("绑定失败","未能完成绑定，请检查");
        that.setData(
          {sn:"绑定设备失败"}
        )
      }
    })
  },

  onPullDownRefresh: function () {
    that = this;
    getApp().onShow();
    setTimeout(function () {
      that.onShow();
      wx.stopPullDownRefresh();
    }, 1500);
  }
})
