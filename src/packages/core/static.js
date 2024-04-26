const { getOptions } = require('@mock-server/core/options');
const express = require('express');
const path = require('path');

exports.createStaticService = async function (app) {
    const { cwd, staticServic } = await getOptions();
    staticServic.forEach(item => {
        if (typeof item === 'string') {
            const static = path.resolve(cwd, item);
            app.use(express.static(static));
        } else if (typeof item === 'object' && item?.suffix && item?.dir) {
            app.use(item.suffix, express.static(path.resolve(cwd, item.dir)));
        }
    })
}
