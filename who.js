const request = require('request-promise');

const defaultOptions = {
    url: '',
    method: "POST",
    headers: {},
    form: {},
    transform: function (body) {
        try {
            return JSON.parse(body);
        } catch (e) {
            return body;
        }
    }
};


function Who(options, log) {
    this.log = log;
    this.option = Object.assign(defaultOptions, options);
    this.docheck = async function (headers, form) {
        let op = Object.assign(this.option, {headers: headers || {}, form: form || {}});
        let res = {};

        try {
            res = await request(op);
            return res;
        } catch (e) {
            if (log) log.debug(e.message);
            if (!isJason(e.error)) {
                throw new Error("unknow_auth_error")
            }
            let res = JSON.parse(e.error);
            if (res.source !== 'miup') {
                throw new Error("unknow_auth_error")
            }
            res.status = e.statusCode;
            e.body = res;
            throw e;
        }
    };

    this.checkAuthMd = function () {
        let _this = this;
        return async function (ctx, next) {
            let form = Object.assign(ctx.request.body, ctx.request.query);
            let token = await _this.docheck(ctx.request.headers, form);
            ctx.user = token;
            await next();
        }
    };

    this.fechUserMd = function () {
        let _this = this;
        return async function (ctx, next) {
            let form = Object.assign(ctx.request.body, ctx.request.query);
            try {
                let token = await _this.docheck(ctx.request.headers, form);
                ctx.user = token;
            } catch (e) {
                if (_this.log) log.error(e.message);
            } finally {
                await next();
            }
        }
    }
}


function isJason(str) {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
}

module.exports = Who;