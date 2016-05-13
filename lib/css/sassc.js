var exec = require('child_process').exec
var path = require('path')
var fs = require('fs')
var fn = require('../fn')

var conf = global.conf

var fromDir = conf.root
var toDir = conf.cacheC

void function initRb(){
    //创建config.rb文件
    var conff = path.join(fromDir, 'config.rb')
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

    var p = exec('compass compile')

    p.stdout.on('data', data=>{
        console.log(data)
    })
    .on('end', _=>{
        defer.resolve()
    })

    p.stderr.on('data', data=>{
        console.log(data)
    })

    return defer.promise
}

function watch(){
    var p = exec('compass watch')

    p.stdout.on('data', data=>{
        console.log(data)
    })

    p.stderr.on('data', data=>{
        console.log(data)
    })
}

exports.compile = compile
exports.watch = watch
