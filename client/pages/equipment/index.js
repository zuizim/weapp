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
    list: [
      {
        id: 'bind',
        name: '绑定设备',
        open: false,        
        url:"pages/bind/bind"
      }, {
        id: 'unbind',
        name: '解除绑定',
        open: false,        
        url: "pages/unbind/unbind"
      }, {
        id: 'list',
        name: '设备列表',
        open: false,        
        url: "pages/list/list"
      }
    ]    
  },
  
  kindToggle: function (e) {
    var id = e.currentTarget.id, list = this.data.list;
    for (var i = 0, len = list.length; i < len; ++i) {
      if (list[i].id == id) {
        list[i].open = !list[i].open
      } else {
        list[i].open = false
      }
    }
    this.setData({
      list: list
    });
  },

  onPullDownRefresh: function () {
    that = this;
    getApp().onShow();    
    wx.stopPullDownRefresh();    
  }
})

