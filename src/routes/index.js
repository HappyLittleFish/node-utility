const Router = require('koa-router')
const combineRouters = require('koa-combine-routers')

const fileRouter = require('./files')

const router = combineRouters(fileRouter)

module.exports = router
