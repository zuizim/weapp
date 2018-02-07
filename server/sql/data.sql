/*创建绑定者信息表*/
set names utf8;
create database weapp character set utf8 collate utf8_general_ci;
use weapp;

drop table if exists binder_info;
create table binder_info(
  binderID int(8) primary key auto_increment,
  xOpenID varchar(32) unique not null,
  gOpenID varchar(32),
  unionID varchar(32),
  fullName varchar(32) default "",
  userPhone varchar(15) default "",
  email varchar(32) default "",
  age int(4) default 0,
  hospitalID varchar(64) ,
  inviteCode varchar(6) default "",
  createTime varchar(32) default "",
  loginCounts int(8),
  lastLoginTime varchar(32) default "",
  status int(2)
)

create index OpenID on binder_info (xOpenID);
alter table binder_info drop hospitalName;
alter table binder_info add hospitalCode int(8) AFTER hospitalID;

insert into binder_info values
(  null,"oi14R0RDT_UmZB4XUzilj8DJ5RAk","","olTiF1SNDqJywCXuAkm7VI19aMk4","陈军伟","18858184300","270664501@qq.com",32, "湖北中医院","JT0821","2017-09-12 16:30",0,"2017-09-12 16:31",0);


/*创建医院信息表*/
set names utf8;
drop table if exists hospitalInfo;
create table hospitalInfo(
  hospitalID int(10) primary key auto_increment,
  hFullName varchar(32) unique not null,
  hShortName varchar(32) unique default "",
  hAddress varchar(32) default "",
  hPhone varchar(15) default ""
);

create index hospitalName on hospitalInfo (hShortName);

insert into hospitalInfo values
( null, "杭州市第一人民医院","杭州市一","浙江省杭州市上城区浣纱路","0571-8888888");


/*创建心电工作站设备表*/
set names utf8;
drop table if exists pcecgInfo;
create table pcecgInfo(
  pcecgID int(8) primary key auto_increment,  
  snCode varchar(8) unique not null,
  hardwareVersion varchar(16) default "",
  softwareVersion varchar(16) default "",
  codetime varchar(14) not null,
  flagCode int(8),
  status boolean default false
);

create index sn on pcecgInfo (snCode);

insert into pcecgInfo values
( null,  "E7D17E21", "1.5","2.2","20170914112830","hello",true),
( null,  "E7D17E27", "1.5","2.2","20170914122830","hello",true),
( null,  "E7D17E32", "1.5","2.2","20170914142830","hello",true),
( null,  "E7D17E70", "1.5","2.2","20170914152830","hello",true);

/*创建绑定关系表*/
set names utf8;
drop table if exists bind_list;
create table bind_list(
  bindID int(10) primary key auto_increment,
  bindOpenID varchar(32) not null,
  sn_code varchar(8) unique not null,
  nick_name varchar(32) default "",
  bind_time varchar(32) not null,
  isOnline boolean default null
);

create index sn on bind_list (sn_code);

insert into bind_list values
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E80", '',"20170914153320" ,null ),
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E64", '',"20170914153320" ,null ),
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E74", '',"20170914153320" ,null ),
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E84", '',"20170914153320" ,null ),
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E94", '',"20170914153320" ,null ),
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E34", '',"20170914153320" ,null );

insert into bind_list values
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk", "E7D17E80", '',"20170914153320" ,null );

/*创建病人信息列表*/
set names utf8;
drop table if exists patientInfo;
create table patientInfo(
  patientID int(20) primary key auto_increment,
  patientName varchar(20) not null,
  patientAge varchar(12),
  patientPhone varchar(20),
  patientCode varchar(32),
  patientGender int(1),
  snCode varchar(16) not null,
  createTime varchar(32) not null
);

create index patient_name on patientInfo (patientName);

insert into patientInfo values
( null, "小王","36y",'843654665','hzdlwdkfdf',1,'E7D17E54','201709201629');

/*创建验证码信息列表*/
set names utf8;
drop table if exists verifycodelist;
create table verifycodelist(
  codeID int(20) primary key auto_increment,
  openID varchar(32) default 0,
  phoneNumber varchar(32) not null,
  verifyCode varchar(4) not null,
  createTime varchar(32) not null,
  isValid boolean default false
);

create index phone_number on verifycodelist (phoneNumber);

insert into verifycodelist values
( null, "oi14R0RDT_UmZB4XUzilj8DJ5RAk","15657111739","2665","2017-10-11 09:57:51",true);

set names utf8;
drop table if exists inviteCode;
create table inviteCode(
  codeID int(32) primary key auto_increment,
  codeContent varchar(6) unique not null
);

insert into inviteCode values
(  null, "JT0821" ),
( null, "BJ0203");

/*创建报告信息表*/
set names utf8;
drop table if exists reportList;
create table reportList(
  ReportID int(32) primary key auto_increment,
  ReportToken varchar(64) unique not null,
  RecorderSN varchar(32) not null,
  DataTypeID int(4) not null,
  RecordTime varchar(32),
  UploadedTime varchar(32),
  PatientName varchar(32),
  PatientGender int(4),
  PatientPhone varchar(20),
  PatientAge int(4),
  Conclusion varchar(512),
  ReportIsPushed int(4)
);

create index RecorderSN on reportList (RecorderSN);
drop index RecorderSN on reportList;
create index PatientName on reportList (PatientName);

/*创建公众号用户信息表
  "openid":"o_8ZjxKwd90z-C5zG_oh9gbv1BE0",
  "nickname":"蜗牛🐌",
  "sex":1,
  "language":"zh_CN",
  "city":"杭州",
  "province":"浙江",
  "country":"中国",
  "headimgurl":"http:\/\/wx.qlogo.cn\/mmopen\/vi_32\/Q0j4TwGTfTLJUicgP739INtNKziaRUodGiaCAZ0mSZ1icGKwTiaO0AfOb8O05EZVpPYh6CN8YibL5xQAdicYyZUuQ93og\/0",
  "privilege":[],
  "unionid":"olTiF1SNDqJywCXuAkm7VI19aMk4"}
  */
set names utf8;
drop table if exists publicWechatUserInfo;
create table publicWechatUserInfo(
  pID int(32) primary key auto_increment,
  openid varchar(64),
  unionID varchar(64),
  nickname varchar(32),
  sex int(4),
  language varchar(12),
  city varchar(16),
  province varchar(16),
  country varchar(16),
  headimgurl varchar(256),
  privilege varchar(128)  
);

create index openID on publicWechatUserInfo (openid);

use weapp;
set names utf8;
drop table if exists account;
create table account(
  aID int(16) primary key auto_increment,
  aUsername varchar(32) not null,
  aPassword varchar(32) not null,
  aHospitalName varchar(32),
  aHospitalID int(8),
  aCreatetime varchar(64),
  aStatus boolean default 1,
  aRemark varchar(64)
);

create index username on account (aUsername);

insert into account(aUsername, aPassword) values (
  "cjw", "c78c31ed02c53881441127e1da82ab8e"
);

select a.ReportToken from reportlist a left join bind_list b on a.RecorderSN=b.sn_code where b.bindOpenID='oi14R0RDT_UmZB4XUzilj8DJ5RAk';

select c.ReportToken from (binder_info a inner join bind_list b on a.xOpenID=b.bindOpenID ) inner join reportlist c on b.sn_code=c.RecorderSN where a.hospitalCode=3;