const puppeteer = require('puppeteer')
const base = `https://movie.douban.com/subject/` // 详情的地址base+doubanId
const doubanId = '26739551'
const videoBase = `https://movie.douban.com/trailer/219491`
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
        await page.goto(base + doubanId, {
            waitUntil: 'networkidle2' // 当网络空闲时，说明页面已经加载完毕
        })

        await sleep(1000)

        //获取到的值（都是取的目标页面的值）
        const result = await page.evaluate(() => { // 传递的回调函数
            var $ = window.jQuery // 获取到url路径下的jquery(在目标页面控制台打jquery，有就写这代码，没有就不用))
            var obj = $('.related-pic-video')

            if(obj&&obj.length>=1) {
                var link = obj.attr('href') // 视频的路径
                var cover = obj.css('background-image').split("\"")[1]// 图片
                return {
                    link,
                    cover
                }
            }
        })
        console.log('result',result)
        let video; // 爬取到的视频内容
        if(result.link) { // 有视频地址
            console.log('result.link',result.link)
            await page.goto(result.link,{
                waitUntil: 'networkidle2'
            })
            await sleep(2000)

            video = await page.evaluate(()=>{
                var $ = window.$;
                var obj = $('source')
                if(obj&&obj.length>0) {
                    return obj.attr('src')
                }
            })
        }

        const data = {
            video,
            doubanId,
            cover: result.cover
        }

        browser.close() // 关闭浏览器
        // console.log(result)
        process.send({ data }) // 发送出去
        process.exit(0) // 进程退出
    })()