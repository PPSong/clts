module.exports = {

    $VARS:{
        env:"localdev",
        site:"http://localhost:3000",
        host:"0.0.0.0",
        port:3300
    },

    env:"${env}",

    host:"${host}",
    port:"${port}",

    cors: {
        enable: true
    },

    model: {
        rdb: {
            host: "127.0.0.1",
            port: 3306,
            user: "root",
            password: "123456",
            database: "cltp",
            dialect: 'mysql',
            dialectOptions: {
                multipleStatements: true,
            },
            logging: false,
            insecureAuth: true,
            pool: {
                max: 5,
                idle: 30000,
                acquire: 60000
            }
        }
    },

    //site domain
    site:"http://${host}:${port}/",
    siteName:"SPRT",

    upload: {
        url:"http://up.qiniu.com",
        ak:"K0SgbYc-TMQ3pyEUvulnspTbDG_0vVJ4NRclfRbW",
        sk:"6XNYCpLVxC57L-uFYmXYB7-EcC6x5kIrLJqbA8Mi",
        private_bucket:"sprt",
        public_bucket:"",
        download_bucket:"",
        private_download_live_time: 3600,   //sec
        public_domain: "",
        private_domain: "http://sprt-oss-private.ugeez.cn",
        download_domain: ""
    },
    
    cdn:{
        res:"http://${host}:${port}"
    }
};
