global.TEST = true
global.Bottleneck = require('../lib/Bottleneck.js')
global.Cluster = require('../lib/Cluster.js')
global.makeTest = function (arg1, arg2, arg3, arg4) {
  var start = Date.now()
  var calls = []
  var limiter = new Bottleneck(arg1, arg2, arg3, arg4)
  var getResults = function () {
    return {
      elapsed: Date.now() - start,
      callsDuration: calls[calls.length - 1].time,
      calls: calls
    }
  }

  var context = {
    limiter:limiter,
    size: function() {
      return limiter._waitingClients.size()
    },
    job: function(num) {
      return function(cb) {
        calls.push({num:num,time:Date.now()-start})
        cb()
      }
    },
    last: function(num, check) {
      return function(cb) {
        calls.push({num:num,time:Date.now()-start})
        cb()
        console.assert(limiter._waitingClients.size() === 0)
        if(check.checkResults)
          context.checkResultsOrder(check.checkResults)
        if(check.checkDuration)
          context.checkDuration(check.checkDuration)
        check.done()
      }
    },
    checkResultsOrder: function (order) {
      for (var i = 0; i < Math.max(calls.length, order.length); i++) {
        console.assert(order[i] === calls[i].num)
      }
    },
    checkDuration: function (shouldBe) {
      var results = getResults()
      var min = shouldBe - 10
      var max = shouldBe + 50
      console.assert(results.callsDuration > min)
      console.assert(results.callsDuration < max)
    }
  }

  return context
}
global.clusterTest = function(arg1, arg2, arg3, arg4, arg5) {
  var start = Date.now()
  var calls = []
  var cluster = new Cluster(arg1, arg2, arg3, arg4, arg5)
  var getResults = function () {
    return {
      elapsed: Date.now() - start,
      callsDuration: calls[calls.length - 1].time,
      calls: calls
    }
  }

  var context = {
    cluster:cluster,
    size: function() {
      return cluster.waitingClients
    },
    fastJob: function(inLimiter, value) {
      return function(cb, outLimiter) {
	setTimeout(function() {
	  calls.push({in:inLimiter,out:outLimiter,value:value,time:Date.now()-start})
	  cb()
	}, 100)
      }
    },
    slowJob: function(inLimiter, value) {
      return function(cb, outLimiter) {
	setTimeout(function() {
	  calls.push({in:inLimiter,out:outLimiter,value:value,time:Date.now()-start})
	  cb()
	}, 500)
      }
    },
    last: function(inLimiter, value, check) {
      return function(cb, outLimiter) {
	setTimeout(function() {
	  calls.push({in:inLimiter,out:outLimiter,value:value,time:Date.now()-start})
          cb()
          console.assert(cluster._waitingClients() === 0)
          if(check.checkResults)
            context.checkResultsOrder(check.checkResults)
          if(check.checkDuration)
	    context.checkDuration(check.checkDuration)
          check.done()
	}, 500)
        
      }
    },
    checkResultsOrder: function (order) {
      for(var i = 0; i < order.length; i++) {
	console.assert(order[i].in == calls[i].in)
	console.assert(order[i].out == calls[i].out)
	console.assert(order[i].value == calls[i].value)
      }
    },
    checkDuration: function (shouldBe) {
      var results = getResults();
      var min = shouldBe - 10
      var max = shouldBe + 50
      console.assert(results.callsDuration > min)
      console.assert(results.callsDuration < max)
    }
  }

  return context
}

var fs = require('fs')
var files = fs.readdirSync('./test')
for (var f in files) {
  var stat = fs.statSync('./test/' + files[f])
  if (!stat.isDirectory()) {
    try {
      require('./' + files[f])
    } catch (e) {
      console.error(e.toString())
    }
  }
}
