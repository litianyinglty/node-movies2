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

    for (let i = 0; i < 3; i++) { // 只爬取2页，默认页和点击更多时的这一页
      await sleep(3000)
      await page.click('.more') 
    }

    //获取到的值（都是取的目标页面的值）
    const result = await page.evaluate(()=>{ // 传递的回调函数
      var $ = window.jQuery // 获取到url路径下的jquery(在目标页面控制台打jquery，有就写这代码，没有就不用))
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
    process.send({result}) // 发送出去
    process.exit(0) // 进程退出
  })()