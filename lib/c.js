var fs = require('fs')
var path = require('path')

var tsc = require('./js/tsc')
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
    var isIgnore = ['config.rb', 'fedog.json', 'tsconfig.json'].indexOf(path.relative(fromDir, f)) != -1

    if ( !isIgnore && (['.js', '.ts', '.tpl', '.jade', '.pug', '.scss'].indexOf(ext) == -1) ){
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
