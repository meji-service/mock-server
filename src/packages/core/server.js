const path = require('path');
const NFormData = require('form-data');
const { requireMockFile, logger, printInColor } = require('@mock-server/utils');
const getOptions = require('@mock-server/core/options').getOptions;
const axios = require('axios');
const pick = require('lodash/pick');
const omit = require('lodash/omit');

const axiosInstance = axios.create({

});

const responseTypes = {
    stream: 'stream',
}

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
    const options = await getOptions();
    const { originURL } = await useProxyFormats(options, req);
    printInColor([{ color: 'yellow', text: '如果使用本地mock配置文件数据, enabled需要为true' }]);
    printInColor([{ color: 'green', text: '开始代理转发请求：' }, { color: 'cyan', text: originURL }]);
    const interceptors = options?.interceptors;

    try {
        const newReq = await interceptors?.request?.(req);
        const reqOptions = {
            method: newReq.method,
            url: originURL,
            params: newReq.query,
            data: newReq.body,
            headers: newReq.formatedHeader,
            responseType: responseTypes.stream,
        }
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
        for (let key in response.headers) {
            try {
                logger('设置响应头');
                logger(`${key} => ${response.headers[key]}`)
                res.setHeader(key, response.headers[key]);
            } catch (err) {
                console.log(err);
            }
        }
        response.data.pipe(res); // 将接收到的文件流转发给客户端
        printInColor([{ color: 'green', text: 'success send' }]);
    } catch (reoase) {
        const _status = reoase?.response?.status ?? 500;
        printInColor([{ color: 'red', text: 'error 可观察日志排除错误' }]);
        logger("ERROR===");
        logger(reoase);
        return res.status(_status).send(pick(reoase?.response ?? {}, ['data'])?.data ?? {});
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
    const response = mockOption.mock(pick(req, ['query', 'body']));
    logger(response);
    function sendResponse() {
        res.status(200).send(response);
        printInColor([{ color: 'magenta', text: 'finish' }]);
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
        printInColor([{ color: 'yellow', text: "0.2.14开始proxyURL Function 已经弃用 建议使用 proxyURL Object 配置形式" }]);
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

function useHeaders(_options = {}, _req) {
    if (typeof _options.proxyURL === 'function') {
        return _req.headers;
    }
    const { host, _url } = _options.proxyURL ?? {};
    _req.headers['host'] = host;
    _req.headers['origin'] = _url.origin;
    _req.headers['referer'] = _url.origin;
    return _req.headers;
}

/**
 * mock 服务
 * @param {*} app 
 */
exports.createMockServer = async function (app) {
    const options = await getOptions();
    const { fileWithEnd, mockSrc, cwd } = options;

    app.use(async function (req, res) {
        const pathname = req._parsedUrl.pathname.concat(fileWithEnd);
        const filePath = path.join(cwd, mockSrc, pathname);

        _split('', '>>>');
        try {
            const mockOption = requireMockFile(filePath)?.exports;
            const headers = useHeaders(options, req);

            const formatedHeader = options?.formatHeaders?.(headers) ?? headers;
            req.formatedHeader = formatedHeader;
            if (options.print_req || mockOption?.print_req) {
                logger(pick(req, ['query', 'body', 'headers', 'formatedHeader']));
                console.log('打印req日志完成');
            }
            if (!mockOption?.enabled) {
                printInColor([{ color: 'yellow', text: `本地文件 ${filePath} 查询失败` }]);
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
