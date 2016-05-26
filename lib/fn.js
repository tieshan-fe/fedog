var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var exec = require('child_process').exec
var minimatch = require("minimatch")

var fn = {}

//深度遍历文件夹
fn.walk = function (dir, callback){
    fs.readdirSync(dir).forEach(item => {
        //忽略隐藏文件
        if (item[0] == '.'){
            return false
        }

        var f = path.join(dir, item)
        if (fs.statSync(f).isDirectory()){
            fn.walk(f, callback)
        }
        else {
            callback(f)
        }
    })
}

//获取文件内容
fn.getBody = function (f){
    return fs.readFileSync(f).toString()
}

//或者内容md5后8位
fn.getMd5 = function (body){
    var md5 = crypto.createHash('md5')
    md5.update(body)

    var md58 = md5.digest('hex').slice(-8)

    //有一定几率出现md58是纯数字，但是firefox不支持window['123']的情况，所以加前缀
    if (/^\d+$/.test(md58)){
        md58 = 'fec' + md58
    }

    return md58
}

//创建文件
fn.createF = function (f, body){
    var arr = f.split('/')
    var a = '/'
    var b

    while ( (b = arr.shift()) != null ){
        a = path.join(a, b)
        //如果是aa.bb，并且有body
        if ( (typeof body != 'undefined') && /^.+\..+$/.test(b)){
            fs.writeFileSync(a, body.toString())
        }
        else {
            if (!fs.existsSync(a)){
                fs.mkdirSync(a)
            }
        }
    }
}

//复制文件
fn.copy = function (f1, f2){
    var defer = Promise.defer()

    fn.createF(path.dirname(f2))
    exec(`cp -f ${f1} ${f2}`).stdout.on('data', data=>{
        console.log(data)
    })
    .on('end', _=>{
        defer.resolve()
    })
    return defer.promise
}

fn.extend = function (a, b){
    for (c in b){
        a[c] = b[c]
    }
    return a
}

fn.isDir = function (f){
    return fs.lstatSync(f).isDirectory()
}

//rules: 规则array
//f: 项目的相对路径
fn.match = function (rules, f){
    var a = false
    rules.some(b=>{
        if (minimatch(f, b)){
            a = true
            return true
        }
    })
    return a
}


//处理环境变量
fn.rpEnv = function (env, body){
    if (Object.keys(env).length == 0){
        return body
    }

    return body.replace(/(?:@FEDOG\.(\w+)|@\{FEDOG\.(\w+)\})/g, (a, b, c)=>{
        b = b || c
        if (b in env){
            return env[b]
        }
        else {
            return a
        }
    })
}

module.exports = fn
