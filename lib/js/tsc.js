var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fn = require('../fn')
var exec = require('child_process').exec
var colors = require('colors')

var conf = global.conf
var confr = conf.release
var dogConf = conf.fedog

var fromDir = conf.root
var toDir = conf.cacheTSC

void function initTscConf(){
    var conff = path.join(fromDir, 'tsconfig.json')
    var outDir = toDir.replace(conf.root + '/', '')

    // if (fs.existsSync(conff)){
    //     return
    // }

    var exclude = [
        "node_modules",
        ".fedog-cache",
        ".git",
        ".sass-cache"
    ]

    var func = Array.prototype.push
    func.apply(exclude, dogConf.release.ignore)
    func.apply(exclude, dogConf.release.copy)

    fn.createF(conff, `
{
    "compilerOptions": {
        "module": "commonjs",
        "rootDir": ".",
        "outDir": "${outDir}",
        "allowJs": true
    },
    "filesGlob": [
        "./**/*.ts",
        "./**/*.js"
    ],
    "atom": {
        "rewriteTsconfig": false
    },
    "exclude": ${JSON.stringify(exclude, "\n")}
}
`
)
}()

function transferF(f){
    if (!fs.existsSync(f)){
        return
    }

    var rf = path.relative(fromDir, f)

    //神他妈，ts居然会忽略.min.js
    if (path.extname(f) == '.tpl' || f.slice(-7) == '.min.js' || fn.match(dogConf.release.copy, rf)){
        return fn.copy(f, path.join(toDir, rf))
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

    //处理tpl
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
