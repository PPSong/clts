
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
            const procedureSql = await readFile(`${__dirname}/../tools/dbProcedureScript.sql`);
            const procedureSql1 = replaceAll(
                procedureSql,
                '_DDStatus\\.DSP_',
                DDStatus.DSP,
            );
            const procedureSql2 = replaceAll(
                procedureSql1,
                '_DDStatus\\.YSP_',
                DDStatus.YSP,
            );
            const procedureSql3 = replaceAll(
                procedureSql,
                '_DD_GT_WLStatus\\.CS_',
                DD_GT_WLStatus.CS,
            );
            const procedureSql4 = replaceAll(
                procedureSql1,
                '_DD_DW_DPStatus\\.CS_',
                DD_DW_DPStatus.CS,
            );
            await Model.sequelize.query(procedureSql2, {
                type: Model.sequelize.QueryTypes.SELECT,
            });
            // end 创建创建Procedure
        };

        await createViewAndProcedure();

        await Model.sequelize.query(`INSERT INTO User (username,password,JS, createdAt, updatedAt) VALUES ('admin','$2a$08$DZ4aJmJvcP7LpxIGJXN37O37A6JsF..LYumR1esoUjr1HuVUioW1C','系统管理员', '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}', '${moment(new Date()).format('YYYY-MM-DD hh:mm:ss')}')`);

    } catch (err) {
        return process.done(err.message);
    }

    process.done();
}