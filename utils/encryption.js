var crypto = require('crypto');
var alg = 'aes256';
var k = 'Nr$F9q07:f3pJb5OwX3pv4/bGLbUPW7|mw5RyzI,rMi.mxt6BgZkOYLs';

module.exports = {
    Encrypt : function(toEncrypt){
        if (toEncrypt){
        var cipher = crypto.createCipher(alg, k);
        cipher.setAutoPadding(true);
        var crypted = cipher.update(toEncrypt, 'utf8', 'base64');
        crypted += cipher.final('base64');
        //console.log('Crypt : ' + toEncrypt + ' => '+ crypted);
        return (crypted);
        }
        else{
            return (null);
        }
    },
    Uncrypt : function(toUncrypt){
        if (toUncrypt){
        var decipher = crypto.createDecipher(alg, k);
        decipher.setAutoPadding(true);
        var dec = decipher.update(toUncrypt, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return (dec);
        }
        else{
            return (null);
        }
    },
}