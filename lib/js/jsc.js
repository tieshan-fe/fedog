var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fn = require('../fn')
var conf = global.conf
var colors = require('colors')

var fromDir = conf.cacheTSC
var toDir = conf.cacheC

var conf = global.conf
var dogConf = conf.fedog

var scanReg = /require\(['|"](.*?)['|"]\)/g

//依赖表
//{'/static/_a.js':['/static/index.js', '/static/index2.js']}
var table = {}

function getDepBody(f, body){
    //去掉root
    var f2 = f.replace(fromDir, '')
    var windowFunc = `window["${fn.getMd5(f2)}"]`
    var body2

    //如果tpl
    if (f.slice(-4) == '.tpl'){
        body2 = `${windowFunc} = '${body.replace(/\r?\n\s*/g, '').replace(/'/g, "\\'")}'`
    }
    else {
        body2 = `
void function (module, exports){
    ${windowFunc} = {};
    ${body.replace(/(module\.)?exports/g, windowFunc).replace(/(^|\n)/g, '\n\t')}
}({exports:{}}, {})

`
    }

    return `
//#----------------mod start----------------
${body2}
//#----------------mod end----------------
`
}

//bf: 根文件
//f: 当前文件
//depo: 根文件相关的依赖信息
function scanJs(bf, f, depo){
    var body = fn.getBody(f)

    var deps = depo.deps
    var deps2 = []
    //相对路径和绝对路径的路径映射
    var t = {}

    var v
    while ((v = scanReg.exec(body)) != null){
        var rdep = v[1]
        var dep

        //如果绝对路径
        if (rdep[0] == '/'){
            dep = path.join(fromDir, rdep)
        }
        else {
            dep = path.join(path.dirname(f), rdep)
        }

        //如果扩展名缺省，则默认为js模块
        if (!path.extname(dep)){
            dep = dep + '.js'
        }

        //添加到路径映射
        t[rdep] = dep.replace(fromDir, '')

        //添加到全局依赖表，用来监控
        if (dep in table){
            if (table[dep].indexOf(bf) == -1){
                table[dep].push(bf)
            }
        }
        else {
            table[dep] = [f]
        }

        deps2.unshift(dep)
    }

    //更新body的相对路径为绝对路径的md5值
    for (a in t){
        var b = t[a]
        var c = fn.getMd5(b)

        body = body.replace(new RegExp('(\\\'|\\\")' + a + '(\\\'|\\\")', 'g'), '"' + c + '"')
    }
    depo.t[f] = body

    deps2.forEach(dep => {
        var i = deps.indexOf(dep)
        if (i != -1){
            deps.splice(i, 1)
        }
        deps.unshift(dep)
        scanJs(bf, dep, depo)
    })
}

function compileJs(f){
    var rf = path.relative(fromDir, f)

    //is exists?
    if (!fs.existsSync(f)){
        return
    }

    //is ignore?
    if (fn.match(dogConf.release.ignore, rf)){
        return
    }

    //is only copy?
    if (fn.match(dogConf.release.copy, rf)){
        console.log(`compile.copy: ${rf}`)
        fn.createF(path.join(toDir, rf), fn.getBody(f))
        return
    }

    console.log(`compile: ${f.replace(fromDir, '')}`)

    var depo = {
        //记录依赖，路径为完整路径
        deps: [],
        //记录依赖对应的内容
        t: {}
    }
    scanJs(f, f, depo)

    var html = ''
    depo.deps.forEach(d=>{
        html += getDepBody(d, depo.t[d])
    })

    html += getDepBody(f, depo.t[f])
    html = html.replace(scanReg, (m, v)=>{
        return `window["${v}"]`
    })

    html = fn.rpEnv(conf.release.env, html)

    fn.createF(path.join(toDir, f.replace(fromDir, '')), html)
}

function compile(){
    fn.walk(fromDir, f => {
        var basef = path.basename(f)
        //忽略下划线打头的
        if ( (basef.slice(-3) == '.js') && (basef[0] != '_') ){
            compileJs(f)
        }
    })
}

function findDeps(f, retDeps){
    var deps = table[f]
    
    if (deps){
        deps.forEach(_=>{
            findDeps(_, retDeps)
        })
    }
    else {
        retDeps.push(f)
    }
}

function watch(){
    fs.watch(fromDir, {recursive:true}, (event, f) => {
        var extname = path.extname(f)

        if (f && (f[0]!='.') && (extname == '.js' || extname == '.tpl') ){

            f = path.join(fromDir, f)

            var deps = []
            findDeps(f, deps)

            deps.forEach(_=>{
                compileJs(_)
            })
        }
    })
}

exports.compile = compile
exports.watch = watch
