var fs = require('fs');
const crypto = require('crypto');


generateUserTalk('./users.json','talks.json',20);


function generateUserTalk(usersPath,talksPath,userNum){
	var users = [];
	var talks = [];
	for(var i=0;i<userNum;i++){
		var username = getUserName(3);
		//var passwordb = randomNum(100000,999999).toString();
		var passwordb = '123456';
		var password = md5(passwordb);
		users.push({
			'username':username,
			'password':password,
            "sumZan" : 0,
            "sumTalk" : 1,
            "signature" : "",
			'avatar':'default.jpg'
		});
		talks.push({
			'username':username,
			'avatarPath':'default.jpg',
			'talkContent':getUserName(50),
			'time':new Date(),
			'zanNum':0,
			'zanPerson':[],
			'commentNum':0,
			'commentContent':[],
            "talkImages" : ""
		});
	}

	
	for(var i=0;i<users.length;i++){
		fs.appendFileSync(
			usersPath,
			'{' +
                '"username":"'+users[i].username+'",' +
                '"password":"'+users[i].password+'",' +
                '"sumZan":'+users[i].sumZan+','+
                '"sumTalk":'+users[i].sumTalk+','+
                '"signature":"'+users[i].signature+'",'+
                '"avatar":"default.jpg"' +
            '}');
		fs.appendFileSync(talksPath,
            '{' +
                '"username":"'+talks[i].username+'",' +
                '"avatarPath":"default.jpg",' +
                '"talkContent":"'+talks[i].talkContent+'",' +
                '"time":{$date:"'+talks[i].time.toISOString()+'"},' +
                '"zanNum":'+talks[i].zanNum+',' +
                '"zanPerson":['+talks[i].zanPerson+'],' +
                '"commentNum":'+talks[i].commentNum+',' +
                '"commentContent":['+talks[i].commentContent+'],' +
                '"talkImages":"'+talks[i].talkImages+'"' +
            '}');
	}
}

function getUserName(n){
	var result = '';
	for(var i=0;i<n;i++){
		result += letters()[randomNum(0, 25)];
	}
	return result;
}
function letters(){
	var letter = [];
	for (var i=0;i<26;i++){
		letter.push(String.fromCharCode(97+i));
	}
	return letter;
}

function randomNum(minNum,maxNum){   
    return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
}

function md5(bpassword){
    var md5 = crypto.createHash('md5');
    return md5.update(bpassword).digest('base64');
}