const PATH = require("path");
const FS = require('fs');
const Excel = require('exceljs');
const ExcelUtil = require("./Excel");

exports.readExcelFromLocal = function (filePath, option, callBack) {
    callBack = arguments[arguments.length - 1];
    callBack = typeof callBack === "function" ? callBack : null;
    option = typeof option === "object" ? option : {};

    return new Promise(async function (resolve, reject) {
        let tmpFile;
        if (filePath.substring(filePath.length - 4).toLocaleLowerCase() === ".xls") {
            //convert to xlsx
            try {
                tmpFile = await ExcelUtil.convertToXlsx(filePath);
            } catch (err) {
                console.error("无法解析xls文件: " + filePath);
                if (callBack) return callBack(err);
                reject(err);
            }
            filePath = tmpFile;
        }

        let workbook = new Excel.Workbook();
        workbook.xlsx.readFile(filePath).then(() => {
            if (callBack) return callBack(null, workbook);
            resolve(workbook);
        }).catch(err => {
            if (callBack) return callBack(err);
            reject(err);
        }).finally(() => {
            console.log("finally ....");
            try {
                //delete useless xls file
                if (!option.keepConvertedFile) tmpFile && FS.unlink(tmpFile, () => {});
            } catch (err) { }
        })
    });
}

exports.getCell = function (row, index) {
    try {
        if (arguments[0]._rows instanceof Array) {
            //worksheet
            let rowIndex = arguments[1];
            index = arguments[2];
            row = arguments[0]._rows[rowIndex];
        }
        return row._cells[index]._value.model;
    } catch (err) {
        return null;
    }
}

exports.getCellTimestamp = function (...rest) {
    try {
        let dateStr = String(exports.getCellText.apply(null, rest)).trim();
        if (!String(dateStr).hasValue()) return 0;
        if (!isNaN(Number(dateStr))) {
            //可能是时间戳或者4位数年份
            let val = Number(dateStr);
            if (String(Number(dateStr)).length <= 4) {
                return new Date(val, 0, 1, 0, 0, 0).getTime();
            } else {
                return new Date(val).getTime();
            }
        }
        dateStr = dateStr.replace("年", "-").replace("月", "-").replace("日", "-");
        if (dateStr.charAt(dateStr.length - 1) === "-") dateStr = dateStr.substr(0, dateStr.length - 1);
        let date = new Date(dateStr);
        let time = date.getTime() || 0;
        if (time === 0 || isNaN(time) || date.getFullYear() === 1970 || isNaN(date.getFullYear())) {
            time = moment(dateStr).unix() || 0;
        }
        date = new Date(time);
        if (time === 0 || isNaN(time) || date.getFullYear() === 1970 || isNaN(date.getFullYear())) {
            time = 0;
        }
        return time;
    } catch (err) {
        console.error(err);
        return 0;
    }
}

exports.getCellBoolean = function (...rest) {
    return /[是|TRUE]/i.test(exports.getCellText.apply(null, rest)) ? 1 : 0;
}

exports.getCellDateText = function (...rest) {
    let text = exports.getCellText.apply(null, rest);
    if (text && text.indexOf("GMT") >= 0) {
        let tmpDate = new Date(text);
        if (tmpDate.toString().indexOf("Invalid") < 0) {
            text = moment(tmpDate).format("YYYY-MM-DD");
        }
    }
    return text;
}

exports.getCellText = function (cellOrRow, index) {
    if (arguments[0] && arguments[0]._rows instanceof Array) {
        //worksheet
        let rowIndex = arguments[1];
        index = arguments[2];
        cellOrRow = arguments[0]._rows[rowIndex];
    }

    let cell = cellOrRow;
    if (index !== undefined) {
        cell = exports.getCell(cellOrRow, index);
    }
    if (!cell) return "";
    let value = (cell.formula || cell.sharedFormula) ? cell.result : cell.value;
    if (typeof value === "object" && value.richText) {
        let tmp = "";
        value.richText.forEach(obj => {
            tmp += obj.text || "";
        });
        value = tmp;
    }
    if (value) value = String(value).trim();
    value = value === undefined ? "" : value;
    return String(value);
}

exports.getCellNumber = function (cellOrRow, index) {
    if (arguments[0] && arguments[0]._rows instanceof Array) {
        //worksheet
        let rowIndex = arguments[1];
        index = arguments[2];
        cellOrRow = arguments[0]._rows[rowIndex];
    }

    let cell = cellOrRow;
    if (index !== undefined) {
        cell = exports.getCell(cellOrRow, index);
    }
    if (!cell) return 0;
    let value = (cell.formula || cell.sharedFormula) ? cell.result : cell.value;
    if (typeof value === "object" && value.richText) {
        let tmp = "";
        value.richText.forEach(obj => {
            tmp += obj.text || "";
        });
        value = tmp;
    }
    if (value) value = String(value).trim();
    return Number(value === undefined ? 0 : value);
}

exports.parseDateTimeToTimestamp = function(datetime) {
    datetime = datetime || "";
    datetime = datetime.replace("年", "-").replace("月", "-").replace("日", "");
    datetime = moment(new Date(datetime)).valueOf() || 0;
    return datetime;
}

//纠正产品指标名称
exports.parseProductIndexName = function(name) {
    let originalName = name;
    name = name.replace(/耗电|电耗/, "电力");
    name = name.replace("单位能耗", "单位产量综合能耗");
    name = name.replace("单位电耗", "单位产量电力");
    name = name.replace("单位电耗", "单位产量电力");
    name = name.replace("粗钢产品", "粗钢");
    name = name.replace("吨钢", "粗钢单位产量");
    if (name.indexOf("单位") === 0 && /单位.+耗/.test(name)) {
        if (name.indexOf("综合能耗") > 0) {
            let productName = name.replace("单位", "").replace(/综合.+耗/, "");
            name = productName + "单位产量综合能耗";
        } else if (name.indexOf("电力") > 0) {
            let productName = name.replace("单位", "").replace(/电力.+耗/, "");
            name = productName + "单位产量电力";
        } else {
            console.warn("无法解析产品指标名称: " + originalName);
        }
    } else if (name.indexOf("单位") < 0) {
        if (/标准煤|综合能耗/.test(name)) {
            name = name.replace(/标准煤|综合能耗/, "单位产量综合能耗");
        } else if (/电力/.test(name)) {
            name = name.replace(/电力/, "单位产量电力");
        }
    }

    return name;
}

//纠正产品名称
exports.parseProductName = function(name) {
    name = name.replace(/吨钢|粗钢产品/, "粗钢").replace("产量", "");
    return name;
}

//纠正能源名称
exports.parseEnergyName = function(name, unit) {
    name = name.replace(/\d+\./, "");
    name = name.replace(/\s/img, "");
    name = name.replace("产品", "");
    if (name === "综合消耗" || name === "标准煤" || name === "标准煤耗" || name.indexOf("综合能耗") >= 0) return "综合能耗";
    if (name.substr(name.length - 2) === "消耗") {
        name = name.substr(0, name.length - 2);
    }
    if (name.charAt(0) === "耗") {
        name = name.substr(1);
    }
    if (name === "焦碳") {
        return "焦炭";
    }
    if (name.includes('液化天然气')) {
        return "液化天然气(液态)";
    }
    if (name === '天然气') {
        return '天然气(气态)';
    }
    if (name === '电') {
        return '电力'
    }
    if (name === '余热') {
        return '余热余压';
    }
    if (name === '过热蒸汽' || name === '锅炉蒸汽') {
        return '蒸汽';
    }
    // if (name === '其他(石油制品)') {
    //     return '其他石油制品';
    // }
    // if (name.toLowerCase() === 'kw') {
    //     return '千瓦时';
    // }
    name = name.replace("综合能耗消耗", "综合能耗");
    name = name.replace("综合电耗", "电力");
    name = name.replace("综合电力", "电力");
    name = name.replace("电力能耗", "电力");
    name = name.replace("耗电", "电力");
    name = name.replace("焦炉焦碳", "焦炉焦炭");
    if (name.charAt(name.length - 1) === "*") {
        name = name.substr(0, name.length - 1) + "#";
    }

    if (name === "其他石油制品" && unit === "吨") {
        name = "其他(石油制品)";
    } else if (name === "无") {
        name = "";
    }

    return name;
}

//纠正产品计量单位名称
exports.parseUnitName = function(name) {
    name = name.replace(/\s/img, "");
    name = name.replace(/标煤|標煤|標準煤/, "标准煤");
    if (/吨标准煤|吨标准|标准煤|标准煤耗|吨标煤|吨煤|噸標準煤|噸標煤/.test(name) && name.indexOf("克") < 0) return "吨标准煤";
    if (name === "千克原煤") return "千克";
    let tmp = name.toLowerCase();
    if (tmp === "km3") {
        return "km³";
    } else if (tmp === "t") {
        return "t";
    } else if (tmp === "kgce"|| tmp === "kgoe") {
        return "千克标准煤";
    } else if (tmp === "tce") {
        return "吨标准煤";
    }
    if (name === '万标准立方米' || name === '万标准m³') {
        return '万立方米';
    }
    if (name.endsWith("瓦")) name = name + "时";
    name = name.replace(/kwh/img, "千瓦时");
    name = name.replace(/nm3/img, "立方米");
    name = name.replace(/kg/img, "千克");
    name = name.replace(/m3/img, "m³");
    name = name.replace(/标准油/img, "");

    if (name.endsWith("立方")) name = name + "米";

    return name;
}

exports.getUnitsTransferParam = function(unit1ID, unit2ID) {
    return new Promise(async function (resolve, reject) {
        let p = 0;
        try {
            let unit1 = typeof unit1ID === "string" ? (await Unit.getSingleUnit(unit1ID)) : unit1ID;
            if (!unit1) throw new Error("no such Unit [" + unit1ID + "]");
            let unit2 = typeof unit2ID === "string" ? (await Unit.getSingleUnit(unit2ID)) : unit2ID;
            if (!unit2) throw new Error("no such Unit [" + unit2ID + "]");
            if (unit2.link === unit1._id) {
                p = 1 / unit2.p;
            } else if (unit1.link === unit2._id) {
                p = unit1.p;
            } else if (unit1.same === unit2._id || unit2.same === unit1._id) {
                p = 1;
            } else if (unit1.link === unit2.link) {
                p = unit1.p / unit2.p;
            }
        } catch (err) {
            return reject(err);
        }
        resolve(p);
    });
}

exports.parsePrimaryDeviceType = function (name) {
    if (name.includes('燃汽')) {
        name = name.replace('燃汽', '燃气');
    } else if (name.includes('蒸气')) {
        name = name.replace('蒸气', '蒸汽');
    }
    return name;
}

exports.parseUnit = function(unitName) {
    return new Promise(async function (resolve, reject) {
        let unit;
        try {
            unitName = exports.parseUnitName(unitName);
            unit = await Unit.getSingleUnit({ name:unitName });
        } catch (err) {
            return reject(err);
        }
        resolve(unit);
    });
}

exports.parseEnergy = function(enterpriseID, displayedEnergyName, unitOrUnitName, displayedCode, og, sd, ref, type, transUnit, fixed, ref_og_sd) {
    return new Promise(async function (resolve, reject) {
        let energy, energyID, energyName, unit, unitName;
        try {
            if (typeof unitOrUnitName === "string") {
                unit = await exports.parseUnit(unitOrUnitName);
            } else {
                unit = unitOrUnitName;
            }
            if (!unit) return resolve(null)

            unitName = unit.name;

            energyName = exports.parseEnergyName(displayedEnergyName);
            energy = await Energy.getSingleEnergy({ name: energyName });
            if (!energy) {

                if (energyName === "天然气") {
                    energy = await Energy.getSingleEnergy(unitName.indexOf("米") >= 0 ? "15" : "16");
                    // result.msg.push(`发现天然气, 单位为[${energyUnitName}], 自动识别为 ---> ` + energy.name);
                } else {
                    energy = await CustomEnergy.getSingleEnergy(enterpriseID, { name: energyName });
                }

                let newCustomEnergy = () => {
                    return new Promise(async function (resolve, reject) {
                        let energy;
                        try {
                            if (!type) {
                                type = 1;
                                if (Number(displayedCode) > 60 && Number(displayedCode) < 66) type = 2;
                                else if (Number(displayedCode) > 65 && Number(displayedCode) < 76) type = 3;
                                else if (Number(displayedCode) > 75) type = 4;
                            }

                            //custom
                            let customItem = {
                                "code" : displayedCode ? null : energyID,
                                "name" : displayedEnergyName,
                                "unit" : unit._id,
                                "og" : Number(og) || 0,
                                "sd" : Number(sd) || 0,
                                "type" : type || 1,
                                "transUnit" : transUnit || "",
                                "fixed" : fixed === "" ? 1 : Number(fixed)
                            };
                            if (ref_og_sd === "og") {
                                customItem.ref = customItem.og;
                            } else {
                                customItem.ref = customItem.sd;
                            }
                            customItem = await CustomEnergy.newOne(enterpriseID,
                                customItem.name,
                                customItem.unit,
                                customItem.code,
                                type,
                                customItem.og,
                                customItem.sd,
                                ref_og_sd,
                                { "displayedCode": displayedCode || "" });
                            if (typeof customItem.toObject === "function") customItem = customItem.toObject();

                            energy = {...customItem};
                            energy._id = energy.code;
                            delete energy["code"];
                            energy.custom = 1;
                        } catch (err) {
                            return reject(err);
                        }
                        console.log(`创建自定义能源：${JSON.stringify(energy, null, 2)}`);
                        resolve(energy);
                    });
                }

                if (!energy && !displayedCode) {
                    energy = await newCustomEnergy();
                } else {
                    if (!energy) energy = await CustomEnergy.getSingleEnergy(enterpriseID, displayedCode);

                    if (energy) {
                        console.log(`发现自定义能源[1]：${JSON.stringify(energy, null, 2)}`);
                    } else {
                        energy = await newCustomEnergy();
                    }
                }
                energyID = energy._id;
            }
        } catch (err) {
            return reject(err);
        }
        resolve(energy);
    });
}