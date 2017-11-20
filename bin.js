#!/usr/bin/env node
const BBY_API_KEY_MSG = 'BBY_API_KEY environment variable'
const RESOURCES = ['products', 'categories', 'stores']
const pkg = require('./package')
const updateNotifier = require('update-notifier')

const run = require('.')

function cli (args, stream, cb) {
  var clopts = require('cliclopts')([
    {
      name: 'query',
      abbr: 'q',
      help: 'use a custom query to filter the results'
    },
    {
      name: 'show',
      abbr: 's',
      help: 'fields to show'
    },
    {
      name: 'sort',
      abbr: 'r',
      help: 'sort results by fields (comma separated)'
    },
    {
      name: 'key',
      abbr: 'k',
      help: 'Best Buy API key',
      default: BBY_API_KEY_MSG
    },
    {
      name: 'format',
      abbr: 'f',
      help: 'format of the response as json, xml, csv or tsv',
      default: 'json'
    },
    {
      name: 'output',
      abbr: 'o',
      help: 'name of file to send output (optional; If not present, out will go to stdout)'
    },
    {
      name: 'bare',
      abbr: 'b',
      help: 'newline delimited - each item on own line without extra cruft',
      default: false
    },
    {
      name: 'version',
      abbr: 'v',
      boolean: true,
      help: 'show version information'
    },
    {
      name: 'help',
      abbr: 'h',
      help: 'show help',
      boolean: true
    },
    {
      name: 'debug',
      abbr: 'd',
      help: 'show debug information',
      boolean: true,
      default: false
    }
  ])

  var argv = require('minimist')(args, {
    alias: clopts.alias(),
    boolean: clopts.boolean(),
    default: clopts.default()
  })

  argv.resource = argv.resource || argv._[0]

  if (argv.version) {
    stream.write(pkg.version + '\n')
    return cb()
  }

  if (!argv.resource) argv.help = true

  if (argv.help) {
    stream.write(`
Best Buy Bulk Download Tool (https://github.com/BestBuyAPIs/bestbuy-cli)

Usage: bestbuy [resource] [options]

    Examples:
      bestbuy categories
      bestbuy products --query "active=true" --show "name,sku" --output products.json
      bestbuy stores --format xml --output stores.xml

    resource              resource to download: ${RESOURCES.join(', ')}
`)
    clopts.print(stream)

    stream.write(`\nVisit https://developer.bestbuy.com/documentation for more details on writing custom queries.\n`)
    return cb()
  }

  argv.query = argv.query || ''

  if (argv.key === BBY_API_KEY_MSG) argv.key = process.env.BBY_API_KEY

  if (RESOURCES.indexOf(argv.resource) < 0) {
    return cb(new Error(`Invalid resource: ${argv.resource}`))
  }
  run(argv, stream, cb)
}

if (require.main === module) {
  cli(process.argv.slice(2), process.stdout, function done (err) {
    var code = 0
    if (err) {
      console.error(err.message)
      console.error(err.stack)
      code = -1
    }
    updateNotifier({pkg: pkg}).notify()
    process.exit(code)
  })
} else {
  module.exports = cli
}
