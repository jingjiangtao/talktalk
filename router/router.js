const formidable = require('formidable');
const date = require('silly-datetime');
const db = require('../models/db.js');
const md5 = require('../models/md5.js');
const fs = require('fs');
const ObjectID = require('mongodb').ObjectID;


// vue初始化发起的get请求处理
exports.getIndexData = function(req, res, next){

    db.find('talkList',{},{
        pageAmount:0,
        page:0,
        sort:{
            'time':-1,
        }
    },function(err, result){
        if(err){
            return;
        }

        for(var i=0;i<result.length;i++){
            result[i].commentContent.sort(function(a,b){
                var s = a.replyTime;
                var t = b.replyTime;
                if(s < t) return 1;
                if(s > t) return -1;
            });
        }

        res.json({
            'unlogin':!req.session.login,
            'username':req.session.username,
            'avatar':req.session.avatar,
            'listResult':result
        });
    });
};

// 发送动态业务
exports.sendState = function(req, res, next){
    var talkContent = req.query.talkContent;
    var talkImages = req.query.talkImages;
    db.insertOne('talkList',{
        'username':req.session.username,
        'avatarPath':req.session.avatar,
        'talkContent':talkContent,
        'time':new Date(),
        'zanNum':0,
        'zanPerson':[],
        'commentNum':0,
        'commentContent':[],
        'talkImages':talkImages
    }, function(err, result){
        if(err){
            res.json({'result':-1});
            return;
        }else if(result.result.n==1){
            // 插入成功
            res.json({'result':1,'_id':result.ops[0]._id});
        }else{
            res.json({'result':-1});
        }
    });
};

//上传图片
exports.postImg = function(req, res, next){

    var form = new formidable.IncomingForm();
    form.multiples = true;
    form.uploadDir = "./public/images";
    form.parse(req, function(err, fields, files) {
        if(err){
            console.log(err);
            return;
        }
        if(!files){
            return;
        }
        var fileList = [];
        if(files.imgs instanceof Array){
            fileList = files.imgs;
        }else{
            fileList.push(files.imgs);
        }
        var imgList = [];
        for(let i=0;i<fileList.length;i++){
            var time = date.format(new Date(), 'YYYYMMDDHHmmss');
            var ran = parseInt(Math.random() * 89999 + 10000);
            var extname = '.png';
            var prefix = "./public/images/"+ req.session.username + "/";
            var newName = prefix + time + ran + extname;
            if(!fs.existsSync(prefix)){
                fs.mkdirSync(prefix);
            }
            fs.renameSync(fileList[i].path, newName);
            imgList.push(newName.substring(8));
        }
        res.json({'result':1, 'imgList':imgList});
    });
};

// 点赞业务
exports.doZan = function(req, res, next){
    var _id = req.query._id;
    db.updateMany('talkList',{
        '_id':ObjectID(_id)
    },{
        $inc:{'zanNum': 1},
        $addToSet:{'zanPerson':req.session.username}
    }, function (err,result) {

        if(err){
            console.log(err);
            res.json({'result':-1});
            return;
        }else if(result.result.nModified==1){
            // 修改成功
            res.json({'result':1});
        }else{
            res.json({'result':-2});
        }
    });
};

// 取消点赞业务
exports.doCancelZan = function(req, res, next){
    var _id = req.query._id;
    db.updateMany('talkList',{
        '_id':ObjectID(_id)
    },{
        $inc:{'zanNum': -1},
        $pull:{'zanPerson':req.session.username}
    }, function (err,result) {

        if(err){
            console.log(err);
            res.json({'result':-1});
            return;
        }else if(result.result.nModified==1){
            // 修改成功
            res.json({'result':1});
        }else{
            res.json({'result':-2});
        }
    });
};

// 回复业务
exports.replay = function(req, res, next){
    var textContent = req.query.textContent;
    var replyUsername = req.query.replyUsername;
    var _id = req.query._id;
    var replyTime = new Date();
    var commentContent = {
        'replyUser': req.session.username,
        'replyToUser': replyUsername,
        'replyContent': textContent,
        'replyTime':replyTime
    };
    db.updateMany('talkList',{
        'username':replyUsername,
        '_id':ObjectID(_id)
    },{
        $addToSet:{'commentContent':commentContent},
        $inc:{'commentNum':1}
    },function(err, result){
        if(err){
            console.log(err);
            res.json({'result':-1});
            return;
        }else if(result.result.nModified==1){
            // 修改成功
            res.json({'result':1,'replyUser':req.session.username,'replyTime':replyTime});
        }else{
            res.json({'result':-2});
        }
    });
};


//删除说说业务
exports.deleteTalk = function(req, res, next){
    var _id = req.query._id;
    db.find('talkList',{'_id':ObjectID(_id)},{
        pageAmount:0,
        page:0,
        sort:{}
    }, function (err, result) {
        if(err){
            console.log(err);
            return;
        }
        var imageList = result[0].talkImages;
        if(imageList instanceof Array){
            for(let i=0;i<imageList.length;i++){
                var path = './public'+imageList[i];
                fs.unlinkSync(path);
            }
        }
    });

    db.deleteMany('talkList', {
        '_id':ObjectID(_id)
    },function(err, result){
        if(err){
            res.json({'result':-1});
            return;
        }else if(result.result.n==1){
            res.json({'result':1});
        }
    });
};

// 列出所有成员和必要信息
exports.allMembers = function(req, res, next){
    var userList = [];
    var talkList = [];
    db.find('user',{},{
        pageAmount:0,
        page:0,
        sort:{'username':1}
    },function(err, user){
        if(err){
            res.json({'result':-1});
            return;
        }
        userList = user;
        db.find('talkList',{},{
            pageAmount:0,
            page:0,
            sort:{'username':1}
        },function(err, result){
            if(err){
                res.json({'result':-1});
                return;
            }
            talkList = result;
            res.json({
                'result':1,
                'userlist':userList,
                'talklist':talkList
            });
        });
    });
};

// 注册业务
exports.doSign = function(req, res, next){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
       var username = fields.username;
       var password = fields.password;
       password = md5(password);

       db.find('user',{
           username:username
       },{
           pageAmount:0,
           page:0,
           sort:{}
       }, function(err, result){

           if(err){
               console.log(err);
               res.json({'result':-2});
               return;
           }
           if(result.length==0){
               db.insertOne('user',{
                   'username':username,
                   'password':password,
                   'avatar':'default.jpg'
               }, function(err, result){
                   if(err){
                       res.json({'result':-2});
                   }else{
                       req.session.login = true;
                       req.session.username = username;
                       req.session.avatar = result.ops[0].avatar;
                       res.json({'result':1});
                   }
               });
           }else{
               res.json({'result':-1});
           }
       });
    });
};

// 登录业务
exports.doLogin = function(req, res, next){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        var username = fields.username;
        var password = fields.password;
        password = md5(password);

        db.find('user',{
            username:username
        },{
            pageAmount:0,
            page:0,
            sort:{}
        }, function(err, result){

            if(err){
                console.log(err);
                res.json({'result':-3});
                return;
            }
            if(result.length==0){
                // 用户名不存在
                res.json({'result':-1});
            }
            else if(result[0].password==password){
                // 用户名密码正确
                req.session.login = true;
                req.session.username = username;
                req.session.avatar = result[0].avatar;
                res.json({'result':1});
            }
            else{
                // 密码错误
                res.json({'result':-2});
            }
        });
    });
};

// 修改密码业务
exports.updataPassword = function(req, res, next){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        if(err){
            res.json({'result':-1});
            return;
        }
        var oldPassword = md5(fields.oldPwd);
        var newPassword = md5(fields.newPwd);
        var username = req.session.username;
        db.updateMany('user', {
            'username':username,
            'password':oldPassword
        },{
            $set:{
                'password':newPassword
            }
        }, function(err, result){
            if(err){
                // 未知错误
                res.json({'result':-1});
                return;
            }
            else if(result.result.n==0){
                // 旧密码不正确
                res.json({'result':-2});
            }
            else if(result.result.nModified==0){
                // 新密码与旧密码相同
                res.json({'result':-3});
            }else{
                res.json({'result':1});
            }
        });
    });
};

// 退出登录
exports.quit = function(req, res, next){
    req.session.destroy(function(err){
        if(err){
            res.json({'result':-1});
            return;
        }
        res.json({'result':1});
    });
};

// 修改头像
exports.modifyAvatar = function(req, res, next){
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
        if (err) {
            console.log(err);
            res.json({'result': -1});
            return;
        }
        var path = '../talktalk/avatar/'+req.session.username+'/';
        if(!fs.existsSync(path)){
            fs.mkdirSync('../talktalk/avatar/'+req.session.username+'/');
        }
        var path = path+ req.session.username +'.png';
        var avatarPath = req.session.username + '/' + req.session.username + '.png';
        var base64 = fields.img.replace(/^data:image\/\w+;base64,/, "");//去掉图片base64码前面部分data:image/png;base64
        var dataBuffer = new Buffer(base64, 'base64'); //把base64码转成buffer对象，
        fs.writeFile(path,dataBuffer,function(err){//用fs写入文件
            if(err){
                console.log(err);
                res.json({'result':-1});
                return;
            }else{
                req.session.avatar = avatarPath;
                db.updateMany('talkList',{
                    'username':req.session.username
                },{
                    $set:{'avatarPath':avatarPath}
                }, function(err, result){
                    if(err){
                        return;
                    }
                });
                db.updateMany('user',{
                    'username':req.session.username
                },{
                    $set:{'avatar':avatarPath}
                }, function(err, result){
                    if(err){
                        res.json({'result':-1});
                        return;
                    }
                    if(result.result.n==1){
                        // 修改成功
                        res.json({'result':1});
                        return;
                    }else{
                        // 修改失败
                        res.json({'result':-1});
                        return;
                    }
                });
            }
        });
    });
};