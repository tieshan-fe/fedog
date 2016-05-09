var http = require('http')
var url = require('url')
var path = require('path')
var mime = require('./mime').types
var fs = require('fs')
var exec = require('child_process').exec

var PORT = 8080
var wwwRoot = path.join(process.env.HOME, '.fedog-tmp/www')

function cLink(text, href){
    return `<a href="${href}">${text}</a>`
}

function cHtml(body){
    return `
<!DOCTYPE html>
<html>
<head>
<title>small-fec</title>
<style>
a{
    font-size: 18px;
    text-decoration: none;
    margin: 10px;
    color: #000;
    display: inline-block;
    padding: 10px;
}
a:hover{
    background: #00c0ef;
}
</style>
<meta charset="utf-8" />
</head>
<body>
${body}
</body>
</html>
`
}

var server = http.createServer((req, res) => {
    var pathname = url.parse(req.url).pathname
    var realPath = path.join(wwwRoot, pathname)

    console.log(realPath)

    fs.exists(realPath, exists => {
        if (!exists){
            res.writeHead(404, {
                'Content-type': mime.txt
            })
            res.write('404')
            res.end()
        }
        else {
            var body = ''
            var stat = fs.lstatSync(realPath)
            var isDir = stat.isDirectory()

            //如果文件夹
            if (isDir){
                fs.readdirSync(realPath).forEach(f=>{
                    body += cLink(f, path.join(pathname, f))
                })
                res.writeHead(200, {
                    'Content-type': mime.html
                })
                res.write(cHtml(body))
                res.end()
            }
            //如果文件
            else {
                var ext = path.extname(realPath)
                ext = ext ? ext.slice(1) : mime.txt

                fs.readFile(realPath, 'binary', (err, file) => {
                    if (err){
                        res.writeHead(500, {
                            'Content-type': mime.txt
                        })
                        res.end(err)
                    }
                    else {
                        res.writeHead(200, {
                            'Content-type': mime[ext],
                            'Access-Control-Allow-Origin': '*'
                        })
                        res.write(file, 'binary')
                        res.end()
                    }
                })
            }
        }
    })
})

exports.start = function (){
    server.listen(PORT)
}
exports.stop = function (){

}
exports.clean = function (){
    exec(`rm -rf ${wwwRoot}/*`)
}
exports.open = function (){
    exec(`open ${wwwRoot}`)
}
