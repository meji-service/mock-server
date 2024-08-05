const fs = require('fs');
const { readJsFileToObject } = require('@mock-server/utils/os');
const path = require('path');

module.exports = {
    // 自定义的replacer函数
    replacer(key, value) {
        if (typeof value === 'function') {
            // 如果值是函数，返回函数的字符串表示
            return JSON.stringify(value(), null, 0);
        }
        return value;
    },
    stringifyCode(data) {
        return JSON.stringify(data ?? '', null, 4);
    },
    getTemplate(_editConfig, data = '') {
        const { enabled = true } = _editConfig ?? {};
        const code = 'exports.enabled = ' + enabled + ';\n' +
            'exports.mock = () => (' + JSON.stringify(data ?? '', null, 4) + '); \n\n';
        return code;
    },
    async update(dirname, id, callback) {
        try {
            const editTargetPath = path.resolve(dirname, id);
            const _editConfig = readJsFileToObject(editTargetPath) ?? {};
            const dataSource = await _editConfig.mock();
            const newData = await callback(dataSource)
            const code = '// mockjs' + '\n\n' + this.getTemplate(_editConfig, newData) +
                `/** 上一个模板：\n${this.getTemplate(_editConfig, dataSource ?? null)} */`;
            fs.writeFileSync(editTargetPath, code);
            return true;
        } catch (err) {
            console.log(err, '编辑失败');
        }
        return false;
    }
}