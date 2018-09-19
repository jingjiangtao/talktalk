var express = require('express');
var app = express();
var router = require('./router/router');
var session = require('express-session');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000*60 }//cookie有效时间60分钟
}));

app.use(express.static('./public'));
app.use('/avatar',express.static('./avatar'));
app.use(express.static('./views'));


// vue初始化发起的get请求
app.get('/getindexdata', router.getIndexData);
// 注册业务
app.post('/dosign', router.doSign);
// 登录业务
app.post('/dologin', router.doLogin);
// 修改密码
app.post('/updatepwd', router.updataPassword);
// 退出登录
app.get('/quit', router.quit);
// 修改头像
app.post('/modiavatar', router.modifyAvatar);
// 发送动态
app.get('/sendstate', router.sendState);
//上传图片
app.post('/uploadImg',router.postImg);
//点赞
app.get('/dozan', router.doZan);
//取消点赞
app.get('/docancelzan', router.doCancelZan);
// 回复
app.get('/replay', router.replay);
// 删除一条说说
app.get('/deletetalk', router.deleteTalk);
// 列出所有用户
app.get('/allmembers', router.allMembers);
// 修改签名
app.get('/modifysign', router.modifySign);
//404
app.use(function(req, res, next){
    res.redirect('/');
});
app.listen(80);