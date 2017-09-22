var tape = require('tape')
var test = require('tape-nock')(tape, {
  defaultTestOptions: {
    after: function (scope) {
      // when running test, switch apiKey to XXX to match fixtures
      scope.filteringPath(/apiKey=[^&]+/g, 'apiKey=XXX')
    },
    afterRecord: function (scopes) {
      // avoid exposing API keys in the fixtures
      var scopesString = JSON.stringify(scopes)
      scopesString = scopesString.replace(/apiKey=[^\\<&"]+/g, 'apiKey=XXX')
      return JSON.parse(scopesString)
    }
  }
})

module.exports = test
