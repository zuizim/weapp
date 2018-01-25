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
    reports:"",
    defaultReports:"",
    searchedReports: "",
    patientName:"",    
    link:""
  },
  
  onLoad:function(options){
    that = this;     
    if(options.link){      
      var viewUrl = "https://devsvc.beneware.cn/weapp/publicWechat/mirrorPDF?";
      that.viewReport(viewUrl+"link="+options.link+"&name="+ options.name +"&time=" + options.time);
    }    
  },
  
  onShow(){
    that = this;
    wx.showLoading({
      title: '正在获取报告',
    });
    that.waitOpenID(5, 1000);
  },

  waitOpenID: function(times, duration){    
    that = this;
    var count = 0;
    if (!getApp().globalData.openID) {
      var timer = setInterval(function(){
        count++;        
        if (getApp().globalData.openID) {
          clearInterval(timer); 
          that.getReportsList();
        }
        if (count >= times) {
          clearInterval(timer); 
          showModel('加载失败','加载报告列表失败，请检查');
          return false;
        }
      }, duration);
    }else{
      that.getReportsList();
    }    
  },

  getReportsList: function(){
    wx.request({
      url: config.service.reportUrl,
      method: "GET",
      data: {
        openID: getApp().globalData.openID
      },
      success: (res) => {
        that.setData({
          reports: res.data,
          defaultReports: res.data
        });
        wx.hideLoading()
      },
      fail: (err) => {
        showModel('加载失败', '加载报告列表失败，请检查');
      }
    })
  },

  viewReport:function(url, reportData, format){    
    that = this;
    console.dir(reportData);
    var reportUrl = url + reportData['linkCode'] + '&formats=' + reportData['formats'].length + '&pages=' + reportData['pages'];    
    if (!format && reportData && reportData['formats'] && reportData['formats'].length==2) {
      var reportUrlArr = [];
      if(reportData['pages'] && reportData['pages']>1){
        showModel('温馨提示','这份报告共有'+reportData['pages']+'页，点击病人姓名可打开PDF文件');
        for (var i=1; i<=reportData['pages']; i++) {
          reportUrlArr.push(url + reportData['linkCode'] + '&formats=' + reportData['formats'].length + '&pages=' + i);
        }
      }else{
        reportUrlArr = [reportUrl];
      }
      wx.previewImage({
        current: "",
        urls: reportUrlArr
      });
    }else{
      reportUrl = url + reportData['linkCode'] + '&formats=1' + '&pages=';
      wx.downloadFile({
        url: reportUrl,
        success: function (res) {
          var filePath = res.tempFilePath
         
              wx.openDocument({
                filePath: filePath,
                success: function (res) {
                  console.log('打开文档成功');
                  wx.hideLoading();
                },
                fail: function (err) {
                  wx.hideLoading();
                }
              })            
        },
        fail: function () {
          wx.hideLoading();
        }
      })
    }
  },

  checkReport:function(e,format){
    that = this;
    wx.showLoading({
      title: '正在获取报告'
    });
    var token = e.target.dataset;
    if(token){
      qcloud.request({
        url: config.service.getLinkCodeByTokenUrl,
        data: token,
        success: function(res){
          if (res && res.data && res.data['linkCode'] && /^link=[\S]+&name/.test(res.data['linkCode'])){
            that.viewReport("https://devsvc.beneware.cn/weapp/publicWechat/mirrorReport?", res.data,format);
          }else{
            showModel("查看报告失败","很抱歉, 由于未能解析到有效的报告信息，无法查看报告。请联系我司解决。")
          }
          wx.hideLoading();
        },
        fail: function (res) {
          wx.hideLoading();
        }
      })     
    }
  },

  getPDFReport: function(e){
    this.checkReport(e, 'pdf');
  },
  
  bindPatientName: function(e){
    that = this; 
    that.setData({ 
      patientName: e.detail.value,
      reports: that.data.defaultReports 
    });    
    that.data.reports.forEach((val) => {     
      val.excluded = (val.PatientName.indexOf(e.detail.value) == -1);      
    });    
    that.setData({
      reports: that.data.reports
    })
  },

  searchFromServer: function(e){
    that = this;
    var patientName = e.detail.value.replace(/^\s*([\S]+)\s*$/,'$1');
    if(patientName.length>0){
      qcloud.request({
        url: config.service.getReportsByNameUrl,
        data: {
          name: patientName,
          openID: getApp().globalData.openID
        },
        success: (res)=>{
          console.dir(res.data);
          if(res && res.data){
            that.setData({
              searchedReports:res.data,
              reports: res.data
            })
          }else{
            that.setData({
              reports: ""
            })
          }
        }
      })
    }    
  },
  
  onPullDownRefresh: function () {
    that = this;
    getApp().onShow();
    setTimeout(function () {
      that.onReady();
      wx.stopPullDownRefresh();
    }, 1500);
  }
  
})

