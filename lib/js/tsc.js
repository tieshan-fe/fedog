var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fn = require('../fn')
var exec = require('child_process').exec
var colors = require('colors')

var conf = global.conf
var confr = conf.release
var fromDir = conf.root
var toDir = conf.cacheTSC

void function initTscConf(){
    var conff = path.join(fromDir, 'tsconfig.json')
    var outDir = toDir.replace(conf.root + '/', '')

    if (fs.existsSync(conff)){
        return
    }

    fn.createF(conff, `
{
    "compilerOptions": {
        "module": "commonjs",
        "rootDir": ".",
        "outDir": "${outDir}"
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
}

function compile(){
    //处理ts
    var defer = Promise.defer()

    var p = exec('tsc -w')

    p.stdout.on('data', data=>{
        //第一次全编译完成
        if (data.indexOf('Watching for file changes') != -1){
            defer.resolve()

            if (!confr.watch){
                p.kill()
            }
            return
        }

        //如果error
        if (data.indexOf('error') != -1){
            console.error(colors.red(data))
            return
        }

        console.log(data)

    })

    p.stderr.on('data', data=>{
        console.log(colors.red(data))
    })

    //处理js,tpl
    var ps = transferFs()
    ps.push(defer.promise)

    return Promise.all(ps)
}

function watch(){
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
