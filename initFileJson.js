const fs = require("fs-extra");
const path = require("path");
const chalk = require("chalk");
const log = console.log;
const config = require("./config");
function readFile(dir, files) {
  return fs.readdir(dir).then(res => {
    for (item of res) {
      const target = decodeURIComponent(path.join(dir, item));
      if (fs.lstatSync(target).isDirectory()) {
        const temp = {
          type: "dir",
          url: "/" + target.replace(/\\/g, "/"),
          name: item,
          children: []
        };
        files.push(temp);
        // 是否递归获取所有文件
        config.readAll && readFile(target, temp.children);
      } else if (isImage(target)) {
        files.push({
          type: "img",
          url: "/" + target.replace(/\\/g, "/"),
          name: item
        });
      } else if (isVideo(target)) {
        files.push({
          type: "video",
          url: "/" + target.replace(/\\/g, "/"),
          name: item
        });
      } else {
        files.push({
          type: "other",
          url: "/" + target.replace(/\\/g, "/"),
          name: item
        });
      }
    }
  });
}

function initFileJson(baseDir, outputPath) {
  const files = [];
  baseDir = decodeURIComponent(baseDir);
  if (baseDir && typeof baseDir === "string" && fs.lstatSync(baseDir).isDirectory()) {
    const startTime = Date.now();
    return readFile(baseDir, files).then(() => {
      if (outputPath) {
        fs.ensureDirSync(path.dirname(outputPath));
        fs.writeJsonSync(outputPath, files);
      }
      const endTime = Date.now();
      log(chalk.yellow.bold("init file json complete!"), chalk.blue("耗时", endTime - startTime, "ms"));
      return files;
    });
  } else {
    return Promise.reject({
      message: "baseDir error: 文件夹路径无效"
    });
  }
}

function isImage(value) {
  return [".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp", ".psd", ".svg", ".tiff"].includes(path.extname(value).toLowerCase());
}
function isVideo(value) {
  return [".mp4", ".avi", ".mov", ".rmvb", ".flv", ".3gp"].includes(path.extname(value).toLowerCase());
}
module.exports = initFileJson;
