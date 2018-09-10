//DAO层
var MongoClient = require('mongodb').MongoClient;
var settings = require('./settings.js');

function _connectDB(callback){
	// Connection URL
	var url = settings.dburl;

	// Use connect method to connect to the server
	MongoClient.connect(url, function(err, client) {
	  if(err){
	  	console.log("连接失败");
	  	callback(err, null);
	  	return;
	  }
	  var db = client.db(settings.dbName);
	  callback(err, db);
	  client.close();
	  
	});
}

// 插入一条数据
exports.insertOne = function(collectionName, json, callback){
	_connectDB(function(err, db){
	    if(err){
	        callback(err, null);
	        return;
        }
		db.collection(collectionName).insertOne(json).then(function(result){
			console.log('插入成功');
			callback(err, result);
		});
	});
};

// 查询数据,args带有分页信息,如果args中的两个属性都为0，则代表不分页
exports.find = function(collectionName,json,args,callback){
	var result = [];
	if(arguments.length != 4){
		callback("应该接收4个参数",null);
		return;
	}

	var skipNumber = args.pageAmount * args.page;
	var limit = args.pageAmount;
	var sort = args.sort;
	_connectDB(function(err, db){
	    if(err){
	        callback(err, null);
	        return;
        }
		var cursor = db.collection(collectionName).find(json)
												  .skip(skipNumber)
												  .limit(limit)
												  .sort(sort);
		cursor.each(function(err, doc){
			if(err){
				callback(err, null);
			}
			if(doc != null){
				result.push(doc);	
			}else{
				callback(err, result);
			}
		});
	});
};

// 删除
exports.deleteMany = function(collectionName, json, callback){
	_connectDB(function(err, db){
        if(err){
            callback(err, null);
            return;
        }
		db.collection(collectionName).deleteMany(json)
		.then(function(result) {
		  callback(err, result);
		});
	});
};

//修改
exports.updateMany = function(collectionName, json1, json2, callback){
	_connectDB(function(err, db){
        if(err){
            callback(err, null);
            return;
        }
		db.collection(collectionName).updateMany(json1, json2)
		.then(function(result) {
			callback(err, result);
		});
	});
};

//获取某个集合有多少条数据
exports.getCount = function(collectionName, callback){
	_connectDB(function(err, db){
        if(err){
            callback(err, null);
            return;
        }
		db.collection(collectionName).find().count({}).then(function(result){
			callback(err, result);
		});
	});
};