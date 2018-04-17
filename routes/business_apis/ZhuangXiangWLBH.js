import BusinessApiBase from '../BusinessApiBase';
import * as DBTables from '../../models/Model';

export default class ZhuangXiangWLBH extends BusinessApiBase {
  static getAllowAccessJSs() {
    return [DBTables.JS.AZGSGLY];
  }

  static validateParamsFormat(req, res, next) {
    const {
      HBUUID, GTId, WLEWMs, KDXEWM,
    } = req.body;

    // 检查KDXEWM是否是KDX
    if (KDXEWM.type !== DBTables.EWMType.KDX) {
      throw new Error('快递箱二维码不正确!');
    }
    // end 检查KDXEWM是否是KDX

    // 检查WLEWMs是否都是WL
    const validateFailedEWMs = WLEWMs.filter(item => item.type !== DBTables.EWMType.WL);
    if (validateFailedEWMs.length > 0) {
      throw new Error(`${validateFailedEWMs}不属于物料, 不能装箱!`);
    }
    // end 检查WLEWMs是否都是WL
  }

  static async mainProcess(req, res, next, user, transaction) {
    const {
      HBUUID, GTId, WLEWMs, KDXEWM,
    } = req.body;

    // 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    // end 检查相关记录是否属于用户操作范围, 记录状态是否是可操作状态

    for (let i = 0; i < WLEWMs; i++) {
      // 确定
    }
  }
}
