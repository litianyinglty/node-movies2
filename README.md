# node-movies
    用koa+react实现的电影网站

# 技术栈 
    koa+puppeteer

## git创建和合并分支    
    git checkout -b path5-5

# 学习步骤   
    
## 1.爬取豆瓣的数据
    1).puppeteer项目地址：  https://github.com/GoogleChrome/puppeteer ,API参考      https://yq.aliyun.com/articles/607102   

    2).windows安装    npm install --save puppeteer     

    3).写入以下代码      
      const puppeteer = require('puppeteer')
        const url = `https://movie.douban.com/tag/#/?sort=S&range=6,10&tags=` //爬取数据的数据源
        const sleep = time => new Promise(resolve => { // 设置定时函数
        setTimeout(resolve, time)
        })
        ; (async () => { // 立即执行
            console.log('开始执行')
            const browser = await puppeteer.launch({ // 设置一个看不见的浏览器
            args: ['--no-sandbox'], // 非杀伤模式
            dumpio: false  // 是否将浏览器进程标准输出和标准错误输入到process.stdout和process.stderr中
            })
            const page = await browser.newPage(); // 开启一个新页面
            await page.goto(url, {
            waitUntil: 'networkidle2' // 当网络空闲时，说明页面已经加载完毕
            })

            await sleep(3000)
            await page.waitForSelector('.more') // 要等待的元素（这里是f12查到的，加载更多标签的class）

            for (let i = 0; i < 2; i++) { // 只爬取2页，默认页和点击更多时的这一页
            await sleep(3000)
            await page.click('.more') 
            }

            //获取到的值（都是取的目标页面的值）
            const result = await page.evaluate(()=>{ // 传递的回调函数
            var $ = window.$ // 获取到url路径下的jquery(在目标页面控制台打jquery，有就写这代码，没有就不用))
            var items = $('.list-wp a') // 获取要爬取的dom元素（F12审查找到的）    
            var links = [] // 搜集爬取的数据  

            if(items.length>=1){ // 判断有没有数据，有才循环
                items.each((index,item)=>{
                let it = $(item)
                let doubanId = it.find('div').data('id') // 找到这条dom的id（F12审查找到的）
                let title = it.find('.title').text() // 标题
                let rate = Number(it.find('.rate').text()) // 评分
                let pic = it.find('img').attr('src').replace('s_ratio','l_ratio') // 图片，他的路径可以改成大图
                links.push({
                    index,
                    doubanId,
                    title,
                    rate,
                    pic
                })
                })
            }

            return links
            })

            browser.close() // 关闭浏览器
            console.log(result)
        })()

## 2.使用子进程来执行爬虫
    在task下面的movie.js

    const cp = require('child_process') // 引入子进程
const { resolve } = require('path')

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
                invoke = false
            }
            let err = code === 0 ? null : new Error('退出标识' + code)
            console.log('退出' + JSON.stringify(err))
        })

        child.on('message', data => { // 监听到发送过来的值后
            let result = data.result
            console.log("发送过来的值："+JSON.stringify(result))
        })
    })()



