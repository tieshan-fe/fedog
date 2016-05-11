var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fn = require('../fn')
var exec = require('child_process').exec

var conf = global.conf
var fromDir = conf.root
var toDir = conf.cacheTSC

function compileTs(f){
    if (!fs.existsSync(f)){
        return
    }

    var ext = path.extname(f)
    if (['.ts', '.js'].indexOf(ext) == -1){
        return
    }

    var f2 = path.join(toDir, f.replace(fromDir, ''))

    if (ext == '.js'){
        return fn.copy(f, f2)
    }
    else {
        console.log(`compile: ${f.replace(fromDir, '')}`)

        var defer = Promise.defer()
        exec(`tsc -m commonjs --out ${f2.replace('.ts', '.js')} ${f}`).stdout.on('data', data=>{
            console.log(data)
        })
        .on('end', _=>{
            console.log('tsc over')
            defer.resolve()
        })

        return defer.promise
    }
}

function compile(){
    var ps = []

    fn.walk(fromDir, f => {
        var p = compileTs(f)
        if (p){
            ps.push(p)
        }
    })

    return Promise.all(ps)
}

function watch(){
    fs.watch(fromDir, {recursive:true}, (event, f) => {
        f = path.join(fromDir, f)
        compileTs(f)
    })
}

exports.compile = compile
exports.watch = watch