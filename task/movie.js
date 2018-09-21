const cp = require('child_process') // 引入子进程
const { resolve } = require('path')
const fs = require('fs')

    ; (async () => {
        const script = resolve(__dirname, '../crawl/list') // 主进程的爬虫
        const child = cp.fork(script, []) // 生成一个子进程
        let invoke = false  // 标识符，判断这个脚本有没有跑起来
        child.on('error', err => { // 监听子进程报错
            if (invoke) {
                return;
            } else {
                invoke = true
            }
            console.log('报错' + JSON.stringify(err))
        })

        child.on('exit', code => { // 监听子进程退出
            if (invoke) {
                return;
            } else {
                invoke = true
            }
            let err = code === 0 ? null : new Error('退出标识' + code)
            console.log('退出' + JSON.stringify(err))
        })

        child.on('message', data => { // 监听到发送过来的值后
            let result = data.result
            console.log("发送过来的值："+JSON.stringify(result))
            fs.writeFile('./data.json',JSON.stringify(result),(err)=>{
                if(err){
                    console.log('文件写入失败')
                }else{
                    console.log('文件写入成功')
                }
            })
        })
    })()