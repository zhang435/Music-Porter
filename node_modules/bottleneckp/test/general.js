describe('General', function() {
  describe('constructor', function() {

    it('_tasksRunning and _waitingClients should be 0 at initial state', function(done) {
      var c = new Bottleneck(10, 0)
      console.assert(c._tasksRunning === 0)
      console.assert(c._waitingClients.size() === 0)
      done()
    })

    it('maxConcurrent and rateLimit should be equal to those passed to the constructor when not conflictive', function(done) {
      var c = new Bottleneck(10, 0)
      console.assert(c.rateLimit === 0)
      console.assert(c.maxConcurrent === 10)
      done()
    })

    it('maxConcurrent should be 1 if rateLimit is not 0', function(done) {
      var c = new Bottleneck(10, 1000)
      console.assert(c.rateLimit === 1000)
      console.assert(c.maxConcurrent === 1)
      done()
    })

    it('priorityRange should be 1 in default', function(done) {
      var c = new Bottleneck(10, 1000)
      console.assert(c._priorityRange === 1)
      done()
    })

    it('defaultPriority should be half of priorityRange if not set', function(done) {
      var c1 = new Bottleneck(1, 1000, 5)
      console.assert(c1._defaultPriority === 2)
      var c2 = new Bottleneck(1, 1000, 5, 3)
      console.assert(c2._defaultPriority === 3)
      var c3 = new Bottleneck(1, 1000)
      console.assert(c3._defaultPriority === 0)
      var c4 = new Bottleneck(1, 1000, 5, 6)
      console.assert(c4._defaultPriority === 4)
      done()
    })
  })

  describe('priority', function() {

    it('should work when passed invalid priority', function(done) {
      var c = makeTest(1, 250, 10)
      c.limiter.submit(-1, c.job(1))
      console.assert(c.size() === 0)
      c.limiter.submit(-1, c.job(2))
      console.assert(c.size() === 1)
      c.limiter.submit(11, c.job(3))
      console.assert(c.size() === 2)
      c.limiter.submit(10, c.last(4, {
        checkResults: [1, 2, 3, 4],
        checkDuration: 750,
        done: done
      }))
    })

    it('should work properly with priority and non-zero rateLimit', function(done) {
      var c = makeTest(1, 250, 10)
      c.limiter.submit(5, c.job(1))
      console.assert(c.size() === 0)
      c.limiter.submit(9, c.last(2, {
        checkResults: [1, 5, 4, 3, 2],
        checkDuration: 1000,
        done: done
      }))
      console.assert(c.size() === 1)
      c.limiter.submit(4, c.job(3))
      console.assert(c.size() === 2)
      c.limiter.submit(3, c.job(4))
      console.assert(c.size() === 3)
      c.limiter.submit(0, c.job(5))
      console.assert(c.size() === 4)
    })

    it('should work properly with priority and zero rateLimit', function(done) {
      var c = makeTest(10, 0, 10)
      c.limiter.submit(5, c.job(1))
      console.assert(c.size() === 0)
      c.limiter.submit(4, c.job(2))
      console.assert(c.size() === 0)
      c.limiter.submit(3, c.job(3))
      console.assert(c.size() === 0)
      c.limiter.submit(0, c.job(4))
      console.assert(c.size() === 0)
      c.limiter.submit(5, c.job(5))
      console.assert(c.size() === 0)
      c.limiter.submit(4, c.job(6))
      console.assert(c.size() === 0)
      c.limiter.submit(3, c.job(7))
      console.assert(c.size() === 0)
      c.limiter.submit(0, c.job(8))
      console.assert(c.size() === 0)
      c.limiter.submit(5, c.job(9))
      console.assert(c.size() === 0)
      c.limiter.submit(4, c.job(10))
      console.assert(c.size() === 0)
      c.limiter.submit(3, c.job(11))
      console.assert(c.size() === 1)
      c.limiter.submit(0, c.job(12))
      console.assert(c.size() === 2)
      c.limiter.submit(9, c.last(13, {
        checkResults: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 11, 13],
        checkDuration: 0,
        done: done
      }))
      console.assert(c.size() === 3)
    })

  })

  describe('homogeneous', function() {
    it('should share tasks', function(done) {
      var c = clusterTest(1, 0, 10, 5, true)
      c.cluster.key('1').submit(5, c.slowJob('1', 1))
      c.cluster.key('1').submit(5, c.fastJob('1', 2))
      c.cluster.key('1').submit(5, c.fastJob('1', 3))
      c.cluster.key('2').submit(5, c.fastJob('2', 4))
      console.assert(c.size() === 2)
      c.cluster.key('1').submit(5, c.last('1', 5, {
        checkResults: [{ in : '2',
          out: null,
          value: 4
        }, { in : '1',
          out: '2',
          value: 2
        }, { in : '1',
          out: '2',
          value: 3
        }, { in : '1',
          out: null,
          value: 1
        }, { in : '1',
          out: '2',
          value: 5
        }],
        checkDuration: 800,
        done: done
      }))
    })
  })

  describe('cluster property', function() {
    it('should have correct waitingClients and empty property', function(done) {
      var c = clusterTest(1, 0)
      console.assert(c.cluster.empty === true)
      console.assert(c.cluster.waitingClients === 0)
      console.assert(c.cluster.unfinishedClients === 0)
      c.cluster.key('1').submit(5, c.fastJob('1', 1))
      console.assert(c.cluster.waitingClients === 0)
      console.assert(c.cluster.unfinishedClients === 1)
      c.cluster.key('1').submit(5, c.fastJob('1', 2))
      console.assert(c.cluster.waitingClients === 1)
      console.assert(c.cluster.unfinishedClients === 2)
      console.assert(c.cluster.empty === false)
      c.cluster.key('2').submit(5, c.fastJob('2', 3))
      console.assert(c.cluster.waitingClients === 1)
      console.assert(c.cluster.unfinishedClients === 3)
      c.cluster.key('1').submit(5, c.last('1', 4, {
        checkResults: [{ in : '1',
          out: null,
          value: 1
        }, { in : '2',
          out: null,
          value: 3
        }, { in : '1',
          out: null,
          value: 2
        }, { in : '1',
          out: null,
          value: 4
        }],
        checkDuration: 700,
        done: function() {
          console.assert(c.cluster.empty === true)
          console.assert(c.cluster.waitingClients === 0)
          console.assert(c.cluster.unfinishedClients === 0)
          done()
        }
      }))
      console.assert(c.cluster.waitingClients === 2)
    })
  })

  describe('Bottleneck property', function() {

    it('should be able to change rateLimit after initialization', function() {
      var bottleneck = new Bottleneck(10, 0, 10, 5);
      console.assert(bottleneck.maxConcurrent === 10);
      console.assert(bottleneck.rateLimit === 0);
      bottleneck.setRateLimit(1000);
      console.assert(bottleneck.maxConcurrent === 1);
      console.assert(bottleneck.rateLimit === 1000);
    })
    it('should throw error when set rateLimit to non-number value', function() {
      var bottleneck = new Bottleneck(10, 0, 10, 5);
      var error = null;
      try {
        bottleneck.setRateLimit('NaN');
      } catch(e) {
        error = e;
      }
      console.assert(error !== null);
    })
  })

})