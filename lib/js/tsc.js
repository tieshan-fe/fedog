var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fn = require('../fn')
var exec = require('child_process').exec

var conf = global.conf
var fromDir = conf.root
var toDir = conf.cacheTSC

void function initTscConf(){
    var conff = path.join(fromDir, 'tsconfig.json')
    fn.createF(conff, `
{
    "compilerOptions": {
        "module": "commonjs",
        "rootDir": ".",
        "outDir": "${toDir}"
    },
    "filesGlob": [
        "./**/*.ts"
    ],
    "exclude": [
        "node_modules",
        ".fedog-cache",
        ".git",
        ".sass-cache"
    ]
}
`
)
}()

function transferF(f){
    if (!fs.existsSync(f)){
        return
    }

    var ext = path.extname(f)
    if (['.ts', '.js', '.tpl'].indexOf(ext) == -1){
        return
    }

    var f2 = path.join(toDir, f.replace(fromDir, ''))

    if (ext != '.ts'){
        return fn.copy(f, f2)
    }
}

function transferFs(){
    var ps = []

    fn.walk(fromDir, f => {
        var p = transferF(f)
        if (p){
            ps.push(p)
        }
    })

    return ps
    //return Promise.all(ps)
}

function compile(){

    //处理ts
    var defer = Promise.defer()

    exec('tsc').stdout.on('data', data=>{
        console.log(data)
    })
    .on('end', _=>{
        defer.resolve()
    })

    //处理js,tpl
    var ps = transferFs()
    ps.push(defer.promise)

    return Promise.all(ps)
}

function watch(){
    exec('tsc -w').stdout.on('data', data=>{
        console.log(data)
    })

    fs.watch(fromDir, {recursive:true}, (event, f) => {
        //忽略隐藏文件
        if (f[0] == '.'){
            return
        }
        f = path.join(fromDir, f)
        transferF(f)
    })
}

exports.compile = compile
exports.watch = watch