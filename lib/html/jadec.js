var fs = require('fs')
var path = require('path')
var crypto = require('crypto')
var fn = require('../fn')
var jade = require('jade')
var conf = global.conf

var fromDir = conf.root
var toDir = conf.cacheC

function compileJade(f){
    //忽略下划线打头的
    var basef = path.basename(f)

    if ( (path.extname(f) == '.jade') && (basef[0] != '_') ){
        console.log(`compile: ${f.replace(fromDir, '')}`)

        var body = jade.compileFile(f, {pretty:true})()
        var f2 = path.join(toDir, f.replace(fromDir, '')).replace('.jade', '.html')

        fn.createF(f2, body)
    }
}

function compile(){
    fn.walk(fromDir, f => {
        compileJade(f)
    })
}

function watch(){
    fs.watch(fromDir, {recursive:true}, (event, f) => {
        compileJade(path.join(fromDir, f))
    })
}

exports.compile = compile
exports.watch = watch