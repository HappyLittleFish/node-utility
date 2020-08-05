const Router = require('koa-router')
const router = new Router()

const { modifyFilename } = require('../controllers/files')

router.put('/modifyFilename', modifyFilename)

module.exports = router
