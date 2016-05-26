var path = require('path')
var fs = require('fs')
var program = require('commander')
var exec = require('child_process').exec
var fn = require('./fn')
var colors = require('colors')

//解析命令行参数
function fedog(){
    program
        .option('server [s]', 'start up server', _=>{
            initConf()
            var server = require('./server/server.js')

            if (_ == 'start'){
                server.start()
            }
            else if (_ == 'stop'){
                server.stop()
            }
            else if (_ == 'clean'){
                server.clean()
            }
            else if (_ == 'open'){
                server.open()
            }
        })
        .option('release [r]', 'release project', _=>{
            program.release = _
            initConf()
            compile()
        })
        .parse(process.argv)
}

//初始化全局配置
var hasInitConf = false
function initConf (){
    if (hasInitConf){
        return false
    }
    hasInitConf = true

    var conf = global.conf = {
        root: process.cwd(),
        cache: '.fedog-cache'
    }

    conf.cacheTSC = path.join(conf.root, conf.cache, 'a')
    conf.cacheC = path.join(conf.root, conf.cache, 'c')
    conf.cacheO = path.join(conf.root, conf.cache, 'o')
    conf.cacheV = path.join(conf.root, conf.cache, 'v')

    //解析fedog.json
    var n = 'fedog.json'
    var f = path.join(conf.root, n)
    if (!fs.existsSync(f)){
        console.error(`缺少必要的${n}文件!`)
        process.exit()
    }

    try{
        var json = JSON.parse(fn.getBody(f))
    }
    catch(ex){
        console.error(`读取${n}文件失败!`)
        console.log(ex)
        process.exit()
    }
    conf.fedog = json
    conf.fedog.www = path.join(process.env.HOME, '.fedog-tmp/www')

    //设置当前编译配置
    conf.release = fn.extend({
        'optimize': false,
        'version': false,
        'watch': false,
        'domain': false,
        'www': conf.fedog.www,
        'env': {}
    },
    conf.fedog.release.cases[program.release] || {})

    //如果是相对路径
    if (conf.release.www[0] != '/'){
        conf.release.www = path.join(conf.root, conf.release.www)
    }
}


function clean(){
    var defer = Promise.defer()
    exec(`rm -rf ${path.join(conf.root, conf.cache)}`).stdout.on('end', _=>{
        defer.resolve()
    })
    return defer.promise
}

function compile(){
    var compile = require('./c')
    var optimize = require('./o')
    var version = require('./v')
    var release = require('./r')

    var r = conf.release

    clean()
    .then(_=>{
        return compile.compile()
    })
    .then(_=>{
        if (r.optimize){
            return optimize.optimize()
        }
    })
    .then(_=>{
        //if (r.version){
            return version.version()
        //}
    })
    .then(_=>{
        return release.release()
    })
    .then(_=>{
        if (r.watch){
            compile.watch()
            if (r.optimize){
                optimize.watch()
            }
            //if (r.version){
                version.watch()
            //}
            release.watch()
        }
    })
    .catch(_=>{
        console.log(colors.red(_))
    })
}

exports.fedog = fedog
