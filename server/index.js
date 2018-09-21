const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const { resolve } = require('path')
app.use(views(resolve(__dirname, './views'), {
    extension: 'pug'
}))

app.use(async (ctx, next) => {
    await ctx.render('index',{
        you: 'dujiang',
        me: 'sunhuanhuan'
    })
})

app.listen('3000', () => {
    console.log('server is start')
})