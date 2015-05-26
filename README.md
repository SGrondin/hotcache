HOTCACHE
========

A classic problem: the cold cache. Your application was just launched, moments ago. Immediately it's being hit by many requests, but since the cache is empty (or "cold"), every request has to go the expensive way before it can be put in cache.

This module is a simple cache that alleviates the problem a little bit. It's async- and error-aware and it will only fetch something once when the cache is cold. Concurrent requests will be queued up and resolved when the fetch comes back with a value. In case of errors, the queued up elements are resolved, but the result is not cached.

It has the simplest API you've seen.

# Install

__Node__
```
npm install hotcache
```
__Browser__
```
bower install hotcache
```
or
```html
<script type="text/javascript" src="hotcache.min.js"></script>
```

###### Example

```js
var Hotcache = require("hotcache"); //Node only

// First create a cache
var cache = new Hotcache();
// Then access elements in it
cache.get("someKey", 5000, myAsyncFunction, arg1, arg2, argN, cb);
```

That's it. If "someKey" already exists in the cache, it'll be returned to the callback immediately and `myAsyncFunction` will not be executed. If it's not in the cache, `myAsyncFunction` will be executed with the listed arguments and the result will be passed to `cb`. If that call was successful (meaning that it didn't pass an error to `cb` as its first argument), then the result will be cached for the specified number of milliseconds (5000 in this example).

**Note:** Make sure to pass a callback (`cb`), even if it's just an empty function.

**Note:** There can be from zero to as many arguments as needed.

That's it. It solves a very simple problem elegantly. Does one thing and does it well.

This is an adaptation of the original written in OCaml, which you can view [here](https://github.com/Mashape/HARchiver/blob/01b590cee12d50ed2349e426f291d73b4ee11698/src/cache.ml).
