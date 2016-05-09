var path = require('path')
var fs = require('fs')

var jso = require('./js/jso')
var csso = require('./css/csso')
var conf = global.conf
var fn = require('./fn')

var fromDir = conf.cacheC
var toDir = conf.cacheO

//处理其他文件
function of(f){
    var ext = path.extname(f)

    if ( (ext!='.js') && (ext!='.css') ){
        var rf = f.replace(fromDir, '')
        console.log(`optimize: ${rf}`)
        var f2 = path.join(toDir, rf)
        return fn.copy(f, f2)
    }
}

function o(){
    var ps = []
    fn.walk(fromDir, f=>{
        var p = of(f)
        if (p){
            ps.push(p)
        }
    })

    return Promise.all(ps)
}

function w(){
    fs.watch(fromDir, {recursive:true}, (event, f) => {
        of(path.join(fromDir, f))
    })
}

function optimize(){
    console.log('\n##################################')
    console.log('optimize: start...')

    var defer = Promise.defer()

    jso.optimize()
    csso.optimize()

    o().then(_=>{
        defer.resolve()
    })

    return defer.promise
}

function watch(){
    console.log('\n##################################')
    console.log('optimize watch: start...')

    jso.watch()
    csso.watch()
    w()
}

exports.optimize = optimize
exports.watch = watch