const Promise = require('bluebird')
const fs = require('fs')
const path = require('path')
// const stat = Promise.promisify(require('fs').stat)
const readdir = Promise.promisify(require('fs').readdir)

class FileCtl {
  async modifyFilename(ctx) {
    const { filePath, discard, replacer = '' } = ctx.request.body
    const dirname = path.resolve(filePath)
    const files = await readdir(filePath)
    let index = 0
    files.forEach((file) => {
      if (file.includes(discard)) {
        fs.rename(
          path.join(dirname, file),
          path.join(dirname, file.replace(discard, replacer)),
          (err) => {
            if (err) throw err
            console.log('重命名完成')
          }
        )
      }
    })
    ctx.status = 204
  }
}

module.exports = new FileCtl()
