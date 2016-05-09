var fs = require('fs')
var path = require('path')
var fn = require('../fn')
var conf = global.conf
var UglifyJS = require("uglify-js")

function o(f){
    var fo = path.parse(f)
    if (fo.ext !== '.js'){
        return
    }

    var rf = f.replace(conf.cacheC, '')
    console.log(`optimize: ${rf}`)

    var body = UglifyJS.minify(fn.getBody(f), {fromString: true}).code
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