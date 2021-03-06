
const Model = require("../models/Model");
import fs from 'fs';
import {
    DDStatus,
    DD_GT_WLStatus,
    DD_DW_DPStatus,
    User,
} from '../models/Model';
import moment from 'moment';

exports.do = async () => {

    try {

        const readFile = (path, opts = 'utf8') =>
            new Promise((res, rej) => {
                fs.readFile(path, opts, (err, data) => {
                    if (err) rej(err);
                    else res(data);
                });
            });

        const replaceAll = (str, target, replacement) =>
            str.replace(new RegExp(target, 'g'), replacement);

        const createViewAndProcedure = async () => {
            // 创建View
            const viewSql = await readFile(
                `${__dirname}/../tools/dbViewScript.sql`,
                'utf8',
            );
            await Model.sequelize.query(viewSql, {
                type: Model.sequelize.QueryTypes.SELECT,
            });
            // end 创建View

            // 创建Procedure
            let procedureSql = await readFile(`${__dirname}/../tools/dbProcedureScript.sql`);
            procedureSql = replaceAll(
                procedureSql,
                '_DDStatus.CS_',
                DDStatus.CS,
            );
            procedureSql = replaceAll(
                procedureSql,
                '_DDStatus.YSP_',
                DDStatus.YSP,
            );
            procedureSql = replaceAll(
                procedureSql,
                '_DD_GT_WLStatus.CS_',
                DD_GT_WLStatus.CS,
            );
            procedureSql = replaceAll(
                procedureSql,
                '_DD_DW_DPStatus.CS_',
                DD_DW_DPStatus.CS,
            );
            await Model.sequelize.query(procedureSql, {
                type: Model.sequelize.QueryTypes.SELECT,
            });
            // end 创建创建Procedure
        };

        await createViewAndProcedure();

        await Model.sequelize.query(`INSERT INTO User (username,password,JS, createdAt, updatedAt) VALUES ('admin','$2a$08$DZ4aJmJvcP7LpxIGJXN37O37A6JsF..LYumR1esoUjr1HuVUioW1C','系统管理员', '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}', '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}')`);

    } catch (err) {
        return process.done(err.stack || err.message);
    }

    process.done();
}