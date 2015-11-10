# https://github.com/Mashape/HARchiver/blob/01b590cee12d50ed2349e426f291d73b4ee11698/src/cache.ml
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

t = () ->
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
	@

module.exports = t
