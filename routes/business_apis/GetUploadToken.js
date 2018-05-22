import BusinessQueryApiBase from '../BusinessQueryApiBase';
import { sequelize, JS } from '../../models/Model';
import * as Uploader from '../../utils/Uploader';

export default class GetUploadToken extends BusinessQueryApiBase {
  static getAllowAccessJSs() {
    return "*";
  }

  static async mainProcess(req, res, next, user, transaction) {
    let { filename, type, ext } = req.body;

    let result = await Uploader.generateUploadToken({
      filename,
      type, 
      ext
    });
   
    return result;
  }
}
