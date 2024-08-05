const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const mockShare = require('@mock-server/share');
const { getOptions } = require('@mock-server/core/options');
const { logger, printInColor } = require('@mock-server/utils');
const startCommands = program.commands[0];

exports.analysisWriteRemoteDataFile = async function (apiUrl, data) {
    if (!startCommands._optionValues.scan) {
        return;
    }
    printInColor([{ color: 'magenta', text: 'Pulling remote API...' }]);
    try {
        const { scan, cwd } = getOptions();
        const writeFilePath = path.join(cwd, scan.outputChunk(apiUrl.replace(/^http:\/\/|^https:\/\//ig, ''))).concat(scan.format);
        const code = scan.format === '.js' ? mockShare.getTemplate({}, data) : mockShare.stringifyCode(data ?? '');
        const dirName = path.dirname(writeFilePath);
        if(!fs.existsSync(dirName)) {
            fs.mkdirSync(dirName, { recursive: true });
        }
        fs.writeFileSync(writeFilePath, code, { encoding: 'utf8' });
        printInColor([{ color: 'green', text: `Echo ${writeFilePath} Successfly` }]);
    } catch (err) {
        console.error(err.message);
        logger(err);
    }
}