import bCrypt from 'bcryptjs';
import moment from 'moment';

const fs = require('fs');

const lineReader = require('readline').createInterface({
  input: fs.createReadStream(`${__dirname}/initData.txt`),
});

// 0: not started
// 1: 表名
// 2: fields名
// 3: 数据
let status = 0;
let scriptStr = '';
let values = [];
const curTime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

lineReader.on('line', (sourceline) => {
  const line = sourceline.trim();

  console.log('Line from file:', line);

  if (line.trim().length === 0) {
    console.log('空行');
    return;
  }

  if (line.indexOf('//') === 0) {
    console.log('注释行');
    return;
  }

  const r = line.match(/^\[(.+)\]$/);
  if (r) {
    if (values.length > 0) {
      const dataStr = `${values.join(',\n')};\n`;
      scriptStr += dataStr;
    }

    values = [];

    if (r[1] === 'end') {
      fs.writeFile(`${__dirname}/initDataScript.txt`, scriptStr, (err) => {
        if (err) {
          return console.log(err);
        }

        console.log('数据初始化脚本生成成功!');
      });

      return;
    }

    console.log('表名');
    status = 1;
    const tableName = line.trim();
    const realTableName = tableName.substring(1, tableName.length - 1);
    const tmpStr = `\nINSERT INTO ${realTableName}\n`;
    scriptStr += tmpStr;
    return;
  }

  if (status === 1) {
    console.log('fields名');
    const fields = line.split('\t').map(item => item.trim());
    let fieldsArrStr = fields.join(',');
    fieldsArrStr = `${fieldsArrStr}, createdAt, updatedAt`;
    let fieldsStr = `(${fieldsArrStr})\n`;
    fieldsStr += 'VALUES\n';
    scriptStr += fieldsStr;
    status = 2;
    return;
  }

  if (status === 2) {
    console.log('数据');
    const dataArr = line.split('\t').map((item) => {
      const value = item.trim();
      const tmpR = value.match(/^password\((.+)\)$/);
      if (tmpR) {
        return `'${bCrypt.hashSync(tmpR[1], 8)}'`;
      }
      if (value === 'TRUE' || value === 'FALSE') {
        return `${item.trim()}`;
      }
      return `'${item.trim()}'`;
    });
    let dataArrStr = `${dataArr.join(',')}`;
    // 加入createdAt, updatedAt
    dataArrStr = `(${dataArrStr}, '${curTime}', '${curTime}')`;
    values.push(dataArrStr);
  }
});
