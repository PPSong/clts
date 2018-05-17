
const PATH = require("path");
const FS = require("fs");

const apiSchema = require("../routes/apiSchema").apiSchema;

var SERVICE_LIST = null;

function renderAPIDoc(req, res, output) {
    var done = function() {
        var callback = require("url").parse(req.url, true).query.callback;
        res.writeHead(200, {
            "Content-Type":"text/plain; charset=utf-8"
        });
        res.end(callback + "(" + JSON.stringify(SERVICE_LIST) + ")");
    }
    if (SERVICE_LIST) {
        done();
    } else {
        renderRoot(req, res, err => {
            if (err) return output(err);
            done();
        });
    }
}

function renderRoot(req, res, complete) {

    if (!SERVICE_LIST) {
        SERVICE_LIST = [];

        /*
        {
            index:0,
            group: "xxx",
            methods:[
                {
                    desc:"",
                    index:0,
                    name:"api name",
                    type:'POST',
                    paramsDesc: {
                        a1:"...", a2:"..."
                    },
                    security: {
                        checkParams:{
                            a1:"string", b2:"number"
                        },
                        needLogin: true
                    }
                }
            ]
        }
        */

        let apiSchemaFile = FS.readFileSync(PATH.join(__dirname, "../routes/apiSchema.js"), {encoding:"utf8"});

        let group = { index:0, group:"POST类型API", methods:[] };
        let index = 0;
        _.map(apiSchema, (api, apiName) => {
            let method = {
                desc:"",
                index:0,
                name:"api name",
                type:'POST',
                paramsDesc: {
                    // a1:"...", a2:"..."
                },
                security: {
                    checkParams:{
                        // a1:"string", b2:"number"
                    },
                    optionalParams: {},
                    needLogin: true
                }
            };

            let tmp;
            let regexp = "//\\s?.*[\\r\\n]+\\s+" + apiName + "\\s?:\\s?\\{";
            let desc = apiSchemaFile.match(new RegExp(regexp, "im"));
            if (desc && desc[0]) {
                tmp = desc[0].split(/[\r\n]/);
                desc = tmp[0].replace("//", "").trim();
            }
            method.desc = desc;

            method.index = index;
            index ++;
            method.name = apiName;

            method.security.checkParams = {};

            api.properties = api.properties || {};

            let reuqires = {};
            (api.required || []).forEach(key => {
                reuqires[key] = true;
            });

            _.map(api.properties, (prop, propName) => {
                if (reuqires[propName]) {
                    method.security.checkParams[propName] = prop.type;
                } else {
                    method.security.optionalParams[propName] = prop.type;
                }
            });

            group.methods.push(method);
        });

        SERVICE_LIST.push(group);

    }
    var html = "";
    try {
        html = FS.readFileSync(PATH.join(__dirname, "../public/__test.html"), {encoding:"utf8"});
    } catch (exp) {
        return complete(exp);
    }
    complete(null, html);
}

exports.register = function(App) {
    let routers = [
        { url: "/__apidoc", view: "", handle: renderAPIDoc, needLogin:false },
        { url: "/__test", view: "__test", handle: renderRoot, needLogin:false }
    ];
    routers.forEach(router => {
        App.get(router.url, async (req, res) => {
            router.handle(req, res, (err, content) => {
                if (err) {
                    console.error(err);
                    res.writeHead(404);
                    res.end();
                    return;
                }

                if (typeof content === "object") {
                    res.json(content);
                } else {
                    res.end(content);
                }
            });
        });
    });
}


