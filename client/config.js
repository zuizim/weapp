/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var beneware = 'https://devsvc.beneware.cn/weapp';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: { 
        //传递加密数据给服务器，以获取openID,
        decryptUrl: `${beneware}/wechat/decrypt`,
        //设备绑定接口
        bindUrl: `${beneware}/wechat/bind`,
        //设备列表接口
        listUrl: `${beneware}/wechat/equipmentList`,
        //报告列表接口
        reportUrl: `${beneware}/wechat/report`,
        //解除绑定接口
        unbindUrl: `${beneware}/wechat/unbind`,
        //病人信息录入接口
        inputUrl: `${beneware}/wechat/input`,
        //设置设备别名接口
        nickNameUrl:`${beneware}/wechat/nickName`,
        //安全验证
        safeCheckUrl: `${beneware}/wechat/safeCheck`,
        //用户补充信息
        infoUrl: `${beneware}/wechat/userInfo`,
        //用户发送短信验证码接口
        sendSmsUrl:`${beneware}/wechat/sendSmsTang`,
        //校验验证码是否正确的接口
        checkCodeUrl: `${beneware}/wechat/checkVerifyCode`,
        //校验邀请码是否正确的接口
        checkInviteCodeUrl: `${beneware}/wechat/checkInviteCode`,
        //检验序列号是否激活的接口
        isSnActivedUrl: `${beneware}/wechat/isSnActive`,
        //检验设备是否在线接口
        isSnOnlineUrl: `${beneware}/wechat/isSnOnline`,
        //根据token获取pdf文件地址
        getLinkCodeByTokenUrl: `${beneware}/publicWechat/getLinkCodeByToken`,
        //根据病人姓名查找报告
        getReportsByNameUrl: `${beneware}/wechat/getReportsByName`,
        //检测二维码是否有效
        isCodeValidUrl: `${beneware}/wechat/isCodeValid`
    }
};

module.exports = config;