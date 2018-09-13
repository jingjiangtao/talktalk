

Vue.component('alert-box', {
    props:['text1','text2'],
    template: `
    <div class="alert alert-danger" role="alert">
         <strong>{{text1}}</strong><span>{{text2}}</span>
    </div>
  `
});


var indexShow = new Vue({
    el:'#show-index',
    data: {
        //页面初始化参数
        unlogin:true,
        username:'',
        avatar:'',
        listResult: [],
        //登陆注册输入框参数
        inputUsername:'',
        inputPassword:'',
        //发表动态文本框参数
        inputStatusContent:'',
        lastNum:300,
        // 控制三个页面切换参数
        mainContainer:true,
        myTalklist:false,
        memberlist:false,
        // 我的说说页面数据
        myTalkResult:[],
        //所有用户页面数据
        memberResult:[],
        //回复框中的值
        replyTextarea:'',
        //是否显示警告框
        alertDis:false,
        //警告框中的信息
        text1:'',
        text2:''
    },
    created: function () {
        var _this = this;
        $.get('/getindexdata',function(data, status){
            _this.unlogin = data.unlogin;
            _this.username = data.username;
            _this.avatar = data.avatar;
            _this.listResult = data.listResult;
            for(var i=0;i<_this.listResult.length;i++){
                if(_this.myTalkResult.indexOf(_this.listResult[i])==-1 &&
                    _this.listResult[i].username == _this.username){
                    _this.myTalkResult.push(_this.listResult[i]);
                }
            }
        });
    },
    methods: {
        //判断当前的动态点赞图标是否应该高亮
        isZan: function (result) {

            if(result.zanPerson.indexOf(this.username) != -1){
                return {
                    'zaned':true
                };
            }else{
                return {
                    'zaned':false
                };
            }
        },
        //给自己的动态添加样式
        isOwn:function(result){
            if(result.username==this.username){
                return {
                    'panel':true,
                    'panel-default':false,
                    'panel-primary':true
                }
            }else{
                return {
                    'panel':true,
                    'panel-default':true,
                    'panel-primary':false
                }
            }
        },
        //登录按钮点击
        loginMethod: function(){
            var _this = this;
            if(!this.inputUsername||!this.inputPassword){
                //alertDanger('注意！', '用户名和密码不能为空');
                this.alertDis = true;
                this.text1 = '注意！';
                this.text2 = '用户名和密码不能为空';
                return;
            }
            if(this.inputUsername.length<3 || this.inputPassword.length<6){
                //alertDanger('注意！','用户名要多于3位 密码要多于6位');
                this.alertDis = true;
                this.text1 = '注意！';
                this.text2 = '用户名要多于3位 密码要多于6位';
                return;
            }
            $.post('/dologin', {
                username: this.inputUsername,
                password: this.inputPassword
            }, function(data, status){
                if(data.result==1){
                    //登录成功
                    window.location.href="/";
                }
                else if(data.result==-1){
                    // 用户名不存在
                    //alertDanger('登录失败！', '用户名不存在');
                    _this.alertDis = true;
                    _this.text1 = '登录失败！';
                    _this.text2 = '用户名不存在';
                }
                else if(data.result==-2){
                    // 密码错误
                    //alertDanger('登录失败！', '密码错误');
                    _this.alertDis = true;
                    _this.text1 = '登录失败！';
                    _this.text2 = '密码错误';
                }else{
                    // 未知错误
                    //alertDanger('登录失败！', '未知错误');
                    _this.alertDis = true;
                    _this.text1 = '登录失败！';
                    _this.text2 = '未知错误';
                }
            });
        },
        // 注册按钮点击事件
        signinMethod: function(){
            var _this = this;
            if(!this.inputUsername||!this.inputPassword){
                //alertDanger('注意！', '用户名和密码不能为空');
                _this.alertDis = true;
                _this.text1 = '注意！';
                _this.text2 = '用户名和密码不能为空';
                return;
            }
            if(this.inputUsername.length<3 || this.inputPassword.length<6){
                //alertDanger('注意！','用户名要多于3位 密码要多于6位');
                _this.alertDis = true;
                _this.text1 = '注意！';
                _this.text2 = '用户名要多于3位 密码要多于6位';
                return;
            }
            $.post('/dosign', {
                username: this.inputUsername,
                password: this.inputPassword
            }, function(data, status){
                if(data.result==1){
                    window.location.href="/";
                }
                else if(data.result == -2){
                    // 未知错误
                    //alertDanger('注册失败', '未知错误');
                    _this.alertDis = true;
                    _this.text1 = '注册失败';
                    _this.text2 = '未知错误';
                }
                else{
                    // 注册失败
                    //alertDanger('注册失败', '用户名已存在');
                    _this.alertDis = true;
                    _this.text1 = '注册失败';
                    _this.text2 = '用户名已存在';
                }
            });
        },
        // 发送动态按钮点击事件
        sendStatus: function(){
            if(this.inputStatusContent.length==0){
                return;
            }
            var _this = this;
            $.get('/sendstate', {
                'talkContent': this.inputStatusContent
            }, function(data, status){
                if(data.result==1){
                    var newStatus = {
                        _id:data._id,
                        avatarPath:_this.avatar,
                        commentContent:[],
                        commentNum:0,
                        talkContent:_this.inputStatusContent,
                        time:(new Date()),
                        username:_this.username,
                        zanNum:0,
                        zanPerson:[]
                    };
                    _this.listResult.unshift(newStatus);
                    _this.myTalkResult.unshift(newStatus);
                    _this.inputStatusContent='';
                    _this.lastNum = 300;

                }else{

                }
            });
        },
        // 监听发送动态文本框的改变
        changeLastNum: function(){
            var size = this.inputStatusContent.length;
            this.lastNum = 300 - size;
        },
        // 退出账户
        quitMethod: function () {
            $.get('/quit',function(data, status){
                if(data.result==1){
                    window.location.href = '/';
                }else{
                    alertDanger('错误', '退出失败');
                }
            });
        },
        // 显示所有说说页面
        allTalk: function () {
            this.mainContainer = true;
            this.myTalklist = false;
            this.memberlist = false;
        },
        // 显示我的说说页面
        myTalk: function () {
            var _this = this;
            _this.mainContainer = false;
            _this.memberlist = false;
            _this.myTalklist = true;
        },
        // 显示成员列表页面
        members: function () {
            this.mainContainer = false;
            this.myTalklist = false;
            this.memberlist = true;
            var _this = this;
            $.get('/allmembers', function(data, status) {
                if (data.result == 1) {
                    var userList = data.userlist;
                    var talkList = data.talklist;
                    var rst = [];
                    for (var i = 0; i < userList.length; i++) {
                        var sumZan = 0;
                        var sumTalk = 0;
                        var username = userList[i].username;
                        var avatarPath = userList[i].avatar;
                        for (var j = 0; j < talkList.length; j++) {
                            if (talkList[j].username == username) {
                                sumZan += talkList[j].zanNum;
                                sumTalk++;
                            }
                        }
                        rst.push({
                            'username': username,
                            'avatarPath': avatarPath,
                            'sumZan': sumZan,
                            'sumTalk': sumTalk
                        });
                    }
                    rst.sort(function (a, b) {
                        var s = a.sumZan;
                        var t = b.sumZan;
                        if (s < t) return 1;
                        if (s > t) return -1;
                    });
                    _this.memberResult = rst;
                }
            });
        },
        //删除我的说说
        deleteMyTalk:function (currList) {
            var _this = this;
            $.get('/deletetalk', {
                '_id':currList._id
            }, function(data, status){
                if(data.result==1){
                    var index = _this.myTalkResult.indexOf(currList);
                    _this.myTalkResult.splice(index, 1);
                    index = _this.listResult.indexOf(currList);
                    _this.listResult.splice(index, 1);
                }
            });
        },
        // 点赞
        zan: function (currList) {
            var _this = this;
            if(currList.zanPerson.indexOf(_this.username) != -1){
                $.get('/docancelzan',{
                    '_id':currList._id
                }, function (data, status) {
                    if(data.result==1){
                        //取消赞高亮
                        currList.zanPerson.splice(currList.zanPerson.indexOf(_this.username),1);
                        currList.zanNum -= 1;
                        return;
                    }
                });
            }else{
                $.get('/dozan', {
                    '_id':currList._id
                }, function(data, status){
                    if(data.result==1){
                        // 添加赞高亮
                        currList.zanPerson.push(_this.username);
                        currList.zanNum += 1;
                        return;
                    }
                });
            }
        },
        //回复按钮
        replayBtn: function(currList){
            var _this = this;
            if(_this.replyTextarea.length==0){
                return;
            }
            $.get('/replay',{
                'textContent':_this.replyTextarea,
                'replyUsername': currList.username,
                '_id': currList._id
            }, function(data, status){
                if(data.result==1){
                    currList.commentContent.unshift({
                        'replyUser':data.replyUser,
                        'replyContent':_this.replyTextarea,
                        'replyTime':data.replyTime
                    });
                    currList.commentNum += 1;
                    _this.replyTextarea = '';
                }
            });
        },
        // 评论中回复
        replyToUser: function (comment) {
            this.replyTextarea = '@'+comment.replyUser+'： ';
        }
    }
});


// 修改密码模态框的确定按钮点击
$('#btn-updata-pwd').on('click', function(){
    var oldPwd = $('#old-pwd').val();
    var newPwd = $('#new-pwd').val();
    var okNewPwd = $('#ok-new-pwd').val();
    if(!oldPwd || !newPwd || !okNewPwd){
        modalDangerAlert('注意！', '输入框不能为空');
        return;
    }

    if(oldPwd.length < 6 || newPwd.length < 6 || okNewPwd.length < 6){
        modalDangerAlert('注意！','密码应不少于6位');
        return;
    }

    if(newPwd != okNewPwd){
        modalDangerAlert('注意！','两次输入的密码不一致');
        return;
    }

    $.post('/updatepwd', {
        oldPwd:oldPwd,
        newPwd:newPwd
    }, function(data, status){
        if(data.result==1){
            $('#modify-profile').modal('hide');
            $('.modal-alert').remove();
            window.location.href = '/';
        }
        else if(data.result==-1){
            modalDangerAlert('未知错误！','修改失败');
        }
        else if(data.result==-2){
            modalDangerAlert('修改失败！','旧密码不正确');
        }
        else if(data.result==-3){
            modalDangerAlert('修改失败！','新密码不能与旧密码相同');
        }
    });
});

// 模态框中的警告框
// function modalDangerAlert(strong, span){
//     $('.modal-alert').fadeIn();
//     $('.modal-alert > strong').text(strong);
//     $('.modal-alert > span').text(span);
// }


// 登录注册时出错的警告框
// function alertDanger(strong, span){
//     $('.alert > strong').text(strong);
//     $('.alert > span').text(span);
//     $('.alert').addClass('alert-danger').fadeIn();
// }



// 上传修改头像
//做个下简易的验证  大小 格式
$('#avatarInput').on('change', function (e) {
    var filemaxsize = 1024 * 5; //5M
    var target = $(e.target);
    var Size = target[0].files[0].size / 1024;
    if (Size > filemaxsize) {
        alert('图片过大，请重新选择!');
        $(".avatar-wrapper").childre().remove;
        return false;
    }
    if (!this.files[0].type.match(/image.*/)) {
        alert('请选择正确的图片!')
    } else {
        var filename = document.querySelector("#avatar-name");
        var texts = document.querySelector("#avatarInput").value;
        var teststr = texts; //你这里的路径写错了
        testend = teststr.match(/[^\\]+\.[^\(]+/i); //直接完整文件名的
        filename.innerHTML = testend;
    }

});
$(".avatar-save").on("click", function () {
    if($.trim($('#avatar-name').text()).length==0){
        return;
    }
    var img_lg = document.getElementById('imageHead');
    // 截图小的显示框内的内容
    html2canvas(img_lg, {
        allowTaint: true,
        taintTest: false,
        onrendered: function (canvas) {
            canvas.id = "mycanvas";
            //生成base64图片数据
            var dataUrl = canvas.toDataURL("image/jpeg");
            var newImg = document.createElement("img");
            newImg.src = dataUrl;
            imagesAjax(dataUrl)
        }
    });
});
function imagesAjax(src) {
    var data = {};
    data.img = src;
    data.jid = $('#jid').val();
    $.ajax({
        url: "/modiavatar",
        data: data,
        type: "POST",
        dataType: 'json',
        success: function (re) {
            window.location.href = '/';
        }
    });
}

