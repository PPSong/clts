import * as DBTables from '../models/Model';

export const normalApiSchema = {
  // 常规API
  //----------------
  // DPCreate
  DPCreate: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // PPId
      PPId: {
        type: 'number',
      },
      // GYSId
      GYSId: {
        type: 'number',
      },
      // 图片链接
      imageUrl: {
        type: 'string',
      },
    },
    required: ['name', 'PPId', 'GYSId'],
  },
  // DPEdit
  DPEdit: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // 图片链接
      imageUrl: {
        type: 'string',
      },
    },
    required: ['name', 'imageUrl'],
  },
  // DWCreate
  DWCreate: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // DPId
      DPId: {
        type: 'number',
      },
      // 材质
      CZ: {
        type: 'string',
      },
      // 尺寸
      CC: {
        type: 'string',
      },
    },
    required: ['name', 'GTId', 'CZ', 'CC'],
  },
  // DWEdit
  DWEdit: {
    type: 'object',
    properties: {
      // DPId
      DPId: {
        type: 'number',
      },
      // 材质
      CZ: {
        type: 'string',
      },
      // 尺寸
      CC: {
        type: 'string',
      },
    },
    required: ['CZ', 'CC'],
  },
  // FGTesterCreate
  FGTesterCreate: {
    type: 'object',
    properties: {
      // 名称
      name: {
        type: 'string',
      },
      // PPId
      PPId: {
        type: 'number',
      },
      // Code
      Code: {
        type: 'object',
        properties: {
          Code1: {
            type: 'string',
          },
          Code2: {
            type: 'string',
          },
          Code3: {
            type: 'string',
          },
          Code4: {
            type: 'string',
          },
          Code5: {
            type: 'string',
          },
        },
        oneOf: [
          { required: ['Code1'] },
          { required: ['Code2'] },
          { required: ['Code3'] },
          { required: ['Code4'] },
          { required: ['Code5'] },
        ],
      },
    },
    required: ['name', 'PPId', 'Code'],
  },
  // FGTesterEdit
  FGTesterEdit: {
    type: 'object',
    properties: {
      // FGtester名称
      name: {
        type: 'number',
      },
      Code: {
        type: 'object',
        properties: {
          Code1: {
            type: 'string',
          },
          Code2: {
            type: 'string',
          },
          Code3: {
            type: 'string',
          },
          Code4: {
            type: 'string',
          },
          Code5: {
            type: 'string',
          },
        },
        oneOf: [
          { required: ['Code1'] },
          { required: ['Code2'] },
          { required: ['Code3'] },
          { required: ['Code4'] },
          { required: ['Code5'] },
        ],
      },
    },
    required: ['name', 'Code'],
  },
  // GYSCreate
  GYSCreate: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
      // GYS类型
      type: {
        type: 'string',
      },
    },
    required: ['name', 'type'],
  },
  // GYSEdit
  GYSEdit: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
      // GYS类型
      imageUrl: {
        type: 'string',
      },
    },
    required: ['name', 'type'],
  },
  // PPCreate
  PPCreate: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // UserCreate
  UserCreate: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
  },
  // UserEdit
  UserEdit: {
    type: 'object',
    properties: {
      // 密码
      password: {
        type: 'string',
      },
    },
    required: ['password'],
  },
  // WLCreate
  WLCreate: {
    type: 'object',
    properties: {
      // WL名称
      name: {
        type: 'string',
      },
      // 物料code
      code: {
        type: 'string',
      },
      // 物料level
      level: {
        type: 'number',
      },
      // PPId
      PPId: {
        type: 'number',
      },
      // GYSId
      GYSId: {
        type: 'number',
      },
      // imageUrl
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['name', 'code', 'level', 'PPId', 'GYSId'],
  },
  // WLEdit
  // fftd：WL供应商暂未确定是否能修改
  WLEdit: {
    type: 'object',
    properties: {
      // WL名称
      name: {
        type: 'string',
      },
      // imageUrl
      imageUrl: {
        type: 'string',
      },
      // note
      note: {
        type: 'string',
      },
    },
    required: ['name'],
  },
};

export const apiSchema = {
  // business_apis
  // 获取上传文件的token
  getUploadToken: {
    type: 'object',
    properties: {
      // 空间类型,公开public,私有private,默认私有
      type: {
        type: 'string',
      },
      // 文件类型,如png,txt,jpg
      ext: {
        type: 'string',
      },
      // 保存的文件名字,不设置则随机生成名字
      filename: {
        type: 'string',
      },
    },
    required: [],
  },

  // 修改当前已登录用户的密码
  userChangePassword: {
    type: 'object',
    properties: {
      // 新密码
      newPassword: {
        type: 'string',
      },
      // 旧密码
      oldPassword: {
        type: 'string',
      },
    },
    required: ['newPassword', 'oldPassword'],
  },
  // 获取当前登录用户的详细信息
  myUserInfo: {
    type: 'object',
    properties: {},
    required: [],
  },
  // 检查品牌名称是否已经存在
  checkPPExists: {
    type: 'object',
    properties: {
      // 品牌名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查Tester名称是否已经存在,在一个品牌内唯一
  checkFGTesterNameExists: {
    type: 'object',
    properties: {
      // Tester名称
      name: {
        type: 'string',
      },
      // 品牌id,客服经理可不传
      PPId: {
        type: 'number',
      },
    },
    required: ['name'],
  },
  // 检查Tester的Code1是否已经存在,在一个品牌内唯一
  checkFGTesterCodeExists: {
    type: 'object',
    properties: {
      // Tester的Code1
      Code1: {
        type: 'string',
      },
      // 品牌id,客服经理可不传
      PPId: {
        type: 'number',
      },
    },
    required: ['Code1'],
  },
  // 检查灯片名称是否已经存在
  checkDPExists: {
    type: 'object',
    properties: {
      // 灯片名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查灯位编号是否已经存在(在一个柜台中唯一)
  checkDWExists: {
    type: 'object',
    properties: {
      // 灯位编号
      name: {
        type: 'string',
      },
      // 柜台ID
      GTId: {
        type: 'number',
      },
    },
    required: ['name', 'GTId'],
  },
  // 检查物料名称是否已经存在(在一个品牌中唯一)
  checkWLNameExists: {
    type: 'object',
    properties: {
      // 物料名称
      name: {
        type: 'string',
      },
      // 品牌ID
      PPId: {
        type: 'number',
      },
    },
    required: ['name', 'PPId'],
  },
  // 检查物料编号是否已经存在
  checkWLCodeExists: {
    type: 'object',
    properties: {
      // 灯位编号
      code: {
        type: 'string',
      },
    },
    required: ['code'],
  },
  // 检查供应商名称是否已经存在
  checkGYSExists: {
    type: 'object',
    properties: {
      // 供应商名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查安装公司名称是否已经存在
  checkAZGSExists: {
    type: 'object',
    properties: {
      // 品牌名称
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  },
  // 检查订单名称是否已经存在,在一个品牌内名称唯一
  checkDDExists: {
    type: 'object',
    properties: {
      // 柜台名称
      name: {
        type: 'string',
      },
      // 品牌ID,品牌经理/客服经理角色可不传
      PPId: {
        type: 'number',
      },
    },
    required: ['name'],
  },
  // 检查柜台名称是否已经存在,在一个品牌内名称唯一
  checkGTExists: {
    type: 'object',
    properties: {
      // 柜台名称
      name: {
        type: 'string',
      },
      // 品牌ID,客服经理角色可不传
      PPId: {
        type: 'number',
      },
    },
    required: ['name'],
  },
  // 检查柜台编号是否已经存在,在全表内编号唯一
  checkGTCodeExists: {
    type: 'object',
    properties: {
      // 柜台编号
      code: {
        type: 'string',
      },
    },
    required: ['code'],
  },
  // 检查二级组合名称是否已经存在,在一个品牌内名称唯一
  checkEJZHExists: {
    type: 'object',
    properties: {
      // 二级组合名称
      name: {
        type: 'string',
      },
      // 品牌ID,客服经理角色可不传
      PPId: {
        type: 'number',
      },
    },
    required: ['name'],
  },
  // 检查一级组合名称是否已经存在,在一个品牌内名称唯一
  checkYJZHExists: {
    type: 'object',
    properties: {
      // 一级组合名称
      name: {
        type: 'string',
      },
      // 品牌ID,客服经理角色可不传
      PPId: {
        type: 'number',
      },
    },
    required: ['name'],
  },
  // 检查用户名是否已经存在
  checkUsernameExists: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
    },
    required: ['username'],
  },
  // ////////////

  //----------------
  // 新建PPJL [ADMIN]
  createPPJL: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // 品牌Id
      PPId: {
        type: 'number',
      },
      // 姓名
      name: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
      // 手机号
      phone: {
        type: 'string',
      },
    },
    required: ['username', 'password', 'PPId'],
  },
  // 安装反馈DDDP状态 [GTBA, AZG]
  anZhuangFanKuiDDDPZhuangTai: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // WYDP反馈
      WYDPPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // WYDPId
            uuid: {
              type: 'string',
            },
            // 反馈类型
            AZFKType: {
              type: 'string',
              enum: Object.values(DBTables.AZFKType),
            },
            // 反馈图片地址
            imageUrl: {
              type: 'string',
            },
          },
          required: ['uuid', 'AZFKType', 'imageUrl'],
        },
      },
    },
    required: ['DDId', 'GTId', 'WYDPPayloads'],
  },

  // 新建KFJL [PPJL]
  createKFJL: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // 品牌id
      PPId: {
        type: 'number',
      },
    },
    required: ['username', 'password', 'PPId'],
  },
  // 新建GT, GTBA [KFJL]
  createGTWithGTBA: {
    type: 'object',
    properties: {
      // 品牌id
      PPId: {
        type: 'number',
      },
      // 柜台名称
      name: {
        type: 'string',
      },
      // GTcode
      code: {
        type: 'string',
      },
      // 区域
      QY: {
        type: 'string',
      },
      // 城市
      CS: {
        type: 'string',
      },
    },
    required: ['name', 'code', 'QY', 'CS'],
  },
  // 编辑GT图 [KFJL]
  setGTImage: {
    type: 'object',
    properties: {
      // GTId
      id: {
        type: 'number',
      },
      // 柜台图
      imageUrl: {
        type: 'string',
      },
    },
    required: ['id', 'imageUrl'],
  },
  // 创建GZ [KFJL]
  createGZ: {
    type: 'object',
    properties: {
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // 品牌id
      PPId: {
        type: 'number',
      },
      // 姓名
      name: {
        type: 'string',
      },
      // 联系电话
      phone: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
  },
  // 配置GZ负责GT [KFJL]
  setGZGTs: {
    type: 'object',
    properties: {
      // GZ的userid
      GZUserId: {
        type: 'number',
      },
      // GTIds
      GTIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GZUserId', 'GTIds'],
  },
  // 获取自己品牌下的所有柜长列表 [KFJL]
  getGZList: {
    type: 'object',
    properties: {},
    required: [],
  },
  // 获取某一柜长的所有柜台列表 [ADMIN,PPJL,KFJL,GZ]
  getGZGTList: {
    type: 'object',
    properties: {
      // 柜长id,如果是柜长本人则不需要
      GZUserId: {
        type: 'number',
      },
      // 柜台属性,如"id,name,code",默认返回所有属性
      fields: {
        type: 'string',
      },
    },
    required: [],
  },
  // 新建GYS, GLY[KFJL]
  createGYSWithGLY: {
    type: 'object',
    properties: {
      // GYS名称
      name: {
        type: 'string',
      },
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // GYS类型
      type: {
        type: 'string',
      },
    },
    required: ['name', 'username', 'password', 'type'],
  },
  // 新建AZGS, GLY [KFJL]
  createAZGSWithGLY: {
    type: 'object',
    properties: {
      // AZGS名称
      name: {
        type: 'string',
      },
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
    },
    required: ['name', 'username', 'password'],
  },
  // 新建AZG [AZGSGLY]
  createAZG: {
    type: 'object',
    properties: {
      // 姓名
      name: {
        type: 'string',
      },
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // 联系电话
      phone: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
  },
  // 新建ZHY [GYSGLY]
  createZHY: {
    type: 'object',
    properties: {
      // 姓名
      name: {
        type: 'string',
      },
      // 用户名
      username: {
        type: 'string',
      },
      // 密码
      password: {
        type: 'string',
      },
      // 联系电话
      phone: {
        type: 'string',
      },
      // 邮箱
      mail: {
        type: 'string',
      },
    },
    required: ['username', 'password'],
  },
  // 配置DP到DWs [KFJL]
  setDPDWs: {
    type: 'object',
    properties: {
      // DPId
      id: {
        type: 'number',
      },
      // DWIds
      DWIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['id', 'DWIds'],
  },
  // 设置DWs的DP [PPJL, KFJL]
  setDWs0DP: {
    type: 'object',
    properties: {
      // DPId
      DPId: {
        type: 'number',
      },
      // DWIds
      DWIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['DPId', 'DWIds'],
  },
  // 创建EJZH [KFJL]
  createEJZH: {
    type: 'object',
    properties: {
      // 品牌id
      PPId: {
        type: 'number',
      },
      // 二级组合name
      name: {
        type: 'string',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 二级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图备注
      XGTNote: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // FGTesters
      FGTesters: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // FGTesters id
            id: {
              type: 'number',
            },
            // FGTesters number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // SJWLs
      SJWLs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // SJWLs id
            id: {
              type: 'number',
            },
            // SJWLs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['PPId', 'name', 'WLId', 'imageUrl', 'XGTs', 'SJWLs'],
  },
  // 编辑EJZH [KFJL]
  editEJZH: {
    type: 'object',
    properties: {
      // EJZHid
      id: {
        type: 'number',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 二级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图备注
      XGTNote: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // FGTesters
      FGTesters: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // FGTesters id
            id: {
              type: 'number',
            },
            // FGTesters number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // SJWLs
      SJWLs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // SJWLs id
            id: {
              type: 'number',
            },
            // SJWLs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['id', 'WLId', 'imageUrl', 'XGTs', 'FGTesters', 'SJWLs'],
  },
  // 获取一个EJZH数据 [*]
  getEJZHInfo: {
    type: 'object',
    properties: {
      // 二级组合id
      EJZHId: {
        type: 'number',
      },
    },
    required: ['EJZHId'],
  },
  // 获取一个YJZH数据 [*]
  getYJZHInfo: {
    type: 'object',
    properties: {
      // 一级组合id
      YJZHId: {
        type: 'number',
      },
    },
    required: ['YJZHId'],
  },
  // 创建YJZH [KFJL]
  createYJZH: {
    type: 'object',
    properties: {
      // 品牌id
      PPId: {
        type: 'number',
      },
      // 一级组合name
      name: {
        type: 'string',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 一级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图备注
      XGTNote: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // EJZHs
      EJZHs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // EJZHs id
            id: {
              type: 'number',
            },
            // EJZHs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['PPId', 'name', 'WLId', 'imageUrl', 'XGTs'],
  },
  // 编辑YJZH [KFJL]
  editYJZH: {
    type: 'object',
    properties: {
      // YJZHId
      Id: {
        type: 'number',
      },
      // YJWLId
      WLId: {
        type: 'number',
      },
      // 一级组合imageUrl
      imageUrl: {
        type: 'string',
      },
      // 相关图备注
      XGTNote: {
        type: 'string',
      },
      // 相关图XGTs
      XGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'string',
        },
      },
      // EJZHs
      EJZHs: {
        type: 'array',
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // EJZHs id
            id: {
              type: 'number',
            },
            // EJZHs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['id', 'WLId', 'imageUrl', 'XGTs'],
  },
  // 配置YJZH_GTs [KFJL]
  setYJZHGTs: {
    type: 'object',
    properties: {
      // YJZHId
      Id: {
        type: 'number',
      },
      // GTs
      GTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // GTs id
            id: {
              type: 'number',
            },
            // GTs number
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
    },
    required: ['id', 'GTs'],
  },
  // 生成DD [KFJL]
  createDD: {
    type: 'object',
    properties: {
      // 品牌id
      PPId: {
        type: 'number',
      },
      // DD名称
      name: {
        type: 'string',
      },
    },
    required: ['name', 'PPId'],
  },
  // 重新生成DD [KFJL]
  reCreateDD: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
    },
    required: ['DDId'],
  },
  // 设置PP_GTFXs [KFJL]
  setPPGTFXs: {
    type: 'object',
    properties: {
      // 品牌id
      id: {
        type: 'number',
      },
      // GTIds
      GTIds: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['id', 'GTIds'],
  },
  // 批量设置DD_GT_WL的AZGS [PPJL]
  setDDGTWLs0AZGS: {
    type: 'object',
    properties: {
      // AZGSId,-1表示BA安装
      AZGSId: {
        type: 'number',
      },
      // DD_GT_WLIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'ids'],
  },
  // 批量设置DD_DW_DP的AZGS [PPJL]
  setDDDWDPs0AZGS: {
    type: 'object',
    properties: {
      // AZGSId,-1表示BA安装
      AZGSId: {
        type: 'number',
      },
      // DD_DW_DPIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'ids'],
  },
  // 审批通过DD [PPJL]
  approveDD: {
    type: 'object',
    properties: {
      // DDId
      id: {
        type: 'number',
      },
    },
    required: ['id'],
  },
  // 批量设置补货道具的发货GYS [GYSGLY]
  setWLBHs0GYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // YJZXTime
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'ids', 'YJZXTime'],
  },
  // 批量设置补货灯片的预计安装时间 [GYSGLY]
  setDPBHs0YJAZDate: {
    type: 'object',
    properties: {
      // YJAZDate
      YJAZDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['ids', 'YJAZDate'],
  },
  // 批量设置补货物料的预计安装时间 [GYSGLY]
  setWLBHs0YJAZDate: {
    type: 'object',
    properties: {
      // YJAZDate
      YJAZDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['ids', 'YJAZDate'],
  },
  // 批量设置补货灯片的发货GYS [GYSGLY]
  setDPBHs0GYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // YJZXTime
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // YJRKDate
      YJRKDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'ids', 'YJZXTime', 'YJRKDate'],
  },
  // 批量设置DD_GT_WL的发货GYS [GYSGLY]
  setDDGTWLs0GYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // DD_GT_WLIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJRKDate
      YJRKDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // YJZXDate
      YJZXDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['GYSId', 'ids', 'YJRKDate', 'YJZXDate'],
  },
  // 批量设置DD_DW_DP的发货GYS [GYSGLY]
  setDDDWDPs0GYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // DD_DW_DPIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJRKDate
      YJRKDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // YJZXDate
      YJZXDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['GYSId', 'ids', 'YJRKDate', 'YJZXDate'],
  },
  // 批量设置DD_GT_WL的AZG [AZGSGLY]
  setDDGTWLs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // DD_GT_WLIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'ids'],
  },
  // 批量设置DD_DW_DP的AZG [AZGSGLY]
  setDDDWDPs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // DD_DW_DPIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'ids'],
  },
  // 批量入库WL [ZHY]
  piLiangRuKuWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 批量出库WL [ZHY]
  piLiangChuKuWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 批量消库WL [ZHY]
  piLiangXiaoKuWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 订单批量装箱DDWL [ZHY]
  piLiangZhuangXiangDDWL: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 物料二维码
      WLEWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['DDId', 'GTId', 'WLEWMs', 'KDXEWM'],
  },
  // 订单批量装箱DDDP [ZHY]
  piLiangZhuangXiangDDDP: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['DDId', 'GTId', 'DPEWMs', 'KDXEWM'],
  },
  // 订单批量装箱BHWL [ZHY]
  piLiangZhuangXiangBuHuoWL: {
    type: 'object',
    properties: {
      // YJZXTime
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 补货物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['YJZXTime', 'GTId', 'WLEWMs', 'KDXEWM'],
  },
  // 订单批量装箱BHDP [ZHY]
  piLiangZhuangXiangBuHuoDP: {
    type: 'object',
    properties: {
      // YJZXTime
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 补货灯片二维码
      DPEWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
      // 快递箱二维码
      KDXEWM: {
        type: 'object',
        properties: {
          // type
          type: {
            const: 'KDX',
          },
          // uuid
          uuid: {
            type: 'string',
          },
        },
        required: ['type', 'uuid'],
      },
    },
    required: ['YJZXTime', 'GTId', 'DPEWMs', 'KDXEWM'],
  },
  // 出箱WL [ZHY]
  chuXiangWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 出箱DP [ZHY]
  chuXiangDP: {
    type: 'object',
    properties: {
      // 灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 关联快递 [ZHY]
  guanLianKuaiDi: {
    type: 'object',
    properties: {
      // 快递箱二维码
      KDXEWM: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'KDX',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'uuid'],
        },
      },
      // 快递单code
      KDDCode: {
        type: 'string',
      },
    },
    required: ['EWMs', 'KDDCode'],
  },
  // 解除关联快递 [ZHY]
  jieChuGuanLianKuaiDi: {
    type: 'object',
    properties: {
      // 快递箱二维码
      KDXEWM: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'KDX',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 收箱 [GTBA]
  shouXiang: {
    type: 'object',
    properties: {
      // 快递箱二维码
      KDXEWM: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'KDX',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 收货WL [GTBA, AZG]
  shouHuoWL: {
    type: 'object',
    properties: {
      // 物料二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'WL',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  },
  // 收货DP [GTBA, AZG]
  shouHuoDP: {
    type: 'object',
    properties: {
      // 灯片二维码
      EWMs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // type
            type: {
              const: 'DP',
            },
            // typeId
            typeId: {
              type: 'number',
            },
            // uuid
            uuid: {
              type: 'string',
            },
          },
          required: ['type', 'typeId', 'uuid'],
        },
      },
    },
    required: ['EWMs'],
  }, 

  // 安装反馈DDWL状态 [GTBA, AZG]
  anZhuangFanKuiDDWLZhuangTai: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // WYWL反馈
      WYWLPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // WYWLId
            uuid: {
              type: 'string',
            },
            // 反馈类型
            AZFKType: {
              type: 'string',
              enum: Object.values(DBTables.AZFKType),
            },
            // 反馈图片地址
            imageUrl: {
              type: 'string',
            },
          },
          required: ['uuid', 'AZFKType', 'imageUrl'],
        },
      },
    },
    required: ['DDId', 'GTId', 'WYWLPayloads'],
  },
  // 安装反馈全景WL图片 [GTBA, AZG]
  anZhuangFanKuiQuanJingWLTuPian: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 柜台WL全景图:
      imageUrls: {
        type: 'array',
        minItems: 1,
        // uniqueItems: true,
        items: {
          type: 'string',
        },
      },
    },
    required: ['DDId', 'GTId', 'imageUrls'],
  },
  // 安装反馈全景DP图片 [GTBA, AZG]
  anZhuangFanKuiQuanJingDPTuPian: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // 柜台DP全景图:
      imageUrls: {
        type: 'array',
        minItems: 1,
        // uniqueItems: true,
        items: {
          type: 'string',
        },
      },
    },
    required: ['DDId', 'GTId', 'imageUrls'],
  },
  // 申请上市WLBH [GZ, GTBA, AZG]
  shenQingShangShiWLBH: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 物料补货图片
      imageUrl: {
        type: 'string',
      },
      // 补货原因
      reason: {
        type: 'string',
      },
      // 备注
      note: {
        type: 'string',
      },
      // 唯一UUID
      uuid: {
        type: 'string',
      },
    },
    required: ['DDId', 'GTId', 'WLId', 'imageUrl', 'reason'],
  },
  // 申请上市DPBH [GZ, GTBA, AZG]
  shenQingShangShiDPBH: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // DWId
      DWId: {
        type: 'number',
      },
      // DPId
      DPId: {
        type: 'number',
      },
      // 灯片补货图片
      imageUrl: {
        type: 'string',
      },
      // 补货原因
      reason: {
        type: 'string',
      },
      // 备注
      note: {
        type: 'string',
      },
      // 唯一UUID
      uuid: {
        type: 'string',
      },
    },
    required: ['DDId', 'DWId', 'DPId', 'imageUrl', 'reason'],
  },
  // 申请日常WLBH [GZ, GTBA]
  shenQingRiChangWLBH: {
    type: 'object',
    properties: {
      // GTId
      GTId: {
        type: 'number',
      },
      // WLId
      WLId: {
        type: 'number',
      },
      // 补货图片
      imageUrl: {
        type: 'string',
      },
      // 补货原因
      reason: {
        type: 'string',
      },
      // 备注
      note: {
        type: 'string',
      },
      // 唯一UUID
      uuid: {
        type: 'string',
      },
    },
    required: ['GTId', 'WLId', 'imageUrl', 'reason'],
  },
  // 申请日常DPBH [GZ, GTBA]
  shenQingRiChangDPBH: {
    type: 'object',
    properties: {
      // DWId
      DWId: {
        type: 'number',
      },
      // DPId
      DPId: {
        type: 'number',
      },
      // 灯片补货图片
      imageUrl: {
        type: 'string',
      },
      // 补货原因
      reason: {
        type: 'string',
      },
      // 备注
      note: {
        type: 'string',
      },
      // 唯一UUID
      uuid: {
        type: 'string',
      },
    },
    required: ['DWId', 'DPId', 'imageUrl', 'reason'],
  },
  // 批量审批通过WLBHa [KFJL]
  piLiangShenPiTongGuoWLBHa: {
    type: 'object',
    properties: {
      // 物料补货ids:
      // fftd:从这个API开始的的物料ids与“SetWLBHs0AZG”中的的物料ids未统一写法
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // 备注
      note: {
        type: 'string'
      }
    },
    required: ['ids'],
  },
  // 批量审批通过DPBHa [KFJL]
  piLiangShenPiTongGuoDPBHa: {
    type: 'object',
    properties: {
      // 灯片补货ids:
      // fftd:从这个API开始的的灯片ids与“SetDPBHs0AZG”中的的灯片ids未统一写法
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // 备注
      note: {
        type: 'string'
      }
    },
    required: ['ids'],
  },
  // 单独审批通过WLBHa [KFJL]
  danDuShenPiTongGuoWLBHa: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      // fftd：API中此处的KFJLNote应为非必填项
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批通过DPBHa [KFJL]
  danDuShenPiTongGuoDPBHa: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      // fftd：API中此处的KFJLNote应为非必填项
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批驳回WLBHa [KFJL]
  danDuShenPiBoHuiWLBHa: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'KFJLNote'],
  },
  // 单独审批驳回DPBHa [KFJL]
  danDuShenPiBoHuiDPBHa: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 客服经理备注:
      KFJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'KFJLNote'],
  },
  // 为WLBH分配AZGS [PPJL]
  setWLBH0AZGS: {
    type: 'object',
    properties: {
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // WLBHIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'ids'],
  },
  // 为DPBH分配AZGS [PPJL]
  setDPBH0AZGS: {
    type: 'object',
    properties: {
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // DPBHIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGSId', 'ids'],
  },
  // 批量审批通过WLBHb [PPJL]
  piLiangShenPiTongGuoWLBHb: {
    type: 'object',
    properties: {
      // 物料补货ids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // 备注
      note: {
        type: 'string'
      }
    },
    required: ['ids'],
  },
  // 批量审批通过DPBHb [PPJL]
  piLiangShenPiTongGuoDPBHb: {
    type: 'object',
    properties: {
      // 灯片补货ids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // 备注
      note: {
        type: 'string'
      }
    },
    required: ['ids'],
  },
  // 单独审批通过WLBHb [PPJL]
  danDuShenPiTongGuoWLBHb: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批通过DPBHb [PPJL]
  danDuShenPiTongGuoDPBHb: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id'],
  },
  // 单独审批驳回WLBHb [PPJL]
  danDuShenPiBoHuiWLBHb: {
    type: 'object',
    properties: {
      // 物料补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'PPJLNote'],
  },
  // 单独审批驳回DPBHb [PPJL]
  danDuShenPiBoHuiDPBHb: {
    type: 'object',
    properties: {
      // 灯片补货id:
      id: {
        type: 'number',
      },
      // 品牌经理备注:
      PPJLNote: {
        type: 'string',
      },
    },
    required: ['id', 'PPJLNote'],
  },
  // setWLBHYJZXTime [生产GYSGLY]
  setWLBHs0YJZXTime: {
    type: 'object',
    properties: {
      // WLBHids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJZX时间
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['ids', 'YJZXTime'],
  },
  // setDPBHYJZXTime [生产GYSGLY]
  setDPBHs0YJZXTime: {
    type: 'object',
    properties: {
      // DPBHids:
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJZX时间:
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['ids', 'YJZXTime'],
  },
  // 为WLBH分配发货GYS [生产GYS]
  fenPeiWLBHFaHuoGYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // 物料补货Ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'ids'],
  },
  // 为DPBH分配发货GYS [生产GYS]
  fenPeiDPBHFaHuoGYS: {
    type: 'object',
    properties: {
      // GYSId
      GYSId: {
        type: 'number',
      },
      // 灯片补货ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['GYSId', 'ids'],
  },
  // 分配WLBH的AZG [AZGSGLY]
  setWLBHs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // 物料补货Ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'ids'],
  },
  // 分配DPBH的AZG [AZGSGLY]
  setDPBHs0AZG: {
    type: 'object',
    properties: {
      // AZGUserId
      AZGUserId: {
        type: 'number',
      },
      // 灯片补货Ids
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
    },
    required: ['AZGUserId', 'ids'],
  },
  // 安装反馈补货物料状态 [AZG, GTBA]
  anZhuangFanKuiBHWLZhuangTai: {
    type: 'object',
    properties: {
      // WYWL反馈
      WYWLPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // WYWLId
            uuid: {
              type: 'string',
            },
            // 反馈类型
            AZFKType: {
              type: 'string',
              enum: Object.values(DBTables.AZFKType),
            },
            // 反馈图片地址
            imageUrl: {
              type: 'string',
            },
          },
          required: ['uuid', 'AZFKType', 'imageUrl'],
        },
      },
    },
    required: ['WYWLPayloads'],
  },
  // 安装反馈补货灯片状态 [AZG, GTBA]
  anZhuangFanKuiBHDPZhuangTai: {
    type: 'object',
    properties: {
      // DPWL反馈
      WYDPPayloads: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // DPWLId
            uuid: {
              type: 'string',
            },
            // 反馈类型
            AZFKType: {
              type: 'string',
              enum: Object.values(DBTables.AZFKType),
            },
            // 反馈图片地址
            imageUrl: {
              type: 'string',
            },
          },
          required: ['uuid', 'AZFKType', 'imageUrl'],
        },
      },
    },
    required: ['WYDPPayloads'],
  },
  // 获取DDWL装箱任务 [ZHY]
  getDDWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取BHWL装箱任务 [ZHY]
  getBHWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取指定DDGT的DDWL装箱任务 [ZHY]
  getDDGT0DDWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHWL装箱任务 [ZHY]
  getYJZXTimeGT0BHWLZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  // 获取指定DDGT的DDWL已装箱WYWL [ZHY]
  getDDGT0DDWLYiZhuangXiangWYWLList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHWL已装箱WYWL [ZHY]
  getYJZXTimeGT0BHWLYiZhuangXiangWYWLList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  //------------
  // 获取DDDP装箱任务 [ZHY]
  getDDDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取BHDP装箱任务 [ZHY]
  getBHDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取指定DDGT的DDDP装箱任务 [ZHY]
  getDDGT0DDDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHDP装箱任务 [ZHY]
  getYJZXTimeGT0BHDPZhuangXiangList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  // 获取指定DDGT的DDDP已装箱WYDP [ZHY]
  getDDGT0DDDPYiZhuangXiangWYDPList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      DDId: {
        type: 'number',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'DDId', 'GTId'],
  },
  // 获取指定YJZXTimeGT的BHWL已装箱WYWL [ZHY]
  getYJZXTimeGT0BHDPYiZhuangXiangWYDPList: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      YJZXTime: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'YJZXTime', 'GTId'],
  },
  // 获取GYS相关快递箱 [ZHY]
  getGYSXiangGuanKDXs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GYS的WYWL库存 [ZHY]
  getGYSWYWLKuCun: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GT的KDXs [GTBA]
  getGTKDXs: {
    type: 'object',
    properties: {
      // 柜台ID
      GTId: {
        type: 'number',
      },
      // 订单ID
      DDId: {
        type: 'number',
      },
      // 预计装箱时间
      YJZXTime: {
        type: 'string',
      },
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 货物类型
      type: {
        type: 'string',
      },
    },
    required: ['GTId', 'curPage'],
  },
  // 获取AZG的DD任务列表 [AZG]
  getAZGDDTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GTBA的DD任务列表 [GTBA]
  getGTBADDTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GT的DDWL安装列表 [GTBA, AZG]
  getGT0DDWLAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'GTId'],
  },
  // 获取GT的DDDP安装列表 [GTBA, AZG]
  getGT0DDDPAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage', 'GTId'],
  },
  // 获取GT的BHWL安装列表 [GTBA, AZG]
  getGT0BHWLAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取GT的BHDP安装列表 [GTBA, AZG]
  getGT0BHDPAnZhuangTasks: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取当前用户详细信息,如所属品牌等 [PPJL, KFJL]
  getCurUserInfo: {
    type: 'object',
    properties: {},
    required: [],
  },
  // 替换某一柜台的底图 [ADMIN, PPJL, KFJL]
  changeGTImage: {
    type: 'object',
    properties: {
      // 柜台ID
      GTId: {
        type: 'number',
      },
      // 图片文件名
      imageUrl: {
        type: 'string',
      },
    },
    required: ['GTId', 'imageUrl'],
  },
  // 替换某一个灯位的灯片 [ADMIN, PPJL, KFJL]
  replaceDWDP: {
    type: 'object',
    properties: {
      // 灯位ID
      DWId: {
        type: 'number',
      },
      // 灯片ID
      DPId: {
        type: 'number',
      },
    },
    required: ['DWId', 'DPId'],
  },
  // 删除某一个灯位的灯片 [ADMIN, PPJL, KFJL]
  deleteDWDP: {
    type: 'object',
    properties: {
      // 灯位ID
      DWId: {
        type: 'number',
      },
    },
    required: ['DWId'],
  },
  // 设置某个柜台所关联的一个一级组合配置,返回更改后的最新数据 [ADMIN, PPJL, KFJL]
  setGTYJZH: {
    type: 'object',
    properties: {
      // 柜台ID
      GTId: {
        type: 'number',
      },
      // 一级组合ID
      YJZHId: {
        type: 'number',
      },
      // 一级组合数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['GTId','YJZHId','number'],
  },
  // 设置某个柜台的一级组合配置,返回更改后的最新数据 [ADMIN, PPJL, KFJL]
  setGTYJZHs: {
    type: 'object',
    properties: {
      // 柜台ID
      GTId: {
        type: 'number',
      },
      // 一级组合数组[{id,number},...]
      YJZHs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            // 一级组合ID
            id: {
              type: 'number',
            },
            // 数量
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // 二级组合数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['YJZHs','GTId'],
  },
  // 设置某个一级组合所关联的一个二级组合配置 [ADMIN, PPJL, KFJL]
  setYJZHEJZH: {
    type: 'object',
    properties: {
      // 一级组合ID
      YJZHId: {
        type: 'number',
      },
      // 二级组合ID
      EJZHId: {
        type: 'number',
      },
      // 二级组合数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['EJZHId','YJZHId','number'],
  },
  // 设置某个二级组合所关联的一个三级物料配置 [ADMIN, PPJL, KFJL]
  setEJZHSJWL: {
    type: 'object',
    properties: {
      // 二级组合ID
      EJZHId: {
        type: 'number',
      },
      // 物料ID
      SJWLId: {
        type: 'number',
      },
      // 二级组合数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['EJZHId','SJWLId','number'],
  },
  // 设置某个二级组合所关联的一个Tester配置 [ADMIN, PPJL, KFJL]
  setEJZHFGTester: {
    type: 'object',
    properties: {
      // 二级组合ID
      EJZHId: {
        type: 'number',
      },
      // Tester ID
      FGTesterId: {
        type: 'number',
      },
      // 二级组合数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['EJZHId','FGTesterId','number'],
  },
  // 设置某个一级组合的二级组合配置 [ADMIN, PPJL, KFJL]
  setYJZHEJZHs: {
    type: 'object',
    properties: {
      // 一级组合ID
      YJZHId: {
        type: 'number',
      },
      // 二级组合数组[{id,number},...]
      EJZHs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            // 二级组合ID
            id: {
              type: 'number',
            },
            // 数量
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // 二级组合数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['EJZHs','YJZHId'],
  },
  // 设置某个二级组合的3级物料配置,返回更改后的最新数据 [ADMIN, PPJL, KFJL]
  setEJZHSJWLs: {
    type: 'object',
    properties: {
      // 二级组合ID
      EJZHId: {
        type: 'number',
      },
      // 3级物料数组[{id,number},...]
      SJWLs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            // 3级物料ID
            id: {
              type: 'number',
            },
            // 数量
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // 3级物料数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['SJWLs','EJZHId'],
  },
  // 设置某个二级组合的Tester配置,返回更改后的最新数据 [ADMIN, PPJL, KFJL]
  setEJZHFGTesters: {
    type: 'object',
    properties: {
      // 二级组合ID
      EJZHId: {
        type: 'number',
      },
      // Tester数组[{id,number},...]
      FGTesters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            // Tester ID
            id: {
              type: 'number',
            },
            // 数量
            number: {
              type: 'number',
            },
          },
          required: ['id', 'number'],
        },
      },
      // Tester数量,<1则表示删除关联
      number: {
        type: 'number',
      }
    },
    required: ['FGTesters','EJZHId'],
  },
  // 获取某个柜台所关联的一级组合数组 [ADMIN, PPJL, KFJL, GTBA, AZG]
  getGTYJZHList: {
    type: 'object',
    properties: {
      // 柜台ID
      GTId: {
        type: 'number',
      }
    },
    required: ['GTId'],
  },
  // 获取某个一级组合所关联的柜台数组 [ADMIN, PPJL, KFJL]
  getYJZHGTs: {
    type: 'object',
    properties: {
      // 一级组合ID
      YJZHId: {
        type: 'number',
      }
    },
    required: ['YJZHId'],
  },
  // 获取某个柜台所关联的灯位数组 [ADMIN, PPJL, KFJL, GTBA, AZG]
  getGTDWList: {
    type: 'object',
    properties: {
      // 柜台ID
      GTId: {
        type: 'number',
      },
    },
    required: ['GTId'],
  },
  // 灯片关联的灯位, 柜台信息 [ADMIN, PPJL, KFJL]
  getDPDWsInfo: {
    type: 'object',
    properties: {
      // DPId
      DPId: {
        type: 'number',
      },
      // 关键字
      keyword: {
        type: 'string',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['DPId'],
  },
  // 批量生成唯一物料uuid [ADMIN, PPJL, KFJL, GYSGLY]
  generateUniqueWL: {
    type: 'object',
    properties: {
      // WLId
      WLId: {
        type: 'number',
      },
      // 数量
      number: {
        type: 'number',
      },
    },
    required: ['WLId', 'number'],
  },
  // 批量生成唯一灯片uuid [ADMIN, PPJL, KFJL, GYSGLY]
  generateUniqueDP: {
    type: 'object',
    properties: {
      // DD_DW_DPId
      DD_DW_DPId: {
        type: 'number',
      },
      // 数量
      number: {
        type: 'number',
      },
    },
    required: ['DD_DW_DPId', 'number'],
  },
  // 批量生成唯一灯片uuid [ADMIN, PPJL, KFJL, GYSGLY]
  generateUniqueDDGTDPs: {
    type: 'object',
    properties: {
      // DDGTs
      DDGTs: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'object',
          properties: {
            // DDId
            DDId: {
              type: 'number',
            },
            // GTId
            GTId: {
              type: 'number',
            },
          },
          required: ['DDId', 'GTId'],
        },
      },
    },
    required: ['DDGTs'],
  },
  // 批量生成快递箱uuid [ADMIN, PPJL, KFJL, GYSGLY]
  generateUniqueKDX: {
    type: 'object',
    properties: {
      // 数量
      number: {
        type: 'number',
      },
    },
    required: ['number'],
  },
  // 获取指定DD的WLs [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  getDD0WLs: {
    type: 'object',
    properties: {
      // DDId
      id: {
        type: 'number',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['id', 'curPage'],
  },
  // 获取指定DD的DPs [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  getDD0DPs: {
    type: 'object',
    properties: {
      // DDId
      id: {
        type: 'number',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['id', 'curPage'],
  },
  // 获取DD的DPs [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  searchDD0DPs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 订单状态过滤,如"初始,已审批"
      DDStatus: {
        type: 'string',
      },
      // 订单ID过滤
      DDId: {
        type: 'number',
      },
      // 关键字过滤
      keyword: {
        type: 'string',
      },
    },
    required: ['curPage'],
  },
  // 获取补货的DPs [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  searchBH0DPs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 补货状态过滤,如"初始,已审批"
      BHStatus: {
        type: 'string',
      },
      // 关键字过滤
      keyword: {
        type: 'string',
      },
      // 订单ID,仅查询某个订单相关的
      DDId: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 柜台BA获取自己所在柜台所关联的补货的物料清单 [GTBA]
  getGT0BHWLs: {
    type: 'object',
    properties: {
      // 是否是上市补货, 1表示是, 0表示日常补货
      isSSBH: {
        type: 'number',
      },
    },
    required: [],
  },
  // 柜台BA获取自己所在柜台所关联的补货的灯位灯片清单 [GTBA]
  getGT0BHDPs: {
    type: 'object',
    properties: {
      // 是否是上市补货, 1表示是, 0表示日常补货
      isSSBH: {
        type: 'number',
      },
    },
    required: [],
  },
  // 获取某个补货的DP [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  getDPBHInfo: {
    type: 'object',
    properties: {
      // 补货灯片id
      id: {
        type: 'number',
      }
    },
    required: ['id'],
  },
  // 获取DD的WLs [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  searchDD0WLs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 订单状态过滤,如"初始,已审批"
      DDStatus: {
        type: 'string',
      },
      // 订单ID过滤
      DDId: {
        type: 'number',
      },
      // 关键字过滤
      keyword: {
        type: 'string',
      },
    },
    required: ['curPage'],
  },
  // 获取补货的WLs [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  searchBH0WLs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 补货状态过滤,如"初始,已审批"
      BHStatus: {
        type: 'string',
      },
      // 关键字过滤
      keyword: {
        type: 'string',
      },
      // 订单ID,仅查询某个订单相关的
      DDId: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取某个补货的WL [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  getWLBHInfo: {
    type: 'object',
    properties: {
      // 补货物料id
      id: {
        type: 'number',
      }
    },
    required: ['id'],
  },
  // 获取订单物流道具列表 [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  searchWYWLs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 物流状态过滤,如"入库,出库"
      status: {
        type: 'string',
      },
      // 关键字过滤
      keyword: {
        type: 'string',
      },
      // 订单id,仅查询和此订单中的数据
      DDId: {
        type: 'number',
      },
      // 是否只查询补货相关的数据
      BH: {
        type: 'number',
      },
      // 快递箱id,仅查询和此快递箱有关的数据
      KDXId: {
        type: 'number',
      },
      // 柜台id,仅查询和此柜台有关的数据
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取订单物流灯片列表 [ADMIN, PPJL, KFJL, AZGSGLY, AZG, GYSGLY, ZHY]
  searchWYDPs: {
    type: 'object',
    properties: {
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 物流状态过滤,如"入库,出库"
      status: {
        type: 'string',
      },
      // 关键字过滤
      keyword: {
        type: 'string',
      },
      // 是否只查询补货相关的数据
      BH: {
        type: 'number',
      },
      // 订单id,仅查询和此订单中的数据
      DDId: {
        type: 'number',
      },
      // 快递箱id,仅查询和此快递箱有关的数据
      KDXId: {
        type: 'number',
      },
      // 柜台id,仅查询和此柜台有关的数据
      GTId: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取指定DD的Testers [ADMIN, PPJL, KFJL]
  getDD0Testers: {
    type: 'object',
    properties: {
      // DDId
      id: {
        type: 'number',
      },
      // 当前页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['id', 'curPage'],
  },
  // 设置DD_GT_WLs的YJAZDate[AZGSGLY]
  setDDGTWLs0YJAZDate: {
    type: 'object',
    properties: {
      // DD_GT_WLIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJAZDate
      YJAZDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['ids', 'YJAZDate'],
  },
  // 设置DD_DW_DPs的YJAZDate[AZGSGLY]
  setDDDWDPs0YJAZDate: {
    type: 'object',
    properties: {
      // DD_DW_DPIds
      ids: {
        type: 'array',
        minItems: 1,
        uniqueItems: true,
        items: {
          type: 'number',
        },
      },
      // YJAZDate
      YJAZDate: {
        pattern: '\\d{4}-\\d{2}-\\d{2}',
      },
    },
    required: ['ids', 'YJAZDate'],
  },
  // 获取订单的物料安装反馈图[ADMIN,KFJL,PPJL]
  getWLAnZhuangFanKuiDetail: {
    type: 'object',
    properties: {
      // 订单id
      DDId: {
        type: 'number',
      },
      // 柜台id
      GTId: {
        type: 'number',
      },
    },
    required: ['DDId','GTId'],
  },
  // 获取订单的灯片安装反馈图[ADMIN,KFJL,PPJL]
  getDPAnZhuangFanKuiDetail: {
    type: 'object',
    properties: {
      // 订单id
      DDId: {
        type: 'number',
      },
      // 柜台id
      GTId: {
        type: 'number',
      },
    },
    required: ['DDId','GTId'],
  },
  // 获取柜台物流列表[ADMIN,KFJL,PPJL,GYSGLY,ZHY]
  getGTWuLius: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 获取订单柜台列表[ADMIN,KFJL,PPJL,GYSGLY,ZHY]
  getDDGTs: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // 类型,DP或WL或 WL|DP
      type: {
        type: 'string',
      },
    },
    required: ['curPage'],
  },
  // 获取订单柜台列表(用于安装反馈,以安装公司聚合)[ADMIN,KFJL,PPJL,AZGSGLY,AZG]
  getDDGTAZGSs: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
      // AZGSId
      AZGSId: {
        type: 'number',
      },
      // PPId
      PPId: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 安装公司的角色获取订单列表[AZGSGLY,AZG]
  searchDDByAZGS: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 供应商的角色获取订单列表[GYSGLY,ZHY]
  searchDDByGYS: {
    type: 'object',
    properties: {
      // 关键字
      keyword: {
        type: 'string',
      },
      // 页码
      curPage: {
        type: 'number',
      },
      // 分页个数
      perPage: {
        type: 'number',
      },
    },
    required: ['curPage'],
  },
  // 检查某品牌是否还允许创建客服经理[ADMIN,PPJL]
  checkAllowCreateKFJL: {
    type: 'object',
    properties: {
      // PPId
      PPId: {
        type: 'number',
      }
    },
    required: ['PPId'],
  },
  // 获取订单柜台陈列 [ADMIN,PPJL,KFJL,GTBA,GZ,AZG]
  getDDGTCL: {
    type: 'object',
    properties: {
      // DDId
      DDId: {
        type: 'number',
      },
      // GTId
      GTId: {
        type: 'number',
      },
    },
    required: ['DDId', 'GTId'],
  },
};
