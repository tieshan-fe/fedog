var exec = require('child_process').exec
var path = require('path')
var fs = require('fs')
var fn = require('../fn')

var conf = global.conf

var fromDir = conf.root
var toDir = conf.cacheC

void function initRb(){
    //创建config.rb文件
    conff = path.join(fromDir, 'config.rb')
    if (fs.existsSync(conff)){
        return
    }

    css_dir = path.relative(fromDir, toDir)

    fn.createF(conff, `
require "compass/import-once/activate"

http_path = "/"
css_dir = "${css_dir}"
sass_dir = ""
images_dir = ""
`
    )
}()


function compile(){
    var defer = Promise.defer()

    exec('compass compile').stdout.on('data', data=>{
        console.log(data)
    })
    .on('end', _=>{
        defer.resolve()
    })

    return defer.promise
}

function watch(){
    exec('compass watch').stdout.on('data', data=>{
        console.log(data)
    })
}

exports.compile = compile
exports.watch = watch