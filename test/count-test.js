'use strict';

var genex = require('..');

var _ = require('lodash'),
    assert = require('assert');

describe('#count()', function () {
    describe('Position Matching', function () {
        var tests = {
            '^': 1,
            '$': 1,
            '\\b': 1,
            '\\B': 1,
        };

        _.each(tests, function (expected, input) {
            describe('/' + input + '/', function () {
                it('should return ' + expected, function () {
                    assert.equal(expected, genex(input).count());
                });
            });
        });
    });

    describe('Characters', function () {
        var tests = {
            '': 1,
            'a': 1,
            'abc': 1,
        };

        _.each(tests, function (expected, input) {
            describe('/' + input + '/', function () {
                it('should return ' + expected, function () {
                    assert.equal(expected, genex(input).count());
                });
            });
        });
    });

    describe('Character Sets', function () {
        var tests = {
            '[abc]': 3,
            '[a-z]': 26,
            '[0-4]': 5,
            '[0-9a-zA-Z]': 62,
            '[\\w]': 63,
            '[\\d]': 10,
            '[\\s]': 1,
            '[\\W]': 32,
            '[\\D]': 85,
            '[\\S]': 94,
            '[^AN]BC': 93,
            '[^\\w]': 32,
            '[^\\d]': 85,
            '[^\\s]': 94,
            '[^\\W]': 63,
            '[^\\D]': 10,
            '[^\\S]': 1,
            '[^\\W\\w]': 1,
            '[^\\D\\d]': 1,
            '[^\\S\\s]': 1,
            '[]': 1,
            '.': 95,
            '\\w': 63,
            '\\W': 32,
            '\\d': 10,
            '\\D': 85,
            '\\s': 1,
            '\\S': 94,
        };

        _.each(tests, function (expected, input) {
            describe('/' + input + '/', function () {
                it('should return ' + expected, function () {
                    assert.equal(expected, genex(input).count());
                });
            });
        });
    });

    describe('Repetition', function () {
        var tests = {
            '[ab]{0,2}?': 8,
            '[ab]{0,2}': 7,
            '[ab]{1,2}': 6,
            '[ab]{1,2}?': 7,
            '\\d{0,4}': 11111,
            '\\d{1,4}': 11110,
            '\\d{2,4}': 11100,
            '\\d{2}{2}': 10000,
            '\\d{3,4}': 11000,
            '\\d{4,4}': 10000,
            '\\d{5}': 100000,
            '\\s{0,}': Infinity,
            '\\s{2,}': Infinity,
            'a\\b{0,}': Infinity,
            'ab*': Infinity,
            'ab+': Infinity,
            'ab?': 2,
        };

        _.each(tests, function (expected, input) {
            describe('/' + input + '/', function () {
                it('should return ' + expected, function () {
                    assert.equal(expected, genex(input).count());
                });
            });
        });
    });

    describe('Alternation & Grouping', function () {
        var tests = {
            'forever|young': 2,
            '|': 2,
            '|a': 2,
            '\\1': 1,
            '|\\b': 2,
            '[0101]?[0-3]?': 15,
            '[01]?[01]?': 9,
            '[01]?[01]': 6,
            '(a)\\1': 1,
            'forever|(old|young)': 3,
            'forever|(old|young)?': 4,
        };

        _.each(tests, function (expected, input) {
            describe('/' + input + '/', function () {
                it('should return ' + expected, function () {
                    assert.equal(expected, genex(input).count());
                });
            });
        });
    });
});
