const path = require('path');
const { requireMockFile, logger, printInColor } = require('@mock-server/utils');
const getOptions = require('@mock-server/core/options').getOptions;
const axios = require('axios');
const pick = require('lodash/pick');

function _split(startStr = '', endStr = '') {
    printInColor([
        {
            color: 'cyan',
            text: `\n${startStr}-----------------------------------------------------------------------------------------------------------${endStr}\n`
        }
    ])
}

/**
 * 代理发送
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function proxySend(req, res) {
    const options = getOptions();
    const originURL = options.proxyURL(req.url);
    printInColor([{ color: 'yellow', text: '如果使用本地mock配置文件数据, enabled需要为true' }]);
    printInColor([{ color: 'green', text: '开始代理转发请求：' }, { color: 'cyan', text: originURL }]);
    try {
        const response = await axios.request({
            method: req.method,
            url: originURL,
            data: req.params,
            headers: req.headers,
        });
        printInColor([{ color: 'green', text: 'finish' }]);
        logger(response);
        return res.status(response.status).send(response.data);
    } catch (reoase) {
        const _status = reoase?.response?.status ?? 500;
        printInColor([{ color: 'red', text: 'error' }]);
        logger(reoase);
        return res.status(_status).send(pick(reoase?.response ?? {}, ['data'])?.data ?? {});
    }
}

/**
 * 响应 mock 本地ts文件内容
 * @param {*} req 
 * @param {*} res 
 */
function readFileSend(req, res, mockOption) {
    const options = getOptions();
    const response = mockOption.mock(req);
    function sendResponse() {
        res.status(200).send(response);
    }
    if (options.timeout) {
        setTimeout(sendResponse, options.timeout);
    } else {
        sendResponse();
    }
}

/**
 * mock 服务
 * @param {*} app 
 */
exports.createMockServer = function createMockServer(app) {
    const options = getOptions();
    const { fileWithEnd, mockSrc, cwd } = options;
    app.use(async function (req, res) {
        const pathname = req._parsedUrl.pathname.concat(fileWithEnd);
        const filePath = path.join(cwd, mockSrc, pathname);
        _split('', '>>>');
        try {
            const mockOption = requireMockFile(filePath)?.exports;
            if (!mockOption?.enabled) {
                printInColor([{ color: 'yellow', text: `本地文件${filePath}查询失败` }]);
                return await proxySend(req, res);
            }
            printInColor([{ color: 'magenta', text: '读取文件: ' }, { color: 'cyan', text: filePath, }]);
            return readFileSend(req, res, mockOption);
        } catch (err) {
            console.log(err);
            logger(err, 'Error');
        }
        _split('', '>>>');
    });
}
