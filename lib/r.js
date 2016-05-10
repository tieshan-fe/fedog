var path = require('path')
var fs = require('fs')
var fn = require('./fn')

var conf = global.conf
var confr = conf.release

var fromDir = conf.cacheC

if (confr.optimize){
    fromDir = conf.cacheO
}
if (confr.version){
    fromDir = conf.cacheV
}

var toDir = path.join(confr.www, conf.fedog.release.project)
fn.createF(toDir)

function r(f){
    if (path.basename(f)[0] == '.'){
        return
    }

    var rf = f.replace(fromDir, '')
    console.log(`release: ${rf}`)
    var f2 = path.join(toDir, rf)
    return fn.copy(f, f2)
}

function release(){
    console.log('\n##################################')
    console.log('release: start...')

    var ps = []
    fn.walk(fromDir, f=>{
        var p = r(f)
        if (p){
            ps.push(p)
        }
    })

    return Promise.all(ps)
}

function watch(){
    console.log('\n##################################')
    console.log('release watch: start...')

    fs.watch(fromDir, {recursive:true}, (event, f)=>{
        r(path.join(fromDir, f))
    })
}

exports.release = release
exports.watch = watch
