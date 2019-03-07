const fs = require('fs');
const path = require('path');

const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cltp-test'
});

const exec = (sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    });
}

async function doWork() {
    let PP = await exec(`select * from PP where name = 'GAC'`);
    PP = PP[0];

    if (!PP) throw new Error("can't find a PP data named: GAC");

    let PPId = PP.id;

    let YJZHs = await exec(`select * from YJZH where PPId = ${PPId}`);
    for (let YJZH of YJZHs) {
        await exec(`delete from YJZHXGT where YJZHId = ${YJZH.id}`);
        await exec(`delete from GT_YJZH where YJZHId = ${YJZH.id}`);
    }
    await exec(`delete from YJZH where PPId = ${PPId}`);

    let EJZHs = await exec(`select * from EJZH where PPId = ${PPId}`);
    for (let EJZH of EJZHs) {
        await exec(`delete from EJZHXGT where EJZHId = ${EJZH.id}`);
        await exec(`delete from EJZH_FGTester where EJZHId = ${EJZH.id}`);
    }
    await exec(`delete from EJZH where PPId = ${PPId}`);

    let WLs = await exec(`select * from WL where PPId = ${PPId}`);
    for (let WL of WLs) {
        let WYWLs = await exec(`select * from WYWL where WLId = ${WL.id}`);
        for (let WYWL of WYWLs) {
            await exec(`delete from WYWLCZ where WYWLId = ${WYWL.id}`);
        }
        await exec(`delete from WYWL where WLId = ${WL.id}`);

        let WLBHs = await exec(`select * from WLBH where WLId = ${WL.id}`);
        for (let WLBH of WLBHs) {
            await exec(`delete from WLBHCZ where WLBHId = ${WLBH.id}`);
            await exec(`delete from WYWL where WLBHId = ${WLBH.id}`);
        }

        await exec(`delete from EJZH_SJWL where WLId = ${WL.id}`);

        await exec(`delete from DD_GT_WL where WLId = ${WL.id}`);
        await exec(`delete from DD_GT_WLSnapshot where WLId = ${WL.id}`);
    }
    await exec(`delete from WL where PPId = ${PPId}`);

    let FGTesters = await exec(`select * from FGTester where PPId = ${PPId}`);
    for (let FGTester of FGTesters) {
        await exec(`delete from DD_GT_FGTester where FGTesterId = ${FGTester.id}`);
        await exec(`delete from DD_GT_FGTesterSnapshot where FGTesterId = ${FGTester.id}`);
        await exec(`delete from EJZH_FGTester where FGTesterId = ${FGTester.id}`);
    }
    await exec(`delete from FGTester where PPId = ${PPId}`);

    let DPs = await exec(`select * from DP where PPId = ${PPId}`);
    for (let DP of DPs) {
        let WYDPs = await exec(`select * from WYDP where DPId = ${DP.id}`);
        for (let WYDP of WYDPs) {
            await exec(`delete from WYDPCZ where WYDPId = ${WYDP.id}`);
        }
        await exec(`delete from WYDP where DPId = ${DP.id}`);

        let DPBHs = await exec(`select * from DPBH where DPId = ${DP.id}`);
        for (let DPBH of DPBHs) {
            await exec(`delete from DPBHCZ where DPBHId = ${DPBH.id}`);
            await exec(`delete from WYDP where DPBHId = ${DPBH.id}`);
        }

        await exec(`delete from DD_DW_DP where DPId = ${DP.id}`);
        await exec(`delete from DD_DW_DPSnapshot where DPId = ${DP.id}`);
    }
    await exec(`delete from WYDP where PPId = ${PPId}`);

    let GTs = await exec(`select * from GT where PPId = ${PPId}`);
    for (let GT of GTs) {
        let KDXs = await exec(`select * from KDX where GTId = ${GT.id}`);
        for (let KDX of KDXs) {
            await exec(`delete from KDXCZ where KDXId = ${KDX.id}`);
        }
        await exec(`delete from KDX where GTId = ${GT.id}`);
        await exec(`delete from KDX where KDDId in (select id from KDD where GTId = ${GT.id})`);

        await exec(`delete from KDD where GTId = ${GT.id}`);

        await exec(`delete from WLQJFKT where GTId = ${GT.id}`);

        await exec(`delete from DDGTCL where GTId = ${GT.id}`);

        await exec(`delete from DW where GTId = ${GT.id}`);
    }

    await exec(`delete from PP_GTFX where PPId = ${PPId}`);

    let DDs = await exec(`select * from DD where PPId = ${PPId}`);
    for (let DD of DDs) {
        await exec(`delete from DDGTCL where DDId = ${DD.id}`);
        await exec(`delete from DD_DW_DP where DDId = ${DD.id}`);
        await exec(`delete from DD_DW_DPSnapshot where DDId = ${DD.id}`);
        await exec(`delete from DD_GT_FGTester where DDId = ${DD.id}`);
        await exec(`delete from DD_GT_FGTesterSnapshot where DDId = ${DD.id}`);
        await exec(`delete from DD_GT_WL where DDId = ${DD.id}`);
        await exec(`delete from DD_GT_WLSnapshot where DDId = ${DD.id}`);
        await exec(`delete from DPBH where DDId = ${DD.id}`);
        await exec(`delete from DPQJFKT where DDId = ${DD.id}`);
        await exec(`delete from KDX where DDId = ${DD.id}`);
        await exec(`delete from PP_GTFX where DDId = ${DD.id}`);
        await exec(`delete from WLBH where DDId = ${DD.id}`);
        await exec(`delete from WLQJFKT where DDId = ${DD.id}`);
    }

    let GZ_PPs = await exec(`select * from GZ_PP where PPId = ${PPId}`);
    let KFJL_PPs = await exec(`select * from KFJL_PP where PPId = ${PPId}`);
    let PPJL_PPs = await exec(`select * from PPJL_PP where PPId = ${PPId}`);

    await exec(`delete from GZ_PP where PPId = ${PPId}`);
    await exec(`delete from KFJL_PP where PPId = ${PPId}`);
    await exec(`delete from PPJL_PP where PPId = ${PPId}`);
    await exec(`delete from GT where PPId = ${PPId}`);

    let users = [...GZ_PPs, ...KFJL_PPs, ...PPJL_PPs];
    for (let user of users) {
        await exec(`delete from User where id = ${user.UserId}`); 
    }

    console.log('end');
    setTimeout(() => {
        process.exit();
    }, 100);
}


doWork();
