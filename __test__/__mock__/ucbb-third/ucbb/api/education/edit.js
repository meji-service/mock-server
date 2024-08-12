exports.enabled = true;
exports.mock = (_, res) => {
    res.setHeader('content-disposition', 'filename="xxxxxx"')
    .setHeader('xxxxx', 'xxxxx')
    .status(200)
    .send("响应的数据")
}
