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

/****** PROMISES *****/
// No-wrap
cache.pget("def", 1000, (function(a){
	assert(a === "z")
	return 6
}), "z")
.then(function(res){
	assert(res === 6)
})
.catch(function(err){
	throw err
})

// Wrap
cache.pget("ghi", 1000, (function(a){
	assert(a === "z")
	return Promise.resolve(6)
}), "z")
.then(function(res){
	assert(res === 6)
})
.catch(function(err){
	throw err
})

// Shouldn't get called
cache.pget("ghi", 1000, (function(a){
	throw new Error("Shouldn't be called")
}))

// Should catch the error
cache.pget("jkl", 1000, (function(a){
	nothing.nothing() // Throws an error
	return Promise.resolve(6)
}), "z")
.then(function(res){
	throw new Error("Shouldn't continue the chain")
})
.catch(function(err){
	assert(err.message === "nothing is not defined")
})



setTimeout(function() {
	oldAssert(nbChecks === 22)
	console.log("Success", nbChecks, "/22 tests")
}, 2500)
