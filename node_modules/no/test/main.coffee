mod = require '../'
should = require 'should'
require 'mocha'

describe 'no', ->
  describe 'the module', ->
    it 'should function properly', (done) ->
      mod.should.equal "no"
      done()