const Tools = require('./excel/tools');
const path = require('path');
const bCrypt = require('bcryptjs');
const moment = require('moment');

const mysql = require('mysql2');

// create the connection to database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'cltp-test'
});

const salt = '$2a$10$Z/xrAJb2z5DUlDz3sPY7UO';

const exec = (sql) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        })
    });
}

const readExcel = (file) => {
    return new Promise(async resolve => {
        let folder = 'C:\\Users\\Jay\\Desktop\\SPRT导入数据确认';
        let workbook;
        let sheets = {};
        //转换 xls -> xlsx
        workbook = await Tools.readExcelFromLocal(path.resolve(folder, file));

        //workbook = await readExcelFromLocal(xlsx);
        workbook.eachSheet(page => {
            sheets[page.name] = page;
        });

        resolve(sheets);
    });
}

const findTopId = (table) => {
    return new Promise(async resolve => {
        let topId = 1;
        let rows = await exec(`select id from ${table} order by id desc limit 1`);
        if (rows && rows.length > 0) {
            topId = rows[0].id + 1;
        }

        resolve(topId);
    });
}

const findId = (sql) => {
    return new Promise(async resolve => {
        let rows = await exec(sql);
        let id = rows && rows[0] ? rows[0].id : null;

        resolve(id);
    });
}

async function work() {
    let sheets, sheet, rows, topId;

    let now = moment(Date.now()).format('YYYY-MM-DD hh:mm:ss');

    // rows = await exec('select id from User order by id desc limit 1');
    topId = await findTopId('User');

    sheets = await readExcel('SPRT-用户信息表.xlsx');
    sheet = sheets['品牌经理_客服经理'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let PPName = Tools.getCellText(row, 0);
        if (!PPName) continue;
        let JS = Tools.getCellText(row, 1);
        if (!JS) continue;
        let username = Tools.getCellText(row, 2);
        if (!username) continue;

        const salt = '$2a$10$Z/xrAJb2z5DUlDz3sPY7UO';
        let pwd = bCrypt.hashSync('123456', salt);
        
        let phone = Tools.getCellText(row, 3);
        let mail = Tools.getCellText(row, 4);

        let exists = await exec(`select id from User where username = '${username}'`);
        if (!exists || exists.length < 1) {
            let PPs = await exec(`select id from PP where name = '${PPName}'`);
            let PPId;
            if (!PPs || PPs.length < 1) {
                // create PP
                PPId = await findTopId('PP');
                console.log('创建 PP: ', PPId, PPName);
                await exec(`INSERT INTO PP VALUES (${PPId}, '${PPName}', NULL, '${now}', '${now}', 0)`);
            } else {
                PPId = PPs[0].id;
            }
            let UserId = topId;
            console.log('创建 User: ', UserId, username);
            await exec(`INSERT INTO User VALUES (${UserId}, '${JS}', '${username}', '${pwd}', '${username}', '${phone}', '${mail}', NULL, NULL, '${now}', '${now}', 0)`);
            topId ++;

            if (JS === '品牌经理') {
                await exec(`INSERT INTO PPJL_PP VALUES (${UserId}, ${PPId}, '${now}', '${now}', 0)`);
                console.log('创建 PPJL_PP: ', UserId, PPId);
            } else if (JS === '客服经理') {
                await exec(`INSERT INTO KFJL_PP VALUES (${UserId}, ${PPId}, '${now}', '${now}', 0)`);
                console.log('创建 KFJL_PP: ', UserId, PPId);
            }
        }

    }

    topId = await findTopId('GYS');

    sheet = sheets['供应商管理员_装货员'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let GYSName = Tools.getCellText(row, 0);
        if (!GYSName) continue;

        let GYSType = Tools.getCellText(row, 1);
        if (!GYSType) continue;

        let exists = await exec(`select id from GYS where name = '${GYSName}'`);
        if (!exists || exists.length < 1) {
            console.log('创建 GYS: ', topId, GYSName);
            await exec(`INSERT INTO GYS VALUES (${topId ++}, '${GYSName}', '${GYSType}', NULL, '${now}', '${now}', 0)`);
        }
    }

    topId = await findTopId('User');

    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let JS = Tools.getCellText(row, 2);
        if (!JS) continue;

        let username = Tools.getCellText(row, 3);
        if (!username) continue;

        let pwd = bCrypt.hashSync('123456', salt);
        
        let phone = Tools.getCellText(row, 4);
        let mail = Tools.getCellText(row, 5);

        let exists = await exec(`select id from User where username = '${username}'`);
        if (!exists || exists.length < 1) {
            let UserId = topId;
            console.log('创建 User: ', UserId, username);
            await exec(`INSERT INTO User VALUES (${UserId}, '${JS}', '${username}', '${pwd}', '${username}', '${phone}', '${mail}', NULL, NULL, '${now}', '${now}', 0)`);
            topId ++;

            let GYSName = Tools.getCellText(row, 0);
            let GYSId = await findId(`select id from GYS where name = '${GYSName}'`);
            if (!GYSId) throw new Error('can\'t find GYS: ' + GYSName);

            if (JS === '供应商管理员') {
                await exec(`INSERT INTO GLY_GYS VALUES (${UserId}, ${GYSId}, '${now}', '${now}', 0)`);
                console.log('创建 GLY_GYS: ', UserId, GYSId);
            } else if (JS === '装货员') {
                await exec(`INSERT INTO ZHY_GYS VALUES (${UserId}, ${GYSId}, '${now}', '${now}', 0)`);
                console.log('创建 ZHY_GYS: ', UserId, GYSId);
            }
        }
    }

    sheet = sheets['安装公司管理员_安装工'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let AZGSName = Tools.getCellText(row, 0);
        if (!AZGSName) continue;

        let AZGSId = await findId(`select id from AZGS where name = '${AZGSName}'`);
        if (!AZGSId) {
            AZGSId = await findTopId('AZGS');
            console.log('创建 AZGS: ', AZGSId, AZGSName);
            await exec(`INSERT INTO AZGS VALUES (${AZGSId}, '${AZGSName}', NULL, '${now}', '${now}', 0)`);
        }

        let JS = Tools.getCellText(row, 1);
        if (!JS) continue;

        let username = Tools.getCellText(row, 2);
        if (!username) continue;

        let pwd = bCrypt.hashSync('123456', salt);
        
        let phone = Tools.getCellText(row, 3);
        let mail = Tools.getCellText(row, 4);

        let exists = await exec(`select id from User where username = '${username}'`);
        if (!exists || exists.length < 1) {
            let UserId = await findTopId('User');
            console.log('创建 User: ', UserId, username);
            await exec(`INSERT INTO User VALUES (${UserId}, '${JS}', '${username}', '${pwd}', '${username}', '${phone}', '${mail}', NULL, NULL, '${now}', '${now}', 0)`);

            if (JS === '安装公司管理员') {
                await exec(`INSERT INTO GLY_AZGS VALUES (${UserId}, ${AZGSId}, '${now}', '${now}', 0)`);
                console.log('创建 GLY_AZGS: ', UserId, AZGSId);
            } else if (JS === '安装工') {
                await exec(`INSERT INTO AZG_AZGS VALUES (${UserId}, ${AZGSId}, '${now}', '${now}', 0)`);
                console.log('创建 AZG_AZGS: ', UserId, AZGSId);
            }
        }
    }

    topId = await findTopId('WL');

    sheets = await readExcel('SPRT-物料表.xlsx');
    sheet = sheets['Sheet 1'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let name = Tools.getCellText(row, 1);
        if (!name) continue;
        let code = Tools.getCellText(row, 2);

        let level = Tools.getCellText(row, 3);
        if (level === '一级') {
            level = 1;
        } else if (level === '二级') {
            level = 2;
        } else {
            level = 3;
        }
        let PPId = await findId(`select id from PP where name = '${Tools.getCellText(row, 0)}'`);
        if (!PPId) throw new Error('can\'t find PP: ' + Tools.getCellText(row, 0));

        let WLId = await findId(`select id from WL where name = '${name}' and code = '${code}' and PPId = '${PPId}'`);
        if (!WLId) {

            let GYSId = await findId(`select id from GYS where name = '${Tools.getCellText(row, 4)}'`);
            if (!GYSId) throw new Error('can\'t find GYS: ' + Tools.getCellText(row, 4));

            console.log('创建 WL: ', topId, name);
            await exec(`INSERT INTO WL VALUES (${topId ++}, '${name}', '${code}', ${level}, ${PPId}, ${GYSId}, '', NULL, NULL, '${now}', '${now}', 0, NULL)`);
        }
    }

    topId = await findTopId('FGTester');

    sheets = await readExcel('SPRT-tester表.xlsx');
    sheet = sheets['Sheet 1'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let name = Tools.getCellText(row, 1);
        if (!name) continue;
        let code1 = Tools.getCellText(row, 2);
        let code2 = Tools.getCellText(row, 3);
        let code3 = Tools.getCellText(row, 4);
        let code4 = Tools.getCellText(row, 5);
        let code5 = Tools.getCellText(row, 6);

        let PPId = await findId(`select id from PP where name = '${Tools.getCellText(row, 0)}'`);
        if (!PPId) throw new Error('can\'t find PP: ' + Tools.getCellText(row, 0));

        let FGTesterId = await findId(`select id from FGTester where name = '${name}' and PPId = '${PPId}'`);
        if (!FGTesterId) {
    
            console.log('创建 FGTester: ', topId, name);
            await exec(`INSERT INTO FGTester VALUES (${topId ++}, '${name}', ${PPId}, '${code1}', '${code2}', '${code3}', '${code4}', '${code5}', NULL, '${now}', '${now}', 0)`);
        }
    }

    topId = await findTopId('DP');

    sheets = await readExcel('SPRT-灯片表.xlsx');
    sheet = sheets['Sheet 1'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let name = Tools.getCellText(row, 1);
        if (!name) continue;

        let PPId = await findId(`select id from PP where name = '${Tools.getCellText(row, 0)}'`);
        if (!PPId) throw new Error('can\'t find PP: ' + Tools.getCellText(row, 0));
        let GYSId = await findId(`select id from GYS where name = '${Tools.getCellText(row, 2)}'`);
        if (!GYSId) throw new Error('can\'t find GYS: ' + Tools.getCellText(row, 4));

        let DPId = await findId(`select id from DP where name = '${name}' and PPId = '${PPId}'`);
        if (!DPId) {
            console.log('创建 DP: ', topId, name);
            await exec(`INSERT INTO DP VALUES (${topId ++}, '${name}', ${PPId}, ${GYSId}, '', NULL, '${now}', '${now}', 0)`);
        }
    }

    topId = await findTopId('GT');

    sheets = await readExcel('SPRT-柜台灯位表.xlsx');
    sheet = sheets['柜台'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;
        
        let GTName = Tools.getCellText(row, 1);
        if (!GTName) continue;

        let GTCode = Tools.getCellText(row, 2);
        let GTArea = Tools.getCellText(row, 3);
        let GTCity = Tools.getCellText(row, 4);
        let GTAddress = Tools.getCellText(row, 5);

        let PPId = await findId(`select id from PP where name = '${Tools.getCellText(row, 0)}'`);
        if (!PPId) throw new Error('can\'t find PP: ' + Tools.getCellText(row, 0));

        let GTId = await findId(`select id from GT where PPId = '${PPId}' and name = '${GTName}' and code = '${GTCode}' and CS = '${GTCity}' and QY = '${GTArea}'`);
        if (!GTId) {

            let GZUsername = Tools.getCellText(row, 6);
            let GZUserId = await findId(`select id from User where username = '${GZUsername}'`);
            if (!GZUserId) {
                GZUserId = await findTopId('User');
                console.log('创建 GZ User: ', GZUserId, GZUsername);
                let pwd = bCrypt.hashSync('123456', salt);
            
                let phone = '';
                let mail = '';
                let JS = '柜长';
    
                await exec(`INSERT INTO User VALUES (${GZUserId}, '${JS}', '${GZUsername}', '${pwd}', '${GZUsername}', '${phone}', '${mail}', NULL, NULL, '${now}', '${now}', 0)`);
            }

            let GTBAUsername = GTCode;
            let GTBAUserId = await findId(`select id from User where username = '${GTBAUsername}'`);
            if (!GTBAUserId) {
                GTBAUserId = await findTopId('User');
                console.log('创建 GTBA User: ', GTBAUserId, GTBAUsername);
                let pwd = bCrypt.hashSync('123456', salt);
            
                let phone = '';
                let mail = '';
                let JS = '柜台BA';
    
                await exec(`INSERT INTO User VALUES (${GTBAUserId}, '${JS}', '${GTBAUsername}', '${pwd}', '${GTBAUsername}', '${phone}', '${mail}', NULL, NULL, '${now}', '${now}', 0)`);
            }
    
            console.log('创建 GT: ', topId, GTName);
            await exec(`INSERT INTO GT VALUES (${topId ++}, '${GTName}', '${GTCode}', ${PPId}, '${GTArea}', ${GZUserId}, ${GTBAUserId}, '${GTCity}', '', '${GTAddress}', NULL, '${now}', '${now}', 0)`);
        }
    }

    topId = await findTopId('DW');

    sheet = sheets['灯片'];
    for (let i = 1; i < sheet._rows.length; i++) {
        let row = sheet._rows[i];
        if (!row || row._hidden) continue;

        let name = Tools.getCellText(row, 3);
        let cc = Tools.getCellText(row, 4);
        let cz = Tools.getCellText(row, 5);
        
        let GTName = Tools.getCellText(row, 1);
        if (!GTName) continue;

        let GTCode = Tools.getCellText(row, 2);

        let PPId = await findId(`select id from PP where name = '${Tools.getCellText(row, 0)}'`);
        if (!PPId) throw new Error('can\'t find PP: ' + Tools.getCellText(row, 0));

        let GTId = await findId(`select id from GT where PPId = '${PPId}' and name = '${GTName}' and code = '${GTCode}'`);
        if (!GTId) throw new Error('can\'t find GT: ' + GTName);

        let DWId = await findId(`select id from DW where GTId = ${GTId} and name = '${name}'`);
        if (!DWId) {
    
            console.log('创建 DW: ', topId, name, cc, cz);
            await exec(`INSERT INTO DW VALUES (${topId ++}, '${name}', ${GTId}, NULL, '${cc}', '${cz}', NULL, '${now}', '${now}', 0)`);
        }
    }

    console.log('end');
    setTimeout(() => {
        process.exit();
    }, 100);
}

work();