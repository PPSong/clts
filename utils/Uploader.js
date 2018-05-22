/**
 * Created by Jay on 25/04/2017.
 */

const Setting = global.SETTING;
Setting.upload = Setting.upload || {};

const Utils = require("../weroll/utils/Utils");

const Qiniu = require("qiniu");
Qiniu.conf.ACCESS_KEY = Setting.upload.ak;
Qiniu.conf.SECRET_KEY = Setting.upload.sk;

const DEBUG = global.VARS && global.VARS.debug;

exports.Qiniu = Qiniu;

exports.generateUploadToken = function(params, callBack) {
    return new Promise(function(resolve, reject) {
        var token;

        var type = params.type || "private";
        var filename = params.filename;
        var ext = params.ext;
        if (!String(filename).hasValue() && ext) {
            filename = Utils.randomString(12) + "." + ext;
        }

        if (!filename) {
            filename = Utils.randomString(12);
        }
        try {
            var scope = Setting.upload[type + "_bucket"];
            if (filename && filename != "") {
                scope += ":" + filename;
            }
            var mac = new Qiniu.auth.digest.Mac(Setting.upload.ak, Setting.upload.sk);
            var Uptoken = new Qiniu.rs.PutPolicy({ scope });
            Uptoken.insertOnly = 0;
            Uptoken.deadline = Date.now() + (params.expire || 3600);
            token = Uptoken.uploadToken(mac);
        } catch(err) {
            if (callBack) return callBack(err);
            return reject(err);
        }

        if (token) {
            var res = { token:token, key:filename };
            if (callBack) return callBack(null, res);
            resolve(res);
        } else {
            var err = new Error("unknown");
            if (callBack) return callBack(err);
            return reject(err);
        }
    });
}

exports.generateDownloadUrl = function(params, callBack) {
    return new Promise(function(resolve, reject) {
        var token;

        var type = "private";
        var privateDownloadUrl = "";

        try {
            var domain = Setting.upload[type + "_domain"];
            var mac = new Qiniu.auth.digest.Mac(Setting.upload.ak, Setting.upload.sk);
            var config = new Qiniu.conf.Config();
            var bucketManager = new Qiniu.rs.BucketManager(mac, config);
            var deadline = parseInt(Date.now() / 1000) + (params.expire || (Setting.upload.private_download_live_time || 3600)); 
            privateDownloadUrl = bucketManager.privateDownloadUrl(domain, params.file, deadline);

        } catch(err) {
            if (callBack) return callBack(err);
            return reject(err);
        }

        if (privateDownloadUrl) {
            if (callBack) return callBack(null, privateDownloadUrl);
            resolve(privateDownloadUrl);
        } else {
            var err = new Error("unknown");
            if (callBack) return callBack(err);
            return reject(err);
        }
    });
}

exports.upload = function(filePath, option, callBack) {
    callBack = arguments[arguments.length - 1];
    if (typeof callBack != "function") callBack = null;

    option = typeof option == "object" ? option : {};

    return new Promise(async function(resolve, reject) {

        try {
            var res = await exports.generateUploadToken(option);

            var extra = new Qiniu.io.PutExtra();
            Qiniu.io.putFile(res.token, res.key, filePath, extra, function(err, ret) {
                if(!err) {
                    // 上传成功， 处理返回值
                    if (callBack) return callBack(null, ret);
                    resolve(ret);
                } else {
                    // 上传失败， 处理返回代码
                    if (callBack) return callBack(err);
                    return reject(err);
                }
            });
        } catch (err) {
            if (callBack) return callBack(err);
            return reject(err);
        }

    });
}