$(function(){

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
            lastNum:500,
            // 控制三个页面切换参数
            mainContainer:true,
            myTalklist:false,
            memberlist:false,
            // 我的说说页面数据
            myTalkResult:[]
        },
        created: function () {
            var _this = this;
            $.get('/getindexdata',function(data, status){
                _this.unlogin = data.unlogin;
                _this.username = data.username;
                _this.avatar = data.avatar;
                _this.listResult = data.listResult;
            });
        },
        methods: {
            //判断当前的动态点赞图标是否应该高亮
            isZan: function (result) {

                if(result.zanPerson.indexOf(this.username) != -1){
                    return {
                        'zaned':true,
                        'zan-number':true
                    };
                }else{
                    return {
                        'zaned':false,
                        'zan-number':true
                    };
                }
            },
            //登录按钮点击
            loginMethod: function(){
                if(!this.inputUsername||!this.inputPassword){
                    alertDanger('注意！', '用户名和密码不能为空');
                    return;
                }
                if(this.inputUsername.length<3 || this.inputPassword.length<6){
                    alertDanger('注意！','用户名要多于3位 密码要多于6位');
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
                        alertDanger('登录失败！', '用户名不存在');
                    }
                    else if(data.result==-2){
                        // 密码错误
                        alertDanger('登录失败！', '密码错误');
                    }else{
                        // 未知错误
                        alertDanger('登录失败！', '未知错误');
                    }
                });
            },
            // 注册按钮点击事件
            signinMethod: function(){
                if(!this.inputUsername||!this.inputPassword){
                    alertDanger('注意！', '用户名和密码不能为空');
                    return;
                }
                if(this.inputUsername.length<3 || this.inputPassword.length<6){
                    alertDanger('注意！','用户名要多于3位 密码要多于6位');
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
                        alertDanger('注册失败', '未知错误');
                    }
                    else{
                        // 注册失败
                        alertDanger('注册失败', '用户名已存在');
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
                        _this.listResult.unshift({
                            avatarPath:'default.jpg',
                            commentContent:[],
                            commentNum:0,
                            talkContent:_this.inputStatusContent,
                            time:(new Date()),
                            username:_this.username,
                            zanNum:0,
                            zanPerson:[]
                        });
                        _this.inputStatusContent='';
                    }else{

                    }
                });
            },
            // 监听发送动态文本框的改变
            changeLastNum: function(){
                var size = this.inputStatusContent.length;
                this.lastNum = 500 - size;
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
                $.get('/mytalklist', function(data, status) {
                    if (data.result == 1) {
                        // 查询成功
                        _this.myTalkResult = data.data;
                    }
                });
            },

            // 显示成员列表页面
            members: function () {
                this.mainContainer = false;
                this.myTalklist = false;
                this.memberlist = true;
            }
        }
    });


    /*下面是导航栏的js*/


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
    function modalDangerAlert(strong, span){
        $('.modal-alert').fadeIn();
        $('.modal-alert > strong').text(strong);
        $('.modal-alert > span').text(span);
    }


    // 登录注册时出错的警告框
    function alertDanger(strong, span){
        $('.alert > strong').text(strong);
        $('.alert > span').text(span);
        $('.alert').addClass('alert-danger').fadeIn();
    }

    // $('.nav-list > li').on('click', function(){
    //     $('.navbar-right > li').removeClass('active');
    //     $(this).siblings('li').removeClass('active');
    //     $(this).addClass('active');
    // });
    //
    // $('.navbar-right > li').on('click', function(){
    //     $('.nav-list > li').removeClass('active');
    //     $(this).siblings('li').removeClass('active');
    //     $(this).addClass('active');
    // });
    //
    // $('#modi-avatar').on('click', function(){
    //     $('#modify-profile').modal('hide');
    //     $('#avatar-modal').modal('show');
    // });

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



    /*下面是主页面的js*/
    //给自己的动态添加样式
    // $('.panel-username').each(function(index, value){
    //     if($(value).text()==$('.own-username').text()){
    //         // $(value).parent().addClass('own-talk');
    //         $(value).parents('.panel').removeClass('panel-default');
    //         $(value).parents('.panel').addClass('panel-primary');
    //     }
    // });


    // 点赞图标点击事件
    $('.zan-number').on('click', function(){
        var _this = $(this);
        var _id = _this.parents('.panel').find('._id').text();
        if(_this.hasClass('zaned')){
            $.get('/docancelzan',{
                '_id':_id
            }, function (data, status) {

                if(data.result==1){
                    _this.removeClass('zaned');
                    _this.find('span').text(parseInt(_this.find('span').text())-1);
                    return;
                }
            });
        }else{
            $.get('/dozan', {
                '_id':_id
            }, function(data, status){
                if(data.result==1){
                    _this.addClass('zaned');
                    _this.find('span').text(parseInt(_this.find('span').text())+1);
                    return;
                }
            });
        }
    });

    //评论图标点击事件
    $('.panel-list').on('click','.comment-a', function(){
        if($(this).parent('.icon-two').next('.comment-coll').hasClass('in')){
            $(this).css('color', '#000000bf');
        }else{
            $(this).css('color', '#E20000');
        }
    });


    // 回复按钮点击事件
    $('.replay-btn').on('click', function(){
        var _this = $(this);
        var textContent = _this.prev('textarea').val();
        var replyUsername = _this.parents('.panel').find('.panel-username').text();
        var _id = _this.parents('.panel').find('._id').text();
        _this.prev('textarea').val('');
        if(textContent.length==0){
            return;
        }
        $.get('/replay',{
            'textContent':textContent,
            'replyUsername': replyUsername,
            '_id': _id
        }, function(data, status){
            if(data.result==1){
                _this.parents('.comment-content').find('.comment-list').prepend(
                    '<li class="list-group-item">\
                        <a class="reply-user" href="javascript:;">'+data.replyUser+'：</a>\
                        <span class="reply-content">'+textContent+'</span>\
                        <div class="reply-time">'+new Date(data.replyTime).toLocaleString()+'</div>\
                    </li>'
                );
                var commentNum = _this.parents('.panel-footer').find('.comment-number');
                commentNum.text(parseInt(commentNum.text())+1);
            }
        });
    });

    // 在评论里回复
    $('.comment-list').on('click', '.reply-user', function(){
        var textarea = $(this).parents('.comment-content').find('.reply-textarea');
        textarea.val('@'+$(this).text()+' ');
        textarea.focus();
    });

    //头像点击事件
    $('#avatar-btn').on('click', function(){
        $('#my-talk-btn').trigger('click');
    });


    // 成员列表按钮点击
    // $('#member-list-btn').on('click', function(){
    //     $('.main-container, .my-talklist').hide();
    //     $('.member-list').show();
    //     $('.member-list > .panel-list').empty();
    //     $.get('/allmembers', function(data, status){
    //         if(data.result==1){
    //             var userList = data.userlist;
    //             var talkList = data.talklist;
    //             var rst = [];
    //             for(var i=0;i<userList.length;i++) {
    //                 var sumZan = 0;
    //                 var sumTalk = 0;
    //                 var username = userList[i].username;
    //                 var avatarPath = userList[i].avatar;
    //                 for (var j = 0; j < talkList.length; j++) {
    //                     if (talkList[j].username == username) {
    //                         sumZan += talkList[j].zanNum;
    //                         sumTalk++;
    //                     }
    //                 }
    //                 rst.push({
    //                     'username':username,
    //                     'avatarPath':avatarPath,
    //                     'sumZan':sumZan,
    //                     'sumTalk':sumTalk
    //                 });
    //             }
    //             rst.sort(function(a,b){
    //                 var s = a.sumZan;
    //                 var t = b.sumZan;
    //                 if(s < t) return 1;
    //                 if(s > t) return -1;
    //             });
    //             for(var i=0;i<rst.length;i++) {
    //                 $('.member-list > .panel-list').append(
    //                     '<div class="panel panel-default">' +
    //                     '            <div class="panel-heading">' +
    //                     '                <h4 class="panel-title">NO.'+(i+1)+'</h4>' +
    //                     '            </div>' +
    //                     '            <div class="panel-body list-inline">' +
    //                     '                <li class="userinfo-img">' +
    //                     '                    <img src="/avatar/' + rst[i].avatarPath + '" class="img-circle">' +
    //                     '                </li>' +
    //                     '                <li class="user-info-li">' +
    //                     '                    <ul class="user-info">' +
    //                     '                        <li class="username text-primary"><a href="javascript:;"> ' + rst[i].username + ' </a></li>' +
    //                     '                        <li class="brief-userinfo">总共发过<span class="text-primary">' + rst[i].sumTalk + '</span>条动态</li>' +
    //                     '                        <li class="brief-userinfo">获得过<span class="text-primary">' + rst[i].sumZan + '</span>次赞</li>' +
    //                     '                    </ul>' +
    //                     '                </li>' +
    //                     '            </div>' +
    //                     '        </div>'
    //                 );
    //             }
    //         }
    //     });
    // });

    // 删除说说按钮点击
    $('.panel-list').on('click', '.delete-talk', function(){
        var _this = $(this);
        var _id = _this.parents('.panel').find('._id').text();

        $.get('/deletetalk', {
            '_id':_id
        }, function(data, status){
            if(data.result==1){
                _this.parents('.panel').remove();
            }
        });
    });
});