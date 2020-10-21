const path = require("path");
const fs = require("fs-extra");
const Koa = require("koa");
const body = require("koa-body");
const views = require("koa-views");
const static = require("koa-static");
const cors = require("@koa/cors");
const router = require("./router");

const initFileJson = require("./initFileJson");
const config = require("./config");
const app = new Koa();
app
  .use(
    body({
      multipart: true,
      formidable: {
        uploadDir: path.join(__dirname, "./"), // 上传目录
        keepExtensions: true, // 保留文件扩展名
        maxFileSize: 200 * 1024 * 1024, // 设置上传文件大小最大限制，默认2M
        onFileBegin: (name, file) => {
          // 最终要保存到的文件夹目录
          const dir = path.join(__dirname, path.dirname(file.name));
          // 检查文件夹是否存在如果不存在则新建文件夹
          fs.ensureDirSync(dir);
          // 重新覆盖 file.path 属性
          file.path = path.join(__dirname, file.name);
        }
      }
    })
  )
  .use(static("./"))
  .use(cors())
  .use(
    views("./views", {
      extension: "ejs"
    })
  )
  .use(router.routes())
  .use(router.allowedMethods())
  .use(async ctx => {
    const dirName = decodeURIComponent(path.join("./", ctx.request.url));
    let files = [];
    if (dirName === "favicon.ico") {
      return;
    }
    try {
      const stats = fs.lstatSync(dirName);
      if (stats.isDirectory()) {
        files = await initFileJson(dirName);
      }
      await ctx.render("index", {
        files
      });
    } catch (error) {
      console.log(dirName);
      console.log(error);
    }
  });
app.listen(config.port);
