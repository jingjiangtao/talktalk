$(function(){

    // $.get('/showindex', function(data, status){
    //     console.log(data);
    // });

    /*下面是导航栏的js*/
    // 注册按钮的点击事件
    $('#btn-signin').on('click', function () {
        var username = $('#username').val();
        var password = $('#password').val();
        if(!username||!password){
            alertDanger('注意！', '用户名和密码不能为空');
            return;
        }
        if(username.length<3 || password.length<6){
            alertDanger('注意！','用户名要多于3位 密码要多于6位');
            return;
        }
        $.post('/dosign', {
            username: username,
            password: password
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
    });

    // 登录按钮的点击事件
    $('#btn-login').on('click', function () {
        var username = $('#username').val();
        var password = $('#password').val();
        if(!username||!password){
            alertDanger('注意！', '用户名和密码不能为空');
            return;
        }
        if(username.length<3 || password.length<6){
            alertDanger('注意！','用户名要多于3位 密码要多于6位');
            return;
        }
        $.post('/dologin', {
            username: username,
            password: password
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
    });
    // 回车键触发登录按钮
    $(document).keyup(function(event){
        if(event.keyCode ==13){
            $("#btn-login").trigger("click");
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
    function modalDangerAlert(strong, span){
        $('.modal-alert').fadeIn();
        $('.modal-alert > strong').text(strong);
        $('.modal-alert > span').text(span);
    }

    //退出登录按钮
    $('#btn-quit').on('click', function(){
        $.get('/quit',function(data, status){
            if(data.result==1){
                window.location.href = '/';
            }else{
                alertDanger('错误', '退出失败');
            }
        });
    });

    // 登录注册时出错的警告框
    function alertDanger(strong, span){
        $('.alert > strong').text(strong);
        $('.alert > span').text(span);
        $('.alert').addClass('alert-danger').fadeIn();
    }

    $('.nav-list > li').on('click', function(){
        $('.navbar-right > li').removeClass('active');
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');
    });

    $('.navbar-right > li').on('click', function(){
        $('.nav-list > li').removeClass('active');
        $(this).siblings('li').removeClass('active');
        $(this).addClass('active');
    });

    $('#modi-avatar').on('click', function(){
        $('#modify-profile').modal('hide');
        $('#avatar-modal').modal('show');
    });

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
    $('.panel-username').each(function(index, value){
        if($(value).text()==$('.own-username').text()){
            // $(value).parent().addClass('own-talk');
            $(value).parents('.panel').removeClass('panel-default');
            $(value).parents('.panel').addClass('panel-primary');
        }
    });


    // 监听文本框改变
    $('#text-content').on('keyup', function () {
        var size = $(this).val().length;
        $('#last-num').text($(this).attr('maxlength')-size);
    });

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

    // 发送动态按钮点击事件
    $('#btn-send').on('click', function(){
        if($.trim($('#text-content').val()).length==0){
            return;
        }
        $.get('/sendstate', {
            'talkContent':$('#text-content').val()
        }, function(data, status){
            if(data.result==1){
                window.location.href = '/';
            }else{

            }
        });
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
    // 我的说说按钮点击
    $('#my-talk-btn').on('click', function(){
        $('.main-container, .member-list').hide();
        $('.my-talklist').show();
        $('.my-talklist > .panel-list').empty();
        $.get('/mytalklist', function(data, status){
            if(data.result == 1){
                // 查询成功
                var result = data.data;
                if(result.length==0){
                    $('.my-talklist > .panel-list').append('<h2>还未发表说说</h2>');
                    return;
                }

                for(var i=0;i<result.length;i++){
                    $('.my-talklist > .panel-list').append(
                        '<div class="panel panel-primary">' +
                        '        <span class="_id">'+result[i]._id+'</span>'+
                        '        <div class="panel-heading">' +
                        '            <img src="/avatar/'+result[i].avatarPath+'" class="img-circle avatar-img panel-avatar">' +
                        '            <span class="panel-username">'+result[i].username+'</span>' +
                        '        </div>' +
                        '        <div class="panel-body">' +
                        '            '+result[i].talkContent+''+
                        '        </div>' +
                        '        <div class="panel-footer">' +
                        '            <span class="time">'+new Date(result[i].time).toLocaleString()+'</span>' +
                        '            <span class="icon-two pull-right">' +
                        '                <a href="javascript:;" class="delete-talk">删除</a>'+
                        '                <a href="javascript:;" class="zan-number">' +
                        '                    <i class="glyphicon glyphicon-thumbs-up"></i>' +
                        '                    <span>'+result[i].zanNum+'</span>' +
                        '                </a>' +
                        '                <!--动态改变id-->' +
                        '                <a href="javascript:;" data-toggle="collapse" data-target="#mylist-collapsePanel'+i+'"' +
                        '                   aria-expanded="false" aria-controls="collapsePanel" class="comment-a">' +
                        '                    <i class="glyphicon glyphicon-comment"></i>' +
                        '                    <span class="comment-number">'+result[i].commentNum+'</span>' +
                        '                </a>' +
                        '            </span>' +
                        '            <div class="collapse comment-coll" id="mylist-collapsePanel'+i+'">' +
                        '                <div class="comment-content">' +
                        '                    <ul class="list-group comment-list">' +
                        '                    </ul>' +
                        '                </div>' +
                        '            </div>' +
                        '        </div>' +
                        '    </div>'
                    );

                    for(var j=0; j<result[i].commentContent.length;j++) {
                        $('.my-talklist > .panel-list .comment-list').eq(i).append(
                            '<li class="list-group-item">' +
                            '    <a class="reply-user" href="javascript:;">'+result[i].commentContent[j].replyUser+'：</a>' +
                            '    <span class="reply-content">'+result[i].commentContent[j].replyContent+'</span>' +
                            '    <div class="reply-time">'+result[i].commentContent[j].replyTime.toLocaleString()+'</div>' +
                            '</li>'
                        );
                    }
                }
            }
        });
    });

    // 成员列表按钮点击
    $('#member-list-btn').on('click', function(){
        $('.main-container, .my-talklist').hide();
        $('.member-list').show();
        $('.member-list > .panel-list').empty();
        $.get('/allmembers', function(data, status){
            if(data.result==1){
                var userList = data.userlist;
                var talkList = data.talklist;
                var rst = [];
                for(var i=0;i<userList.length;i++) {
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
                        'username':username,
                        'avatarPath':avatarPath,
                        'sumZan':sumZan,
                        'sumTalk':sumTalk
                    });
                }
                rst.sort(function(a,b){
                    var s = a.sumZan;
                    var t = b.sumZan;
                    if(s < t) return 1;
                    if(s > t) return -1;
                });
                for(var i=0;i<rst.length;i++) {
                    $('.member-list > .panel-list').append(
                        '<div class="panel panel-default">' +
                        '            <div class="panel-heading">' +
                        '                <h4 class="panel-title">NO.'+(i+1)+'</h4>' +
                        '            </div>' +
                        '            <div class="panel-body list-inline">' +
                        '                <li class="userinfo-img">' +
                        '                    <img src="/avatar/' + rst[i].avatarPath + '" class="img-circle">' +
                        '                </li>' +
                        '                <li class="user-info-li">' +
                        '                    <ul class="user-info">' +
                        '                        <li class="username text-primary"><a href="javascript:;"> ' + rst[i].username + ' </a></li>' +
                        '                        <li class="brief-userinfo">总共发过<span class="text-primary">' + rst[i].sumTalk + '</span>条动态</li>' +
                        '                        <li class="brief-userinfo">获得过<span class="text-primary">' + rst[i].sumZan + '</span>次赞</li>' +
                        '                    </ul>' +
                        '                </li>' +
                        '            </div>' +
                        '        </div>'
                    );
                }
            }
        });
    });

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