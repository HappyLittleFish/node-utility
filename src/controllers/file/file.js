const fs = require("fs/promises")
const path = require("path")
const { getVideoDurationInSeconds } = require("get-video-duration")
var moment = require("moment")
var momentDurationFormatSetup = require("moment-duration-format")

momentDurationFormatSetup(moment)

function hasMatch(filename, discard) {
  if (discard instanceof RegExp) {
    return !!filename.match(discard)
  } else {
    return filename.includes(discard)
  }
}

class FileCtl {
  /**
   * 遍历路径，统一去除文件名中需要删除的标识
   * @param {} ctx
   */
  async modifyFilename(ctx) {
    let { filePath, discard, replacer = "" } = ctx.request.body
    const files = await fs
      .readdir(filePath, {
        withFileTypes: true,
      })
      .catch((err) => {
        throw new Error(err)
      })
    // 判断是否是正则字符串
    if (discard.startsWith("/")) {
      discard = eval(discard)
    }
    const renameFile = FileCtl._renameFile(discard, replacer)

    const rec = (dirname, files) => {
      files.forEach(async (file) => {
        if (file.isDirectory()) {
          const dir = path.join(dirname, file.name)
          const files = await fs.readdir(dir, {
            withFileTypes: true,
          })
          rec(dir, files)

          // 递归完成如果文件目录页需要修改，则修改目录
          if (hasMatch(file.name, discard)) {
            renameFile(dirname, file.name)
              .then(() => {})
              .catch((err) => {
                throw new Error(err)
              })
          }
        } else if (hasMatch(file.name, discard)) {
          renameFile(dirname, file.name).catch((err) => {
            throw new Error(err)
          })
        }
      })
    }

    rec(filePath, files)

    ctx.status = 204
  }

  /**
   * 根据路径，遍历统计所有视频时长
   * @param {*} ctx
   */
  async getVideoDuration(ctx) {
    const { dir: fileDir } = ctx.request.query
    const files = await fs
      .readdir(fileDir, {
        withFileTypes: true,
      })
      .catch((err) => {
        throw new Error(err)
      })

    const extArr = [".mp4", ".flv", ".wmv", ".avi"]
    const getVideoDuration = () => {
      let duration = 0
      const rec = async (dirname, files) => {
        for (const file of files) {
          await addDuration(dirname, file)
        }
        return duration
      }
      return rec

      async function addDuration(dirname, file) {
        if (file.isDirectory()) {
          const dir = path.join(dirname, file.name)
          const files = await fs.readdir(dir, {
            withFileTypes: true,
          })
          await rec(dir, files)
        } else {
          if (extArr.includes(path.extname(file.name))) {
            await getVideoDurationInSeconds(path.join(dirname, file.name)).then(
              (dur) => {
                duration += dur
              }
            )
          }
        }
      }
    }
    const getTime = getVideoDuration()
    const duration = await getTime(fileDir, files)
    const res = moment
      .duration(duration, "seconds")
      .format("h" + "小时" + "mm" + "分")
    ctx.body = res
  }

  /**
   * 记录discard和replacer返回重命名函数
   * @param {*} discard
   * @param {*} replacer
   */
  static _renameFile(discard, replacer) {
    return function (dir, filename) {
      return fs.rename(
        path.join(dir, filename),
        path.join(dir, filename.replace(discard, replacer))
      )
    }
  }
}

module.exports = new FileCtl()
