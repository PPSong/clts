module.exports = {
    $VARS:{
        env:"test",
        site:"http://sprt-service.ugeez.cn",
        host:"0.0.0.0",
        port:3300
    },
    cors: {
        enable: false
    },

    model: {
        rdb: {
            host: "127.0.0.1",
            port: 3306,
            user: "root",
            password: "magicFish@SH2019",
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
};
