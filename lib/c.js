var fs = require('fs')
var path = require('path')

var tsc = require('./js/tsc')
var jsc = require('./js/jsc')
var sassc = require('./css/sassc')
var jadec = require('./html/jadec')
var fn = require('./fn')
var colors = require('colors')
var glob = require("glob")

var conf = global.conf
var dogConf = conf.fedog

var fromDir = conf.root
var toDir = conf.cacheC

//处理其他文件
function cf(f){
    var ext = path.extname(f)
    var rf = path.relative(fromDir, f)

    var isIgnore =  fn.match(dogConf.release.ignore, rf)

    if ( !isIgnore && (['.js', '.ts', '.tpl', '.jade', '.scss'].indexOf(ext) == -1) ){
        console.log(`compile.copy: ${rf}`)

        var f2 = path.join(toDir, rf)
        return fn.copy(f, f2)
    }
}

function c(){
    var ps = []
    fn.walk(fromDir, f=>{
        var p = cf(f)
        if (p){
            ps.push(p)
        }
    })

    return Promise.all(ps)
}

function w(){
    fs.watch(fromDir, {recursive:true}, (event, f) => {
        var f2 = path.join(fromDir, f)

        //忽略删除的文件或者文件夹
        if (!fs.existsSync(f2) || fn.isDir(f2)){
            return
        }

        //忽略隐藏文件
        if (f[0]!='.'){
            cf(f)
        }
    })
}

function compile(){
    console.log('\n##################################')
    console.log('compile: start...')

    var defer = Promise.defer()

    jadec.compile()
    tsc.compile().then(_=>{
        jsc.compile()
    })
    .then(_=>{
        return sassc.compile()
    })
    .then(_=>{
        return c()
    })
    .then(_=>{
        defer.resolve()
    })
    .catch(_=>{
        console.log(colors.red(_))
    })

    return defer.promise
}

function watch(){
    console.log('\n##################################')
    console.log('compile watch: start...')

    jadec.watch()
    tsc.watch()
    jsc.watch()
    sassc.watch()
    w()
}

exports.compile = compile
exports.watch = watch
