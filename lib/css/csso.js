var fs = require('fs')
var path = require('path')
var fn = require('../fn')
var CleanCSS = require('clean-css')

var conf = global.conf
var dogConf = conf.fedog

var fromDir = conf.cacheC
var toDir = conf.cacheO

function o(f){
    var fo = path.parse(f)
    if (fo.ext !== '.css'){
        return
    }

    var rf = path.relative(conf.cacheC, f)
    var body = fn.getBody(f)

    //is not only copy?
    if (fn.match(dogConf.release.copy, rf)){
        console.log(`optimize.copy: ${rf}`)
    }
    else {
        console.log(`optimize: ${rf}`)
        body = new CleanCSS().minify(body).styles
    }

    var f2 = path.join(conf.cacheO, rf)
    fn.createF(f2, body)
}

function optimize(){
    fn.walk(fromDir, f=>{
        o(f)
    })
}

function watch(){
    fs.watch(fromDir, {recursive:true}, (event, f)=>{
        o(path.join(fromDir, f))
    })
}

exports.optimize = optimize
exports.watch = watch
