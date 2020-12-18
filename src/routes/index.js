const Router = require('koa-router')
const combineRouters = require('koa-combine-routers')

const fileRouter = require('./file')

const router = combineRouters(fileRouter)

module.exports = router
