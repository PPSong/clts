
export default {
  "系统管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    { 
      name: '柜台管理', 
      icon:'Archive', 
      key: '/gt',
      contains:{
        '/gt_edit': { name: '柜台详细', key: '/gt_edit' }
      } 
    },
    { name: '供应商管理', icon:'SplitObject', key: '/gys' },
    { name: '安装公司管理', icon:'Repair', key: '/azgs' },
    { name: '品牌管理', icon:'FavoriteStar', key: '/pp' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp',
          contains:{
            '/dw_ygl': { name: '已关联灯位', key: '/dw_ygl' }
          } 
        },
        { name: '物料', key: '/wl' },
        { name: 'Tester', key: '/tester' },
        { name: '二级组合', key: '/ejzh',
          contains:{
            '/ejzh_edit': { name: '二级组合详细', key: '/ejzh_edit' }
          }
        },
        { name: '一级组合', key: '/yjzh',
          contains:{
            '/yjzh_edit': { name: '一级组合详细', key: '/yjzh_edit' },
            '/yjzh_yygt': { name: '一级组合应用柜台', key: '/yjzh_yygt' }
          }
        }
      ]
    },
    {
      name: '制图管理',
      key: '#show',
      icon: 'Design',
      links:[
        { name: '柜台陈列', key: '/gt_show',
          contains:{
            '/gt_show_detail': { name: '柜台陈列详细', key: '/gt_show_detail' }
          } 
        }
      ]
    },
    {
      name: '任务管理',
      key: '#order',
      icon: 'Trackers',
      links:[
        { name: '订单管理', key: '/dd',
          contains:{
            '/dd_detail': { name: '订单详细', key: '/dd_detail' },
            '/express': { name: '订单物流', key: '/dd_detail' }
          } 
        },
        { name: '补货管理', key: '/bh',
          contains:{
            // '/dd_detail': { name: '订单详细', key: '/dd_detail' }
          } 
        },
        { name: '柜台物流', key: '/gt_express',
          contains:{
            '/gt_express_detail': { name: '柜台快递详细', key: '/gt_express_detail' },
            '/gt_express_detail_wl': { name: '柜台快递箱-道具', key: '/gt_express_detail_wl' },
            '/gt_express_detail_dp': { name: '柜台快递箱-灯片', key: '/gt_express_detail_dp' }
          } 
        }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' },
        { name: '灯片打印', key: '/print_dp' },
        { name: '箱贴打印', key: '/print_kdx' }
      ]
    },
  ],
  "品牌经理":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    { 
      name: '柜台管理', 
      icon:'Archive', 
      key: '/gt',
      contains:{
        '/gt_edit': { name: '编辑柜台', key: '/gt_edit' }
      } 
    },
    { name: '供应商管理', icon:'SplitObject', key: '/gys' },
    { name: '安装公司管理', icon:'Repair', key: '/azgs' },
    {
      name: '货品管理',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp',
          contains:{
            '/dw_ygl': { name: '已关联灯位', key: '/dw_ygl' }
          } 
        },
        { name: '物料', key: '/wl' },
        { name: 'Tester', key: '/tester' },
        { name: '二级组合', key: '/ejzh',
          links:[
            { name: '新建二级组合', key: '/ejzh_create' }
          ],
          contains:{
            '/ejzh_edit': { name: '编辑二级组合', key: '/ejzh_edit' }
          }
        },
        { name: '一级组合', key: '/yjzh',
          links:[
            { name: '新建一级组合', key: '/yjzh_create' }
          ],
          contains:{
            '/yjzh_edit': { name: '编辑一级组合', key: '/yjzh_edit' },
            '/yjzh_yygt': { name: '一级组合应用柜台', key: '/yjzh_yygt' }
          }
        }
      ]
    },
    {
      name: '制图管理',
      key: '#show',
      icon: 'Design',
      links:[
        { name: '柜台陈列', key: '/gt_show',
          contains:{
            '/gt_show_detail': { name: '柜台陈列详细', key: '/gt_show_detail' }
          } 
        }
      ]
    },
    {
      name: '任务管理',
      key: '#order',
      icon: 'Trackers',
      links:[
        { name: '订单管理', key: '/dd',
          contains:{
            '/dd_detail': { name: '订单详细', key: '/dd_detail' },
            '/express': { name: '订单物流', key: '/dd_detail' }
          } 
        },
        { name: '补货管理', key: '/bh',
          contains:{
            // '/dd_detail': { name: '订单详细', key: '/dd_detail' }
          } 
        },
        { name: '柜台物流', key: '/gt_express',
          contains:{
            '/gt_express_detail': { name: '柜台快递详细', key: '/gt_express_detail' },
            '/gt_express_detail_wl': { name: '柜台快递箱-道具', key: '/gt_express_detail_wl' },
            '/gt_express_detail_dp': { name: '柜台快递箱-灯片', key: '/gt_express_detail_dp' }
          } 
        }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' },
        { name: '灯片打印', key: '/print_dp' },
        { name: '箱贴打印', key: '/print_kdx' }
      ]
    },
  ],
  "客服经理":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    { 
      name: '柜台管理', 
      icon:'Archive', 
      key: '/gt',
      contains:{
        '/gt_edit': { name: '编辑柜台', key: '/gt_edit' }
      } 
    },
    { name: '供应商管理', icon:'SplitObject', key: '/gys' },
    { name: '安装公司管理', icon:'Repair', key: '/azgs' },
    {
      name: '货品管理',
      icon:'Product', 
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp',
          contains:{
            '/dw_ygl': { name: '已关联灯位', key: '/dw_ygl' }
          } 
        },
        { name: '物料', key: '/wl' },
        { name: 'Tester', key: '/tester' },
        { name: '二级组合', key: '/ejzh',
          links:[
            { name: '新建二级组合', key: '/ejzh_create' }
          ],
          contains:{
            '/ejzh_edit': { name: '编辑二级组合', key: '/ejzh_edit' }
          }
        },
        { name: '一级组合', key: '/yjzh',
          links:[
            { name: '新建一级组合', key: '/yjzh_create' }
          ],
          contains:{
            '/yjzh_edit': { name: '编辑一级组合', key: '/yjzh_edit' },
            '/yjzh_yygt': { name: '一级组合应用柜台', key: '/yjzh_yygt' }
          }
        }
      ]
    },
    {
      name: '制图管理',
      key: '#show',
      icon: 'Design',
      links:[
        { name: '柜台陈列', key: '/gt_show',
          contains:{
            '/gt_show_detail': { name: '柜台陈列详细', key: '/gt_show_detail' }
          } 
        }
      ]
    },
    {
      name: '任务管理',
      key: '#order',
      icon: 'Trackers',
      links:[
        { name: '订单管理', key: '/dd',
          contains:{
            '/dd_detail': { name: '订单详细', key: '/dd_detail' },
            '/express': { name: '订单物流', key: '/dd_detail' }
          } 
        },
        { name: '补货管理', key: '/bh',
          contains:{
            // '/dd_detail': { name: '订单详细', key: '/dd_detail' }
          } 
        },
        { name: '柜台物流', key: '/gt_express',
          contains:{
            '/gt_express_detail': { name: '柜台快递详细', key: '/gt_express_detail' },
            '/gt_express_detail_wl': { name: '柜台快递箱-道具', key: '/gt_express_detail_wl' },
            '/gt_express_detail_dp': { name: '柜台快递箱-灯片', key: '/gt_express_detail_dp' }
          } 
        }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' },
        { name: '灯片打印', key: '/print_dp' },
        { name: '箱贴打印', key: '/print_kdx' }
      ]
    },
  ],
  "供应商管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    {
      name: '任务管理',
      key: '#task',
      icon: 'Trackers',
      links:[
        { name: '订单管理', key: '/dd' },
        { name: '补货管理', key: '/bh' }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' },
        { name: '灯片打印', key: '/print_dp' },
        { name: '箱贴打印', key: '/print_kdx' }
      ]
    },
  ],
  "安装公司管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    {
      name: '任务管理',
      key: '#task',
      icon: 'Trackers',
      links:[
        { name: '订单管理', key: '/dd' },
        { name: '补货管理', key: '/bh' }
      ]
    }
  ]
};