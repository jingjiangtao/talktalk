const crypto = require('crypto');

module.exports = function(bpassword){
    var md5 = crypto.createHash('md5');
    return md5.update(bpassword).digest('base64');
}