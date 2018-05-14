
const Model = require("../models/Model");

exports.do = async (name) => {

    try {
        let data = await Model.sequelize.query("select * from " + name);
        console.log("query rows: ", data.length);
    } catch (err) {
        return process.done(err.message);
    }

    process.done();
}