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


function Who(options) {
    this.option = Object.assign(defaultOptions, options);
    this.docheck = async function (headers, form) {
        let op = Object.assign(this.option, {headers: headers || {}, form: form || {}});
        let res = {};
        res = await request(op);
        return res;
    };

    this.checkAuthMd = function () {
        let _this = this;
        return async function (ctx, next) {
            let form = Object.assign(ctx.request.body, ctx.request.query);
            try {
                let token = await _this.docheck(ctx.request.headers, form);
                ctx.user = token;
                await next();
            } catch (e) {
                ctx.status = e.statusCode || 500;
                let res;
                try {
                    res = JSON.parse(e.error);
                } catch (e) {
                    res = e.error;
                } finally {
                    ctx.body = res;
                }
            }
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

            } finally {
                await next();
            }
        }
    }
}

module.exports = Who;