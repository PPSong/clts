
export default {
  "系统管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的', icon:'PlayerSettings', key: '/me' },
    { name: '账户', key: '/user' },
    { name: '品牌', key: '/pp' },
    { name: '柜台', key: '/gt' },
    { name: '供应商', key: '/gys' },
    { name: '安装公司', html:'安装<br>公司', key: '/azgs' },
    {
      name: '货品',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' }
      ]
    },
  ],
  "品牌经理":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的', icon:'PlayerSettings', key: '/me' },
    { name: '账户', key: '/user' },
    { name: '柜台', key: '/gt' },
    { name: '供应商', key: '/gys' },
    { name: '安装公司', html:'安装<br>公司', key: '/azgs' },
    {
      name: '货品',
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' }
      ]
    },
  ],
  "客服经理":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的', icon:'PlayerSettings', key: '/me' },
    { name: '账户', icon:'Family', key: '/user' },
    { name: '柜台', icon:'Archive', key: '/gt' },
    { name: '供应商', icon:'SplitObject', key: '/gys' },
    { name: '安装公司', icon:'Repair', html:'安装<br>公司', key: '/azgs' },
    {
      name: '货品',
      icon:'Product', 
      key: '#items',
      links:[
        { name: '灯位', key: '/dw' },
        { name: '灯片库', key: '/dp' },
        { name: '物料', key: '/wl' }
      ]
    },
  ],
  "供应商管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的', icon:'PlayerSettings', key: '/me' },
    { name: '账户', key: '/user' }
  ],
  "安装公司管理员":[
    { name: '首页', icon:'Home', key: '/dashboard' },
    { name: '我的', icon:'PlayerSettings', key: '/me' },
    { name: '账户', key: '/user' }
  ]
};