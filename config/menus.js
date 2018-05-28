
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
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' },
        { name: '二级组合', key: '/ejzh' }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' }
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
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' },
        { name: '二级组合', key: '/ejzh' }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' }
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
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' },
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
            '/yjzh_edit': { name: '编辑一级组合', key: '/yjzh_edit' }
          }
        }
      ]
    },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' }
      ]
    },
  ],
  "供应商管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' },
    {
      name: '打印标签',
      key: '#print',
      icon: 'Print',
      links:[
        { name: '道具打印', key: '/print_wl' }
      ]
    },
  ],
  "安装公司管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的账户', icon:'PlayerSettings', key: '/me' },
    { name: '账户管理', icon:'Family', key: '/user' }
  ]
};