const router = new require("koa-router")();
const path = require("path");
const fs = require("fs-extra");
const config = require("./config");
router.get("/", async ctx => {
  ctx.response.redirect(config.baseDir);
});
router.post("/delete", async ctx => {
  const req = ctx.request.body;
  if (Array.isArray(req) && req.length > 0 && typeof req[0] === "string") {
    for (const item of req) {
      try {
        await fs.unlink(path.join("./", item));
        ctx.body = {
          s: true,
          msg: ""
        };
      } catch (err) {
        ctx.body = {
          s: false,
          msg: "文件不存在"
        };
      }
    }
    ctx.response.status = 200;
  } else {
    ctx.response.status = 400;
    ctx.body = {
      s: false,
      msg: "参数错误"
    };
  }
});
router.post("/upload", async ctx => {
  ctx.response.status = 200;
  ctx.body = {
    s: true,
    msg: ""
  };
});
router.post("/addDir", async ctx => {
  fs.ensureDirSync(path.join("./" + ctx.request.body.dir));
  ctx.response.status = 200;
  ctx.body = {
    s: true,
    msg: ""
  };
});
router.post("/removeDir", async ctx => {
  const dir = path.join("./" + ctx.request.body.dir);
  if (dir === path.join("./" + config.baseDir)) {
    ctx.response.status = 403;
  } else {
    deleteFolder(dir);
    ctx.response.status = 200;
    ctx.body = {
      s: true,
      msg: ""
    };
  }
  function deleteFolder(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file) {
        var curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) {
          deleteFolder(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
});
module.exports = router;
