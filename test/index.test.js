var test = require('tape')

var bin = require('../bin')
var to = require('to2')
var pkg = require('../package.json')

function bestbuy (cmd, callback) {
  var output = ''

  bin(cmd.split(' '), to(
    (chunk, enc, cb) => {
      output += chunk.toString()
      cb(null, chunk)
    }
  ), processResponse)

  function processResponse (err) {
    if (err) return callback(err)
    callback(null, output)
  }
}

test('--version flag prints the version', function (t) {
  bestbuy('--version', function (err, output) {
    t.error(err, 'no error')
    t.equals(output, `${pkg.version}\n`, 'version matches')
    t.end()
  })
})

test('-v flag prints the version', function (t) {
  bestbuy('-v', function (err, output) {
    t.error(err, 'no error')
    t.equals(output, `${pkg.version}\n`, 'version matches')
    t.end()
  })
})

test('no arguments shows the help screen', function (t) {
  bestbuy('', function (err, output) {
    t.error(err, 'no error')
    t.ok(output.startsWith('\nBest Buy Bulk Download\n\nUsage: bestbuy'), 'help message shown')
    t.end()
  })
})

test('--help shows the help screen', function (t) {
  bestbuy('--help', function (err, output) {
    t.error(err, 'no error')
    t.ok(output.startsWith('\nBest Buy Bulk Download\n\nUsage: bestbuy'), 'help message shown')
    t.end()
  })
})

test('--h shows the help screen', function (t) {
  bestbuy('-h', function (err, output) {
    t.error(err, 'no error')
    t.ok(output.startsWith('\nBest Buy Bulk Download\n\nUsage: bestbuy'), 'help message shown')
    t.end()
  })
})

test('invalid resource returns error', function (t) {
  bestbuy('blarg', function (err, output) {
    t.equals(err.message, 'Invalid resource: blarg', 'correct error returned')
    t.equals(output, undefined, 'no other output')
    t.end()
  })
})
