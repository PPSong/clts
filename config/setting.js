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
    
    cdn:{
        res:"http://${host}:${port}"
    }
};
