
exports.enabled = true;
exports.config = {
    // targetId: 'edit.js', // 相对自身的文件路径
}
exports.mock = (req) => {
    const isUpdateSuccess = exports.mockUtil.update(req.body); // 通过update 函数更改 {targetId 的mock内容}
    return {
        success: isUpdateSuccess,
        message: 'mock'
    }
}