const { getTemplate } = require('@mock-server/share');
const fs = require('fs');
const path = require('path');
const { logger } = require('node-logger-plus');

const diffecenerFormats = {
    'json': 'js',
    'js': 'json'
}

const transformFileWithEnds = {
    [diffecenerFormats.json]: 'json',
    [diffecenerFormats.js]: 'js',
}

const mockRequest = { 'query': {}, 'body': {}, 'headers': {}, '_parsedUrl': { path: '' } };
const mockResponse = { send: () => { }, status: () => { } };
const transformTemplates = {
    [diffecenerFormats.json]: (config) => {
        return JSON.stringify(config?.mock?.(mockRequest, mockResponse) ?? '', null, 4);
    },
    [diffecenerFormats.js]: (_data) => {
        return getTemplate({}, _data);
    },
}
module.exports = {
    jsToJson: createFileFormatTransform(diffecenerFormats.json, transformTemplates),
    jsonToJs: createFileFormatTransform(diffecenerFormats.js, transformTemplates),
    transformTemplates,
}

/**
 * @param {string} type
 * @param {{[x: string]: (d: andy) => any}} template 
 * @returns {(c: string, o: string) => boolean}
 */
function createFileFormatTransform(type, template) {
    let transform = template[type];
    const cwd = process.cwd();
    return async function (comeDirPath = '', outputDirPath = '', format) {
        if (typeof format === 'function') {
            transform = format;
        }
        try {
            if (!comeDirPath || !outputDirPath) {
                throw new Error('Invalid input path');
            }
            const _comeDirPath = path.join(cwd, comeDirPath);
            const _outputDirPath = path.join(cwd, outputDirPath);
            const comeDirIds = readdirRecursive(_comeDirPath).filter(path => path.endsWith(type)).map(url => path.relative(_comeDirPath, url));
            if (!comeDirIds.length) {
                logger.warn(`File Dir length 0`);
            }
            const toWithEnd = transformFileWithEnds[type];
            const fromWithEnd = diffecenerFormats[toWithEnd];
            comeDirIds.forEach(id => {
                try {
                    const readFilePath = path.join(_comeDirPath, id);
                    const writeFilePath = path.join(_outputDirPath, id.replace(RegExp(`.${fromWithEnd}$`), `.${toWithEnd}`));
                    const result = transform(__non_webpack_require__(readFilePath));
                    if (!fs.existsSync(writeFilePath)) {
                        fs.mkdirSync(path.dirname(writeFilePath), { recursive: true });
                    }
                    fs.writeFileSync(writeFilePath, result, { encoding: 'utf8' });
                    logger.success(`Transform ${id} from ${fromWithEnd} to ${toWithEnd} success`);
                } catch (err) {
                    logger.warn(`Transform ${id} from ${fromWithEnd} to ${toWithEnd} fail`);
                    logger.error(err.message);
                }
            });
        } catch (err) {
            logger.error(err.message);
        }
    }
}

function readdirRecursive(directory) {
    let fullPathFiles = [];
    try {
        let filesAndDirectories = fs.readdirSync(directory);
        filesAndDirectories.forEach((item) => {
            let fullPath = path.join(directory, item);
            let stats = fs.lstatSync(fullPath);

            if (stats.isDirectory()) {
                fullPathFiles = fullPathFiles.concat(readdirRecursive(fullPath));
            } else {
                fullPathFiles.push(fullPath);
            }
        });

    } catch (err) {
        logger.error(err.message);
    }
    return fullPathFiles;
}