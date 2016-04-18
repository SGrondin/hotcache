var assert = require("assert")
var Cache = require("../lib/index.js")

describe("Hotcache", function(){
	describe("get()", function(){
		it("Should pass", function(done){
			var cache = new Cache()
			cache.get("abc", 1000, (function(a, cb){
				assert(a === "z")
				cb(null, "woot")
			}), "z", function(err, res){
				assert(err === null)
				assert(res === "woot")
				done()
			})
		})

		it("Should also pass", function(done){
			var cache = new Cache()
			cache.get("abc", 1000, (function(a, cb){
				assert(a === "z")
				cb(null, "woot")
			}), "z", function(err, res){
				assert(err === null)
				assert(res === "woot")
			})

			cache.get("abc", 1000, (function(a, cb){
				assert(false)
			}), "z", function(err, res){
				assert(err === null)
				assert(res === "woot")
				done()
			})
		})

		it("Should be expired", function(done){
			this.timeout(3000)
			var cache = new Cache()
			cache.get("abc", 1000, (function(a, cb){
				assert(a === "z")
				cb(null, "woot")
			}), "z", function(err, res){
				assert(err === null)
				assert(res === "woot")
			})
			setTimeout(function(){
				cache.get("abc", 1000, (function(a, b, cb){
					assert(a === "z")
					assert(b === "y")
					cb(null, "woot", 123)
				}), "z", "y", function(err, res1, res2){
					assert(err === null)
					assert(res1 === "woot")
					assert(res2 === 123)
					done()
				})
			}, 2000)
		})

		it("Should still be in cache", function(done){
			var cache = new Cache()
			cache.get("abc", 1000, (function(a, cb){
				assert(a === "z")
				cb(null, "woot")
			}), "z", function(err, res){
				assert(err === null)
				assert(res === "woot")
			})

			setTimeout(function(){
				cache.get("abc", 1000, (function(a, cb){
					assert(false)
				}), "z", function(err, res){
					assert(err === null)
					assert(res === "woot")
					done()
				})
			}, 500)
		})

		it("Should fail", function(done){
			var cache = new Cache()
			cache.get("abc", 1000, (function(a, cb){
				assert(a === "z")
				cb("woops", "woot")
			}), "z", function(err, res){
				assert(err === "woops")
				assert(res === "woot")
				done()
			})
		})

	})

	describe("pget()", function(){
		it("Should accept naked value", function(){
			var cache = new Cache()
			return cache.pget("def", 1000, (function(a){
				assert(a === "z")
				return 6
			}), "z")
			.then(function(res){
				assert(res === 6)
			})
		})

		it("Should accept wrapped value", function(){
			var cache = new Cache()
			return cache.pget("ghi", 1000, (function(a){
				assert(a === "z")
				return Promise.resolve(6)
			}), "z")
			.then(function(res){
				assert(res === 6)
			})
		})


		it("Should not fetch twice", function(){
			var cache = new Cache()
			cache.pget("ghi", 1000, (function(a){
				return 111
			}))

			return cache.pget("ghi", 1000, (function(a){
				throw new Error("Shouldn't be called")
			}))
		})

		it("Should catch the error", function(){
			var cache = new Cache()
			return cache.pget("jkl", 1000, (function(a){
				nothing.nothing() // Throws an error
				return Promise.resolve(6)
			}), "z")
			.then(function(res){
				return Promise.reject(Error("Shouldn't continue the chain"))
			})
			.catch(function(err){
				assert(err.message === "nothing is not defined")
				return Promise.resolve()
			})
		})

		it("Should accept naked null", function(){
			var cache = new Cache()
			return cache.pget("def", 1000, (function(a){
				assert(a === "z")
				return null
			}), "z")
			.then(function(res){
				assert(res === null)
			})
		})

		it("Should accept wrapped null", function(){
			var cache = new Cache()
			return cache.pget("ghi", 1000, (function(a){
				assert(a === "z")
				return Promise.resolve(null)
			}), "z")
			.then(function(res){
				assert(res === null)
			})
		})
	})

	describe("del()", function(){
		it("Should delete keys", function(){
			var cache = new Cache()

			cache.pget("abc", 1000, (function(a){
				assert(a === "z")
				return 4
			}), "z")
			.then(function(res){
				assert(res === 6)
			})

			cache.pget("def", 1000, (function(a){
				assert(a === "z")
				return 6
			}), "z")
			.then(function(res){
				assert(res === 4)
			})

			var dump = Object.keys(cache.cache).sort()
			assert(dump.length === 2)
			assert(dump[0] === "abc")
			assert(dump[1] === "def")

			cache.del("abc", "def")

			var dump2 = Object.keys(cache.cache).sort()
			assert(dump2.length === 0)
		})
	})

})
