const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const util = require('node:util');
const os = require('node:os');
const options = require('@mock-server/core/options');

/**
 * 获取本地ip
 * @returns 
 */
exports.getLocalIP = function () {
   const ifaces = os.networkInterfaces();
   let ip;

   Object.keys(ifaces).forEach(ifname => {
      ifaces[ifname].forEach(iface => {
         if (iface.family === 'IPv4' && !iface.internal) {
            ip = iface.address;
         }
      });
   });

   return ip;
}

// 定义颜色
const colors = {
   reset: "\x1b[0m",
   red: "\x1b[31m",
   green: "\x1b[32m",
   yellow: "\x1b[33m",
   blue: "\x1b[34m",
   magenta: "\x1b[35m",
   cyan: "\x1b[36m",
   white: "\x1b[37m"
};
// 打印彩色文本的函数
exports.printInColor = function printInColor(prints) {
   var printStr = prints.map(function (p) {
      return "".concat(colors[p.color]).concat(p.text).concat(colors.reset);
   });
   const _str = printStr.join('');
   console.log(_str);
   return _str;
}

/**
* @param {*} path 
* @returns 
*/
exports.requireMockFile = function requireMockFile(path) {
   try {
      return require(path);
   } catch {
   }
}

exports.logger = function logger(...arg) {
   try {
      const logWritPath = path.resolve(__dirname, options.cwd, options.logDir);
      const flang = fs.existsSync(logWritPath);
      if (!flang) {
         fs.mkdirSync(logWritPath);
      }
      fs.appendFileSync(path.join(logWritPath, options.logFileName), `${util.inspect(...arg)}\n\n`);

   } catch (err) {
      console.log('写入日志失败', err);
   }
}