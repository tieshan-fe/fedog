var fs = require('fs')
var path = require('path')

var jsc = require('./js/jsc')
var sassc = require('./css/sassc')
var jadec = require('./html/jadec')
var fn = require('./fn')

var conf = global.conf

var fromDir = conf.root
var toDir = conf.cacheC

//处理其他文件
function cf(f){
    var ext = path.extname(f)
    var isIgnore = ['config.rb', 'fedog.json'].indexOf(path.relative(fromDir, f)) != -1

    if ( !isIgnore && (ext!='.js') && (ext!='.scss') && (ext!='.jade')){
        var rf = f.replace(fromDir, '')

        console.log(`compile: ${rf}`)
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
        //忽略隐藏文件
        if (f && f[0]!='.'){
            cf(path.join(fromDir, f))
        }
    })
}

function compile(){
    console.log('\n##################################')
    console.log('compile: start...')

    var defer = Promise.defer()

    jadec.compile()
    jsc.compile()
    sassc.compile().then(_=>{
        return c()
    }).then(_=>{
        defer.resolve()
    })

    return defer.promise
}

function watch(){
    console.log('\n##################################')
    console.log('compile watch: start...')

    jadec.watch()
    jsc.watch()
    sassc.watch()
    w()
}

exports.compile = compile
exports.watch = watch