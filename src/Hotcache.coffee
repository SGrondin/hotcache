# https://github.com/Mashape/HARchiver/blob/01b590cee12d50ed2349e426f291d73b4ee11698/src/cache.ml
HPromise = try require "bluebird" catch e then Promise ? ->
		throw new Error "Bottleneck: install 'bluebird' or use Node 0.12 or higher for Promise support"

makeExpire = (cache, key, exp) ->
	(setTimeout () ->
			if cache[key]?.waiting.length == 0 then delete cache[key]
		, exp).unref?()

makeItem = (cache, key, exp, element=null) ->
	{
		element
		expire: makeExpire cache, key, exp
		waiting: []
	}

t = (promise) ->
	if promise? then HPromise = promise
	cache = {}
	@get = (key, exp, fn, args..., cb) ->
		if cache[key]?
			if cache[key].element?
				# Found
				cb.apply {}, cache[key].element
			else
				# Currently being fetched
				cache[key].waiting.push cb
		else
			# Go get it yourself
			newCached = makeItem cache, key, exp
			cache[key] = newCached
			cache[key].waiting.push cb
			setTimeout () ->
				fn.apply {}, Array::concat.call args, (res...) ->
					clearTimeout newCached.expire
					if not res[0]?
						cache[key] = makeItem cache, key, exp, res
					else
						delete cache[key]

					newCached.waiting.forEach (v) -> v.apply {}, res
			, 0
	@pget = (key, exp, fn, args...) =>
		wrapped = (cb) ->
			processed = try
				if typeof (ref = fn.apply {}, args).then == 'function' then ref else HPromise.resolve ref
			catch err
				HPromise.reject err
			processed
			.then (args...) -> cb.apply {}, Array::concat null, args
			.catch (args...) -> cb.apply {}, Array::concat {}, args
		new HPromise (resolve, reject) =>
			@get.apply {}, Array::concat key, exp, wrapped, (error, args...) ->
				(if error? then reject else resolve).apply {}, args
	@

module.exports = t
