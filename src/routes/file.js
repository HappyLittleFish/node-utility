const Router = require('koa-router')
const router = new Router()

const { modifyFilename,getVideoDuration } = require('../controllers/file/file')

router.put('/modifyFilename', modifyFilename)

router.get('/getVideoDuration', getVideoDuration)

module.exports = router
