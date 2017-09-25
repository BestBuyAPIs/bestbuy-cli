module.exports = run

const bestbuy = require('bestbuy')
const fs = require('fs')
const pump = require('pump')
const JSONStream = require('JSONStream')
const logUpdate = require('log-update')
const prettyMs = require('pretty-ms')
const through = require('through2')

function run (opts, stdout, cb) {
  var bby = bestbuy({key: opts.key})
  var total = 0
  var cnt = 0
  var start = process.hrtime()
  var progressInterval
  var logUpdater = logUpdate.create(stdout)

  var output
  var parser

  var dataStream = bby[`${opts.resource}AsStream`](opts.query, {
    format: opts.format,
    show: opts.show,
    sort: opts.sort
  })

// a "total" event is emitted so we know how many total products will be sent
  dataStream.on('total', t => {
    total = t
  })

  dataStream.on('data', () => cnt++)

  if (opts.format.toLowerCase() === 'json') {
    parser = opts.bare ? JSONStream.stringify(false) : JSONStream.stringify()
  } else if (opts.format.toLowerCase() === 'xml') {
    parser = through(
      function (chunk, enc, cb) {
        if (opts.bare) {
          chunk = chunk.toString().replace(/\n/g, '') + '\n'
        }
        cb(null, chunk)
      }, // transform is a noop
      function (cb) { // flush function
        if (!opts.bare) this.push(`\n</${opts.resource}>`) // add end tag
        cb()
      }
    )
    if (!opts.bare) parser.write(`<${opts.resource}>\n`)
  } else {
    throw new Error(`unsupported format: ${opts.format}`)
  }

  if (opts.output) {
    output = fs.createWriteStream(opts.output)
    progressInterval = setInterval(updateProgress, 500)
  } else {
    output = stdout || require('stdout-stream')
  }

  function updateProgress () {
    var timeSoFar = process.hrtime(start)
    var timeSoFarInMs = ((timeSoFar[0] * 1e9) + timeSoFar[1]) / 1e6
    var timeSoFarInSec = timeSoFarInMs / 1e3

    var totalTime = prettyMs(timeSoFarInMs)
    logUpdater(`${opts.resource}: ${cnt}/${total} (${(cnt / total * 100).toFixed(2)}%), Time: ${totalTime}, ${opts.resource}/sec: ${Math.round(cnt / timeSoFarInSec)}`)
  }

  pump(dataStream, parser, output, err => {
    if (progressInterval) {
      clearInterval(progressInterval)
      updateProgress()
      stdout.write('Done.\n')
    }

    if (err) return cb(err)

    cb()
  })
}
