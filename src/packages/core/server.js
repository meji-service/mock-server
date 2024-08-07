const path = require('path');
const NFormData = require('form-data');
const { requireMockFile, logger } = require('@mock-server/utils');
const getOptions = require('@mock-server/core/options').getOptions;
const axios = require('axios');
const pick = require('lodash/pick');
const omit = require('lodash/omit');
const { replaceLastSlashAndValue } = require('./tools');
const { analysisWriteRemoteDataFile } = require('./assists');
const { stringifyCode } = require('@mock-server/share');
const nodeLogger = require('node-logger-plus').logger;
const { Logger, Color } = require('node-logger-plus');
const dynamicFileName = '${id}.js';
const axiosInstance = axios.create({

});
const mockServerModels = {
    auto: 'auto',
    remote: 'remote',
    local: 'local',
}

function _split(startStr = '', endStr = '') {
    console.log(Color.cyan(`\n${startStr}-----------------------------------------------------------------------------------------------------------${endStr}\n`))
}

/**
 * 代理发送
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
async function proxySend(req, res) {
    const options = await getOptions();
    const { originURL } = await useProxyFormats(options, req);
    console.log(Logger.decoratorTime(Logger.getLocaleDateTime()), Color.green('开始代理转发请求：'), Color.cyan(originURL))
    const interceptors = options?.interceptors;
    const newReq = await interceptors?.request?.(req) ?? {};
    const reqOptions = {
        method: newReq.method,
        url: originURL,
        params: newReq.query,
        data: newReq.body,
        headers: newReq.formatedHeader,
    }
    try {
        const file = req.file;
        if (file) {
            const formData = new NFormData();
            formData.append(file.fieldname, file.buffer, file.originalname); // 添加文件到formData
            reqOptions.data = formData;
            reqOptions.headers = Object.assign({}, omit(reqOptions.headers,
                [
                    'content-length',
                ]
            ), formData.getHeaders());
        }
        logger(reqOptions);
        const response = await axiosInstance.request(reqOptions);
        // 设置响应头
        const tempResHeader = pick(response.headers, ['content-type', 'content-disposition']);
        for (let key in tempResHeader) {
            try {
                logger('设置响应头');
                logger(`${key} => ${tempResHeader[key]}`)
                res.setHeader(key, tempResHeader[key]);
            } catch (err) {
                console.log(err);
            }
        }
        const newRespData = await interceptors?.response?.(response?.data);
        analysisWriteRemoteDataFile(reqOptions.url, newRespData);
        if (typeof newRespData === 'string') {
            return axiosInstance.request({
                ...response.config,
                responseType: 'stream',
            }).then(streamResp => {
                streamResp.data.pipe(res);
                nodeLogger.success('match:stream send');
            })
        }
        nodeLogger.success('success send');
        logger('response');
        logger(newRespData);
        return res.status(response.status).send(newRespData);
    } catch (reoase) {
        const _status = reoase?.response?.status ?? 500;
        nodeLogger.error(reoase?.response?.data ?? reoase?.response)
        logger(reoase?.response);
        nodeLogger.warn('可观察日志排除错误')
        const _data = reoase?.response?.data ?? '';
        analysisWriteRemoteDataFile(reqOptions.url, _data);
        return res.status(_status).send(_data);
    }
}

/**
 * 响应 mock 本地ts文件内容
 * @param {*} req 
 * @param {*} res 
 * @param {object} mockOption 
 */
async function readFileSend(req, res, mockOption) {
    const options = await getOptions();
    const response = await mockOption.mock(pick(req, ['query', 'body', 'headers', '_parsedUrl']), res);
    logger(response);
    function sendResponse() {
        res.status(200).send(response);
        nodeLogger.success('Read Data Finished');
    }
    if (options.timeout) {
        setTimeout(sendResponse, options.timeout);
    } else {
        sendResponse();
    }
}

async function useProxyFormats(_options = {}, _req) {
    let originURL = '';
    if (typeof _options.proxyURL === 'function') {
        nodeLogger.warn("0.2.14开始proxyURL Function 已经弃用 建议使用 proxyURL Object 配置形式");
        originURL = await _options.proxyURL(_req.url);
    } else {
        const _proxy = _options.proxyURL ?? {};
        originURL = await _proxy.format?.(_req.url, path);
    }
    const _url = new URL(originURL)
    const newURL = `${_url.origin}${_url.pathname}`
    return {
        originURL: newURL,
    }
}

/**
 * mock 服务
 * @param {*} app 
 */
exports.createMockServer = async function (app) {

    app.use(async function (req, res, next) {
        const options = await getOptions();
        const { fileWithEnd, mockSrc, cwd } = options;
        const pathname = req._parsedUrl.pathname.concat(fileWithEnd);
        const filePath = path.join(cwd, mockSrc, pathname);

        _split('', '>>>');
        try {
            let mockOption = requireMockFile(filePath);

            if (mockOption?.mock === void 0) {
                const dynamicFileId = replaceLastSlashAndValue(filePath, dynamicFileName);
                nodeLogger.log(Color.magenta('Mock file Read Retrying'));
                mockOption = requireMockFile(dynamicFileId);
            }
            const headers = omit(req.headers, [
                'host',
                'origin',
                'referer',
                'user-agent',
            ]);
            const formatedHeader = options?.formatHeaders?.(headers) ?? headers;
            req.formatedHeader = formatedHeader;
            if ((!mockOption?.enabled && options.model !== mockServerModels.localServer) ||
                options.model === mockServerModels.remote) {
                nodeLogger.info("【CONFIG】" + stringifyCode({
                    model: options.model,
                    enabled: mockOption?.enabled ?? false,
                }, null, 0) + '【CONFIG END】');
                nodeLogger.warn(`【读取本地文件未成立】from ${filePath}`);
                return await proxySend(req, res);
            }
            nodeLogger.log(Color.magenta('读取文件: '), Color.cyan(filePath));
            return readFileSend(req, res, mockOption);
        } catch (err) {
            console.log(err);
            logger(err, 'Error');
        }
        _split('', '>>>');
        next();
    });
}
