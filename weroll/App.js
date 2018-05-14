/**
 * Created by Jay on 2015/9/25.
 */
const CLUSTER = require('cluster');
const PATH = require("path");
const _ = require("lodash");
const Configuration = require("./utils/Configuration");


global.__defineGetter__('_', function() {
    return _;
});

function App() {
    global.pm2 = process.env.hasOwnProperty("NODE_APP_INSTANCE") && process.env.NODE_APP_INSTANCE >= 0;
    global.workerID = global.pm2 ? process.env.NODE_APP_INSTANCE : (CLUSTER.worker ? (CLUSTER.worker.id - 1) : 0);

    var args = JSON.parse(JSON.stringify(process.argv));
    var runArgs = args.splice(2);
    global.VARS = {};
    for (var i = 0; i < runArgs.length; i++) {
        var key = runArgs[i];
        if (key.charAt(0) == "-") {
            key = key.substring(1);
            var temp = key.split("=");
            key = temp[0];
            var val = true;
            if (temp.length > 1) {
                val = temp[1];
                if (String(val) == "true") val = true;
                else if (String(val) == "false") val = false;
            }
            global.VARS[key] = val;
        }
    }
    console.log(global.VARS);
    if (!global.VARS.env) global.VARS.env = "localdev";

    if (!global.APP_ROOT) global.APP_ROOT = PATH.resolve(PATH.parse(process.mainModule.filename).dir, "../");

    global.requireModule = function(path) {
        return require(PATH.join(global.APP_ROOT, path));
    };

    global.SETTING = Configuration.init();

    global.getConfigPath = function(file) {
        return PATH.join(global.APP_ROOT, "config/" + global.VARS.env + "/" + file);
    }

    this.startupTasks = [];
}

App.prototype.addTask = function(func) {
    this.startupTasks.push(new Promise(async function(resolve, reject) {
        try {
            await func();
        } catch (err) {
            return reject(err);

        }
        resolve();
    }));
}

App.prototype.run = function(callBack) {
    Promise.all(this.startupTasks).then(() => {
        if (callBack) return callBack();
        console.log("(づ￣ 3￣)づ Server startup successfully. [env: " + global.VARS.env + "]");
    }).catch(err => {
        if (callBack) return callBack(err);
        console.error(":( Server startup fail :( ==> ", err);
    });
}

module.exports = App;