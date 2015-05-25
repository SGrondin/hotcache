(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// Generated by CoffeeScript 1.9.2
(function() {
  var makeExpire, makeItem, t,
    slice = [].slice;

  makeExpire = function(cache, key, exp) {
    return setTimeout(function() {
      var ref;
      if (((ref = cache[key]) != null ? ref.waiting.length : void 0) === 0) {
        return delete cache[key];
      }
    }, exp);
  };

  makeItem = function(cache, key, exp, element) {
    if (element == null) {
      element = null;
    }
    return {
      element: element,
      expire: makeExpire(cache, key, exp),
      waiting: []
    };
  };

  t = function() {
    var cache;
    cache = {};
    this.get = function() {
      var args, cb, exp, fn, i, key, newCached;
      key = arguments[0], exp = arguments[1], fn = arguments[2], args = 5 <= arguments.length ? slice.call(arguments, 3, i = arguments.length - 1) : (i = 3, []), cb = arguments[i++];
      if (cache[key] != null) {
        if (cache[key].element != null) {
          return cb.apply({}, cache[key].element);
        } else {
          return cache[key].waiting.push(cb);
        }
      } else {
        newCached = makeItem(cache, key, exp);
        cache[key] = newCached;
        cache[key].waiting.push(cb);
        return setTimeout(function() {
          return fn.apply({}, Array.prototype.concat.call(Array.prototype.slice.call(args, 0), function() {
            var res;
            res = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            clearTimeout(newCached.expire);
            if (res[0] == null) {
              cache[key] = makeItem(cache, key, exp, res);
            } else {
              delete cache[key];
            }
            return newCached.waiting.forEach(function(v) {
              return v.apply({}, res);
            });
          }));
        }, 0);
      }
    };
    return this;
  };

  module.exports = t;

}).call(this);

},{}]},{},[1]);
