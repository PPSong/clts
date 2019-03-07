/**
 * Created by Jay on 2018/1/20.
 */

const ExcelExport = require('./excel-export-es6');
const PATH = require("path");
const CP = require('child_process');

const J_CMD = PATH.resolve(__dirname, "../../node_modules/.bin/j");

exports.convertToXlsx = function(src, callBack) {
    return new Promise(function (resolve, reject) {
        let dest = src + ".xlsx";
        let cmd = `${J_CMD} -f "${src}" -X`;
        console.log("shell ---> " + cmd);
        CP.exec(cmd, function(err, stdout, stderr) {
            if (stderr) err = new Error(stderr);

            if (callBack) return callBack(err, err ? null : dest);

            if (err) return reject(err);
            resolve(dest);
        });
    });
}

exports.export = function(sheets, callBack) {
    return new Promise(function (resolve, reject) {
        ExcelExport.execute(sheets, function(err, file) {
            if (err) {
                if (callBack) return callBack(err);
                return reject(err);
            }
            if (callBack) return callBack(null, file);
            resolve(file);
        });
    });
}