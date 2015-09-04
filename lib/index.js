'use strict';

var _ = require('lodash'),
    ret = require('ret');

module.exports = function (regex, charset) {
    if (Object.prototype.toString.call(regex) === '[object RegExp]') {
        regex = regex.source;
    }

    else if (typeof regex !== 'string') {
        regex = String(regex);
    }

    try {
        var tokens = ret(regex);
    }

    catch (exception) {
        return false;
    }

    var group = [];
    var genex = {
        charset: ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~',
        count: function () {
            function count(input) {
                var result = 0;

                if ((input.type === ret.types.ROOT) || (input.type === ret.types.GROUP)) {
                    if (input.hasOwnProperty('stack')) {
                        input.options = [input.stack];
                    }

                    input.options.forEach(function (stack) {
                        var value = 1;

                        stack.forEach(function (node) {
                            value *= Math.max(1, count(node));
                        });

                        result += value;
                    });
                }

                else if (input.type === ret.types.SET) {
                    var set = [];

                    input.set.forEach(function (stack) {
                        if (stack.type === ret.types.SET) {
                            var data = [];

                            stack.set.forEach(function (node) {
                                if (node.type === ret.types.RANGE) {
                                    for (var i = node.from; i <= node.to; ++i) {
                                        data.push(i);
                                    }
                                }

                                else if (node.type === ret.types.CHAR) {
                                    data.push(node.value);
                                }
                            });

                            set = set.concat((stack.not) ? _.difference(genex.charset, data) : _.intersection(genex.charset, data));
                        }

                        else if (stack.type === ret.types.RANGE) {
                            for (var i = stack.from; i <= stack.to; ++i) {
                                set.push(i);
                            }
                        }

                        else if (stack.type === ret.types.CHAR) {
                            set.push(stack.value);
                        }
                    });

                    result = ((input.not) ? _.difference(genex.charset, set) : _.intersection(genex.charset, set)).length;
                }

                else if (input.type === ret.types.REPETITION) {
                    if (input.max === Infinity) {
                        result = input.max;
                    }

                    else if ((input.value = count(input.value)) > 1) {
                        if (input.min === input.max) {
                            result = Math.pow(input.value, input.min);
                        }

                        else {
                            result = (Math.pow(input.value, input.max + 1) - 1) / (input.value - 1);

                            if (input.min > 0) {
                                result -= (Math.pow(input.value, input.min + 0) - 1) / (input.value - 1);

                                if (isNaN(result)) {
                                    result = Infinity;
                                }
                            }
                        }
                    }

                    else {
                        result = input.max - input.min + 1;
                    }
                }

                else if ((input.type === ret.types.REFERENCE) || (input.type === ret.types.CHAR)) {
                    result = 1;
                }

                return Math.max(1, result);
            }

            if (Array.isArray(genex.charset) !== true) {
                genex.charset = genex.charset.split('').map(function (value) {
                    return value.charCodeAt(0);
                });
            }

            return count(tokens);
        },
        generate: function (callback) {
            function generate(input) {
                if ((input.type === ret.types.ROOT) || (input.type === ret.types.GROUP)) {
                    if (input.hasOwnProperty('stack')) {
                        input.options = [input.stack];
                    }

                    input.options = input.options.map(function (stack) {
                        if (stack.length === 0) {
                            stack = [null];
                        }

                        return new Stack(stack.map(function (node) {
                            return generate(node);
                        }));
                    });

                    if (input.options.length > 1) {
                        input.options = [new Option(input.options)];
                    }

                    input.options = input.options.shift();

                    if ((input.type === ret.types.GROUP) && (input.remember)) {
                        group.push(input.options);
                    }

                    return input.options;
                }

                else if (input.type === ret.types.SET) {
                    var set = [];

                    input.set.forEach(function (stack) {
                        if (stack.type === ret.types.SET) {
                            var data = [];

                            stack.set.forEach(function (node) {
                                if (node.type === ret.types.RANGE) {
                                    for (var i = node.from; i <= node.to; ++i) {
                                        data.push(i);
                                    }
                                }

                                else if (node.type === ret.types.CHAR) {
                                    data.push(node.value);
                                }
                            });

                            set = set.concat((stack.not) ? _.difference(genex.charset, data) : _.intersection(genex.charset, data));
                        }

                        else if (stack.type === ret.types.RANGE) {
                            for (var i = stack.from; i <= stack.to; ++i) {
                                set.push(i);
                            }
                        }

                        else if (stack.type === ret.types.CHAR) {
                            set.push(stack.value);
                        }
                    });

                    set = ((input.not) ? _.difference(genex.charset, set) : _.intersection(genex.charset, set)).map(function (value) {
                        return String.fromCharCode(value);
                    });

                    if (set.length > 0) {
                        return new Set(set);
                    }
                }

                else if (input.type === ret.types.REPETITION) {
                    if (input.max === 0) {
                        return new Set(['']);
                    }

                    return new Repetition(generate(input.value), input.min, input.max);
                }

                else if ((input.type === ret.types.REFERENCE) && (group.hasOwnProperty(input.value - 1))) {
                    return new Reference(group[input.value - 1]);
                }

                else if (input.type === ret.types.CHAR) {
                    return new Set([String.fromCharCode(input.value)]);
                }

                return new Set(['']);
            }

            if (Array.isArray(genex.charset) !== true) {
                genex.charset = genex.charset.split('').map(function (value) {
                    return value.charCodeAt(0);
                });
            }

            var iterator = generate(tokens);

            if (typeof callback === 'function') {
                iterator.forEach(function (value) {
                    callback(iterator.current());
                });
            }

            else {
                for (iterator.rewind(); iterator.valid(); iterator.next()) {
                    console.log(iterator.current());
                }
            }

            return true;
        },
    };

    return genex;
};

var Set = function (data) {
    this.i = 0;
    this.data = data;

    this.rewind = function () {
        this.i = 0;
    };

    this.valid = function () {
        return this.i < this.data.length;
    };

    this.current = function () {
        return this.data[this.i];
    };

    this.next = function () {
        ++this.i;
    };

    this.clone = function () {
        return new Set(this.data);
    };
};

var Stack = function (data) {
    if (data.length === 0) {
        data = new Set(['']);
    }

    this.data = data;

    this.rewind = function () {
        for (var i in this.data) {
            this.data[i].rewind();
        }
    };

    this.valid = function () {
        return this.data[0].valid();
    };

    this.current = function () {
        var result = '';

        for (var i in this.data) {
            result += this.data[i].current();
        }

        return result;
    };

    this.next = function () {
        if (this.valid()) {
            var i = this.data.length;

            while (this.data[--i].next(), i > 0 && !this.data[i].valid()) {
                this.data[i].rewind();
            }
        }
    };

    this.clone = function () {
        return new Stack(this.data.map(function (iterator) {
            return iterator.clone();
        }));
    };

    this.forEach = function (callback) {
        for (this.rewind(); this.valid(); this.next()) {
            callback(this.current());
        }
    };
};

var Option = function (data) {
    this.i = 0;
    this.data = data;

    this.rewind = function () {
        this.i = 0;

        for (var i in this.data) {
            this.data[i].rewind();
        }
    };

    this.valid = function () {
        return this.i < this.data.length;
    };

    this.current = function () {
        return this.data[this.i].current();
    };

    this.next = function () {
        if (this.valid()) {
            this.data[this.i].next();

            while (this.valid() && !this.data[this.i].valid()) {
                ++this.i;
            }
        }
    };

    this.clone = function () {
        return new Option(this.data.map(function (iterator) {
            return iterator.clone();
        }));
    };

    this.forEach = function (callback) {
        for (this.rewind(); this.valid(); this.next()) {
            callback(this.current());
        }
    };
};

var Reference = function (data) {
    this.i = 0;
    this.data = data;

    this.rewind = function () {
        this.i = 0;
    };

    this.valid = function () {
        return this.i < this.data.length;
    };

    this.current = function () {
        return this.data.current();
    };

    this.next = function () {
        ++this.i;
    };

    this.clone = function () {
        return new Reference(this.data);
    };
};

var Repetition = function (data, min, max) {
    var stack = [];

    for (var i = 0; i < min; ++i) {
        stack.push(data.clone());
    }

    if (max > min) {
        stack.push(new Option([new Set(['']), new Repetition(data, 1, max - min)]));
    }

    return new Stack(stack);
};
