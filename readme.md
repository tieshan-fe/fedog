前端🐶专用开发工具

===
```
npm install -g fedog 
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
                "watch": true
            },
            "qa": {
                "optimize": true, //是否压缩，默认false
                "version": true,  //是否加版本号，默认false
                "watch": false,   //是否watch，默认false
                "www": "../www"   //处理过的资源目标地址，默认为/Users/${user}/.fedog-tmp/www
            }
        }
    }
}
```
