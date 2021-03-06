
const PATH = require("path");
const FS = require("fs");

const apiSchema = {
    ...require("../routes/apiSchema").apiSchema
};

const restfulAPISchema = {
    ...require("../routes/apiSchema").normalApiSchema
};

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

        //read response example
        let response = JSON.parse(FS.readFileSync(PATH.join(__dirname, "../tools_izz/PCAPI.json"), {encoding:"utf8"}));
        response = { ...response, ...JSON.parse(FS.readFileSync(PATH.join(__dirname, "../tools_izz/PCAPI.json"), {encoding:"utf8"})) };
        let returnExamples = {};
        for (let key in response) {
            let method = key.split('_')[0].toUpperCase();
            let name = key.replace(new RegExp(method + '_', 'i'), '').replace(/\/\d+/, '/:id');
            let def = { type:method, name:name, example:response[key] };
            returnExamples[method + '_' + name] = def;
        }

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

        SERVICE_LIST.push({
            index:0,
            group:"登录相关",
            methods:[
                {
                    desc:"账户登录",
                    index:0,
                    name:"auth/signin",
                    type:'POST',
                    paramsDesc: {
                        username:"账户名", password:"密码"
                    },
                    security: {
                        checkParams:{
                            username:"string", password:"string"
                        },
                        optionalParams: {},
                        needLogin: false
                    }
                },
                {
                    desc:"登录权限校验",
                    index:0,
                    name:"auth/check",
                    type:'GET',
                    paramsDesc: { },
                    security: {
                        checkParams:{ },
                        optionalParams: {},
                        needLogin: false
                    }
                },
                {
                    desc:"获取角色对应的后台页面菜单列表",
                    index:0,
                    name:"auth/menus",
                    type:'GET',
                    paramsDesc: { },
                    security: {
                        checkParams:{ },
                        optionalParams: {},
                        needLogin: false
                    }
                },
                {
                    desc:"注销登录",
                    index:0,
                    name:"auth/signout",
                    type:'POST',
                    paramsDesc: { },
                    security: {
                        checkParams:{ },
                        optionalParams: {},
                        needLogin: true
                    }
                }
            ]
        });

        console.log(returnExamples);

        let apiSchemaFile = FS.readFileSync(PATH.join(__dirname, "../routes/apiSchema.js"), {encoding:"utf8"});

        let group = { index:0, group:"POST类型API", methods:[] };
        let index = 0;
        _.map(apiSchema, (api, apiName) => {
            let method = {
                desc:"",
                index:1,
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
                },
                response: null
            };

            let returnExample = returnExamples['POST_' + apiName];
            if (returnExample && returnExample.example) {
                method.response = returnExample.example;
            }

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

        group = { index:2, group:"restful类型API", methods:[] };

        let restfulFiles = FS.readdirSync(PATH.join(__dirname, "../tables")) || [];

        let restfulDefs = [
            { name:"delete", desc:"删除一条{name}记录", type:"delete", args:{ id:"number" } },
            { name:"edit", desc:"更新一条{name}记录", type:"put", args:{ id:"number" } },
            { name:"getList", desc:"查询一组{name}", type:"get", args:{ curPage:"number", perPage:"number", keyword:'string' } },
            { name:"get", desc:"获取一条{name}记录", type:"get", args:{ id:"number" } },
            { name:"create", desc:"创建{name}", type:"post", args:{  } },
            { name:"enable", desc:"启用{name}", type:"post", args:{ id:"number" }, prefix:'enable/' },
            { name:"disable", desc:"禁用{name}", type:"post", args:{ id:"number" }, prefix:'disable/' }
        ];
        for (let i = 0; i < restfulFiles.length; i++) {
            let file = restfulFiles[i];
            if (file.indexOf("BaseTable") >= 0) continue;

            let name = file.replace("Table.js", "");
            restfulDefs.forEach((def) => {
                let method = {
                    desc:(def.desc || "").replace("{name}", name),
                    index:1,
                    name:(def.prefix || '') + name + (def.args && def.args.id ? "/:id" : ""),
                    type:def.type.toUpperCase(),
                    paramsDesc: {
                        id: "数据唯一id", curPage:"当前页码,0表示第一页", perPage:"每个个数,默认50"
                    },
                    security: {
                        checkParams:{
                            ...def.args
                        },
                        optionalParams: {},
                        needLogin: true
                    },
                    response: null
                };
                
                let schema = restfulAPISchema[name + def.name.charAt(0).toUpperCase() + def.name.substr(1)];
                if (schema) {
                    schema.properties = schema.properties || {};

                    let reuqires = {};
                    (schema.required || []).forEach(key => {
                        reuqires[key] = true;
                    });

                    _.map(schema.properties, (prop, propName) => {
                        if (reuqires[propName]) {
                            method.security.checkParams[propName] = prop.type;
                        } else {
                            method.security.optionalParams[propName] = prop.type;
                        }
                    });
                }

                let returnExample = returnExamples[method.type + '_' + method.name];
                if (returnExample && returnExample.example) {
                    method.response = returnExample.example;
                }

                group.methods.push(method);
            });
        }

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


