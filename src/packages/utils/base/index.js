const fs = require('fs');
const path = require('path');
const util = require('util');
const os = require('os');
const { readJsFileToObject } = require('../os');
const getOptions = require('@mock-server/core/options').getOptions;
const { logger } = require('node-logger-plus');

exports.logger2 = logger;
 

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
 exports.printInColor = function (prints) {
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
 exports.requireMockFile = function (pathStr) {
    const config = readJsFileToObject(pathStr) ?? {};
    return config;
 }
 async function writeLogger(...arg) {
   const _option = await getOptions();
   try {
      const logWritPath = path.resolve(__dirname, _option.cwd, _option.logDir);
      const filePath = path.join(logWritPath, _option.logFileName);

      if (!fs.existsSync(logWritPath)) {
         fs.mkdirSync(logWritPath);
      }
      if (!fs.existsSync(filePath)) {
         fs.writeFileSync(filePath, '');
      }

      const context = `${util.inspect(...arg)}\n`;
      const stat = fs.statSync(filePath);
      if (stat.size > _option.logReplaceMaxSize) {
         fs.writeFileSync(filePath, context);
         console.log(`当前日志大小已经达到${stat.size}Byte已被覆盖`);
      } else {
         fs.appendFileSync(filePath, context);
      }
   } catch (err) {
      console.log('写入日志失败', err);
   }
}

 exports.logger = writeLogger;
