const request = require('request');


class Who {
    options = {}

    constructor(options) {
        this.option = Object.assign(options, this.defaultOptions);
    }

    check(headers, body) {
        return new Promise((resolve) => {
            request({
                url: this.options.url,
                method: this.options.method,
                headers: headers,
                body: body
            }, (res, err) => {
                resolve(res);
            });
        })
    }
}

module.exports = Who;