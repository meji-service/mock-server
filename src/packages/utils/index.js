const fs = require('fs');
const path = require('path');
const util = require('util');
const os = require('os');
const { readJsFileToObject } = require('@mock-server/utils/os');
const getOptions = require('@mock-server/core/options').getOptions;

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

const flangErrorLog = '可编辑本地mock文件条件未成立 => 读取本地mock => 发送远程服务情况';

/**
 * 
 * @param {*} sourceContext 
 * @param {string} targetMockFilePath 
 * @returns 
 */
function useMockUnit(sourceContext, sourceCode, targetMockFilePath) {
   try {
      const { exports: _exports = {} } = sourceContext ?? {};
      const { targetId: _targetId, cwd = '../' } = _exports?.config ?? {};
      if (!_targetId || !_exports?.mockUtil || !_exports?.enabled) {
         return console.log(flangErrorLog);
      }
      const editMockFilePath = path.resolve(targetMockFilePath, cwd, _targetId);
      const { _context: editContext, _code: editCode } = readJsFileToObject(editMockFilePath) ?? {};
      _exports.mockUtil.setup({
         editPath: editMockFilePath,
         sourcePath: targetMockFilePath,
         sourceCode,
         sourceContext,
         editContext,
         editCode,
      });
   } catch (err) {
      console.log(err);
   }
}


/**
* @param {*} path 
* @returns 
*/
exports.requireMockFile = function requireMockFile(pathStr) {
   const { _context, _code } = readJsFileToObject(pathStr) ?? {};
   useMockUnit(_context, _code, pathStr);
   return _context;
}

exports.logger = async function (...arg) {
   const _option = await getOptions();
   try {
      const logWritPath = path.resolve(__dirname, _option.cwd, _option.logDir);
      const flang = fs.existsSync(logWritPath);
      if (!flang) {
         fs.mkdirSync(logWritPath);
      }
      const filePath = path.join(logWritPath, _option.logFileName);
      const context =  `${util.inspect(...arg)}\n\n`;
      const stat = fs.statSync(filePath);
      if(stat.size > _option.logReplaceMaxSize) {
         fs.writeFileSync(filePath, context);
         console.log(`当前日志大小已经达到${stat.size}Byte已被覆盖`);
      } else {
         fs.appendFileSync(filePath, context);
      }
   } catch (err) {
      console.log('写入日志失败', err);
   }
}