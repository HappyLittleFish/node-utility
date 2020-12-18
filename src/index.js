const Koa = require("koa")
const fs = require("fs")
const koaBody = require("koa-body")
const http = require("http")

const router = require("./routes")

const app = new Koa()

app.use(koaBody())

app.use(router())

app.use((ctx) => {
  ctx.body = "hello world!"
})

const server = http.createServer(app.callback())

server.listen(4001)

server.on("listening", () => {
  console.log("server is listening 4001 port")
})

// server.listening = () => {
// 	console.log('server is listening 4000 port')
// }
