module.exports = require "./Hotcache"
if global.window? then global.window.Hotcache = module.exports
