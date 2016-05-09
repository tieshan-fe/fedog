var fs = require('fs')
var path = require('path')
var fn = require('../fn')
var CleanCSS = require('clean-css')

var conf = global.conf

var fromDir = conf.cacheC
var toDir = conf.cacheO

function o(f){
    var fo = path.parse(f)
    if (fo.ext !== '.css'){
        return
    }

    var rf = f.replace(fromDir, '')
    console.log(`optimize: ${rf}`)

    var body = new CleanCSS().minify(fn.getBody(f)).styles
    var f2 = path.join(toDir, rf)

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