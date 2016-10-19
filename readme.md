前端🐶专用开发工具

===
```
//依赖
npm install -g typescript
gem install compass

//fedog
npm install -g fedog
```

===
```
依赖node版本： node 6.0.0以上

支持功能：
一、编译
  jade      //默认.jade文件会被编译为.html文件，如果为.tpl.jade，则会编译为.tpl文件。
  markdown
  typescript //需要全局安装npm install -g typescript
  commonjs
  compass   //需要提前安装http://compass-style.org/

二、压缩
  js
  css

三、静态资源加版本号

四、自带server
```

===
```
主要命令：
一、server
  fedog server start //开启server服务
  fedog server open  //打开server目录
  fedog server clean //清空server目录

二、release
  fedog release [case] //执行release, case为fedog.json中描述
```

===
```
工程根目录需要fedog.json文件，内容如下
{
    "server": {
        "port": 8080    //server监听的端口
    },
    "release": {
        "project": "",  //项目名，会加到被引用的资源前
        "domain": "",   //域名，会加到被引用的资源前
        "cases": {
            "dev": {
                "optimize": false,
                "version": true,
                "watch": true,

                //常量注入
                //js里使用：let a = "@{FEDOG.aa}" => let a = "aaaa"
                //jade里使用： #{FEDOG.aa}
                "env": {    
                    "aa": "aaaa",
                    "bb": "bbbb",
                    "a": "cc"
                }
            },
            "qa": {
                "optimize": true, //是否压缩，默认false
                "version": true,  //是否加版本号，默认false
                "watch": false,   //是否watch，默认false
                "domain": true    //是否启用域名，默认false
                "www": "../www"   //处理过的资源目标地址，默认为/Users/${user}/.fedog-tmp/www
            }
        },
        // 设置文件原样复制，中间不做任何处理
        "copy": [
            "**/*.min.js",
            "static/script/copy/**/*"
        ],
        // 设置文件忽略
        "ignore": [
            "static/script/ignore/**/*",
            "config.rb",
            "fedog.json",
            "tsconfig.json",
            "run.py"
        ]
    }
}
```
