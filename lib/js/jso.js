var fs = require('fs')
var path = require('path')
var fn = require('../fn')
var conf = global.conf
var UglifyJS = require("uglify-js")

var conf = global.conf
var dogConf = conf.fedog

function o(f){
    var fo = path.parse(f)
    if (fo.ext !== '.js'){
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
        body = UglifyJS.minify(body, {fromString: true}).code
    }

    var f2 = path.join(conf.cacheO, rf)
    fn.createF(f2, body)
}

function optimize(){
    fn.walk(conf.cacheC, f=>{
        o(f)
    })
}

function watch(){
    fs.watch(conf.cacheC, {recursive:true}, (event, f)=>{
        o(path.join(conf.cacheC, f))
    })
}

exports.optimize = optimize
exports.watch = watch
