const lodashMerge = require('lodash/merge');
const fs = require('fs');

module.exports = class MockUtil {
    #sourcePath;
    #editPath;
    #sourceContext;
    #editContext;
    #pickKes;
    constructor() {
    }
    // 自定义的replacer函数
    static replacer(key, value) {
        if (typeof value === 'function') {
            // 如果值是函数，返回函数的字符串表示
            return JSON.stringify(value(), null, 0);
        }
        return value;
    }

    setup(props) {
        this.#sourcePath = props.sourcePath;
        this.#editPath = props.editPath;
        this.#sourceContext = props.sourceContext
        this.#editContext = props.editContext

    }
    getCodeString(template, data, force) {
        const { enabled = true, config = {}, mock } = template ?? {};
        const oldData = mock?.() ?? {};
        const _tempData = force ? data : lodashMerge({}, oldData, data);
        const code = 'exports.enabled = ' + enabled + ';\n' +
            'exports.config = ' + JSON.stringify(config, null, 4) + '\n\n' +
            'exports.mock = () => (' + JSON.stringify(_tempData, null, 4) + '); \n\n';
        return code;
    }
    update(data, force = false) {
        try {
            const { config = {} } = this.#sourceContext?.exports ?? {};
            if (!config?.targetId) {
                console.log(`未满足调用 exports.mockUtil.update 条件，考虑是否正确配置config`);
                return false;
            }
            let _editContextExport = this.#editContext?.exports;
            const code = '// mockjs template' + '\n\n' + this.getCodeString(_editContextExport, data, force) +
                `/** 上一个模板：\n${this.getCodeString(_editContextExport, {}, false)} */`;
            fs.writeFileSync(this.#editPath, code);
            return true;
        } catch (err) {
            console.log(err);
        }
        return false;
    }
}

