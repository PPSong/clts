const FS = require('fs');
const Crypto = require("crypto");

String.prototype.fillData = function(key, value) {
    return this.replace(new RegExp("\\{" + key + "\\}", "g"), value);
}

String.prototype.hasValue = function() {
    return this != "undefined" && this != "null" && this !== "" && this.length > 0;
}

if (!Array.prototype.shuffle) {
    Array.prototype.shuffle = function() {
        for (let j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
        return this;
    };
}

exports.fileExists = function(path, callBack) {
    return new Promise(function(resolve) {
        FS.access(path, FS.F_OK, function(err) {
            if (err) {
                if (callBack) return callBack(false);
                return resolve(false);
            }
            if (callBack) return callBack(true);
            return resolve(true);
        });
    });
}

exports.md5 = function(str, option) {
    option = option || {};
    if (!option.asString) {
        let buf = new Buffer(str);
        str = buf.toString("binary");
    }

    let hash = Crypto.createHash("md5");
    return hash.update(str).digest("hex");
}

exports.randomString = function(len) {
    let parts = [
        [ 48, 57 ], //0-9
        [ 65, 90 ], //A-Z
        [ 97, 122 ]  //a-z
    ];

    let pwd = "";
    for (let i = 0; i < len; i++)
    {
        let part = parts[Math.floor(Math.random() * parts.length)];
        //trace(part[0], part[1], Math.floor(Math.random() * (part[1] - part[0])));
        let code = part[0] + Math.floor(Math.random() * (part[1] - part[0]));
        let c = String.fromCharCode(code);
        pwd += c;
    }
    return pwd;
}

exports.randomNumber = function(len) {
    let parts = [
        [ 48, 57 ] //0-9
    ];

    let pwd = "";
    for (let i = 0; i < len; i++)
    {
        let part = parts[0];
        //trace(part[0], part[1], Math.floor(Math.random() * (part[1] - part[0])));
        let code = part[0] + Math.floor(Math.random() * (part[1] - part[0]));
        let c = String.fromCharCode(code);
        pwd += c;
    }
    return pwd;
}

exports.sleep = function(time) {
    return new Promise(function (resolve) {
        setTimeout(function() {
            resolve();
        }, time);
    });
}