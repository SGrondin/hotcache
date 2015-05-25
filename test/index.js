var assert = require("assert")
var Cache = require("../lib/index.js")
var cache = new Cache()
var nbChecks = 0
var oldAssert = assert
assert = function() {
	++nbChecks
	oldAssert.apply({}, arguments)
}

// Should be expired
setTimeout(function(){
	cache.get("abc", 1000, (function(a, b, cb){
		assert(a === "z")
		assert(b === "y")
		cb(null, "woot", 123)
	}), "z", "y", function(err, res1, res2){
		assert(err === null)
		assert(res1 === "woot")
		assert(res2 === 123)
	})
}, 2000)

// Should still be in cache
setTimeout(function(){
	cache.get("abc", 1000, (function(a, cb){
		assert(false)
		cb(null, "woot")
	}), "z", function(err, res){
		assert(err === null)
		assert(res === "woot")
	})
}, 500)

// These 2 should fail
cache.get("abc", 1000, (function(a, cb){
	assert(a === "z")
	cb("woops", "woot")
}), "z", function(err, res){
	assert(err === "woops")
	assert(res === "woot")
})

cache.get("abc", 1000, (function(a, cb){
	assert(false)
	cb(null, "woot")
}), "z", function(err, res){
	assert(err === "woops")
	assert(res === "woot")
})

// These 2 should pass
setTimeout(function() {
	cache.get("abc", 1000, (function(a, cb){
		assert(a === "z")
		cb(null, "woot")
	}), "z", function(err, res){
		assert(err === null)
		assert(res === "woot")
	})

	cache.get("abc", 1000, (function(a, cb){
		assert(false)
		cb(null, "woot")
	}), "z", function(err, res){
		assert(err === null)
		assert(res === "woot")
	})
}, 250)

setTimeout(function() {
	oldAssert(nbChecks === 17)
	console.log("Success", nbChecks, "/17 tests")
}, 2500)
