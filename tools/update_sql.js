
const App = require('../weroll/App');

const fs = require('fs');

const mainApp = new App();

const Setting = global.SETTING;

const Model = require('../models/Model');
const DDStatus = Model.DDStatus;
const DD_GT_WLStatus = Model.DD_GT_WLStatus;
const DD_DW_DPStatus = Model.DD_DW_DPStatus;

const sequelize = Model.sequelize;

const replaceAll = (str, target, replacement) =>
  str.replace(new RegExp(target, 'g'), replacement);

const createViewAndProcedure = async () => {

    // 创建View
    // const viewSql = fs.readFileSync(
    //     `${__dirname}/../tools/dbViewScript.sql`,
    //     'utf8',
    // );
    // await sequelize.query(viewSql, {
    //     type: sequelize.QueryTypes.SELECT,
    // });
    // end 创建View

    // 创建Procedure
    let procedureSql = fs.readFileSync(`${__dirname}/../tools/dbProcedureScript.sql`, 'utf8');
    procedureSql = replaceAll(
        procedureSql,
        '_DDStatus\\.CS_',
        DDStatus.CS,
    );
    procedureSql = replaceAll(
        procedureSql,
        '_DDStatus\\.YSP_',
        DDStatus.YSP,
    );
    procedureSql = replaceAll(
        procedureSql,
        '_DD_GT_WLStatus\\.CS_',
        DD_GT_WLStatus.CS,
    );
    procedureSql = replaceAll(
        procedureSql,
        '_DD_DW_DPStatus\\.CS_',
        DD_DW_DPStatus.CS,
    );
    await sequelize.query(procedureSql, {
        type: sequelize.QueryTypes.SELECT,
    });
    // end 创建创建Procedure

    console.log('sql procedure updated');

    setTimeout(() => {
        process.exit();
    }, 100);
};

createViewAndProcedure();