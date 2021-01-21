module.exports = run

const bestbuy = require('bestbuy')
const fs = require('fs')
const pump = require('pump')
const JSONStream = require('JSONStream')
const logUpdate = require('log-update')
const prettyMs = require('pretty-ms')
const through = require('through2')
const csv = require('fast-csv')

function run (opts, stdout, cb) {
  let bby
  let total = 0
  let cnt = 0
  const start = process.hrtime()
  let progressInterval
  const logUpdater = logUpdate.create(stdout)

  let output
  let parser

  try {
    bby = bestbuy({ key: opts.key, debug: opts.debug })
  } catch (err) {
    return cb(err)
  }

  opts.format = opts.format.toLowerCase()

  const dataStream = bby[`${opts.resource}AsStream`](opts.query, {
    format: opts.format === 'csv' || opts.format === 'tsv' ? 'json' : opts.format,
    show: opts.show,
    sort: opts.sort
  })

  // a "total" event is emitted so we know how many total products will be sent
  dataStream.on('total', t => {
    total = t
  })

  dataStream.on('data', () => cnt++)

  if (opts.format === 'json') {
    parser = opts.bare ? JSONStream.stringify(false) : JSONStream.stringify()
  } else if (opts.format === 'csv' || opts.format === 'tsv') {
    const csvStream = csv.createWriteStream({
      headers: !opts.bare,
      objectMode: false,
      delimiter: opts.format === 'tsv' ? '\t' : ','
    })
    parser = csvStream
  } else if (opts.format === 'xml') {
    parser = through(
      function (chunk, enc, cb) {
        if (opts.bare) {
          chunk = chunk.toString().replace(/\n/g, '') + '\n'
        }
        cb(null, chunk)
      }, // transform is a noop
      function (done) { // flush function
        if (!opts.bare) this.push(`\n</${opts.resource}>`) // add end tag
        done()
      }
    )
    if (!opts.bare) parser.write(`<${opts.resource}>\n`)
  } else {
    return cb(new Error(`unsupported format: ${opts.format}`))
  }

  if (opts.output) {
    output = fs.createWriteStream(opts.output)
    progressInterval = setInterval(updateProgress, 500)
  } else {
    output = stdout || require('stdout-stream')
  }

  function updateProgress () {
    const timeSoFar = process.hrtime(start)
    const timeSoFarInMs = ((timeSoFar[0] * 1e9) + timeSoFar[1]) / 1e6
    const timeSoFarInSec = timeSoFarInMs / 1e3

    const totalTime = prettyMs(timeSoFarInMs)
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
