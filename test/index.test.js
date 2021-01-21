var test = require('./tape-nock-setup')

var bin = require('../bin')
var to = require('to2')
var pkg = require('../package.json')
var fs = require('fs')
var rimraf = require('rimraf')

function bestbuy (cmd, callback) {
  var output = ''

  var args = cmd.match(/[\\.-\w]+|"(?:\\"|[^"])+"/g) || []
  args = args.map(a => a.replace(/"/g, ''))
  bin(args, to(
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
    t.ok(output.startsWith('\nBest Buy Bulk Download Tool'), 'help message shown')
    t.end()
  })
})

test('--help shows the help screen', function (t) {
  bestbuy('--help', function (err, output) {
    t.error(err, 'no error')
    t.ok(output.startsWith('\nBest Buy Bulk Download Tool'), 'help message shown')
    t.end()
  })
})

test('--h shows the help screen', function (t) {
  bestbuy('-h', function (err, output) {
    t.error(err, 'no error')
    t.ok(output.startsWith('\nBest Buy Bulk Download Tool'), 'help message shown')
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

test('fetch a product by sku and output to stdout', function (t) {
  bestbuy('products --query 5919905 --show name', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `[\n{"name":"Nintendo - Switch™ 32GB Super Mario Odyssey Edition Bundle - Red Joy-Con"}\n]\n`
    t.equals(output, expectedOutput, 'stdout is as expected')
    t.end()
  })
})

test('fetch a product by sku and output to stdout as xml', function (t) {
  bestbuy('products -q 5919905 --s name -f xml', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `<products>\n<product>\n  <name>Nintendo - Switch™ 32GB Super Mario Odyssey Edition Bundle - Red Joy-Con</name>\n</product>\n</products>`
    t.equals(output, expectedOutput, 'stdout is as expected')
    t.end()
  })
})

test('fetch a product by sku and output to stdout in bare mode', function (t) {
  bestbuy('products --query "sku in (5919905,5670100)" --show name --bare', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `{"name":"Nintendo - Switch™ 32GB Console - Neon Red/Neon Blue Joy-Con™"}\n{"name":"Nintendo - Switch™ 32GB Super Mario Odyssey Edition Bundle - Red Joy-Con"}`
    t.equals(output, expectedOutput, 'stdout is as expected')
    t.end()
  })
})

test('fetch a product by sku and output to stdout as xml in bare mode', function (t) {
  bestbuy('products --query "sku in (5919905,5670100)" --show name --format xml --bare', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `<product>    <name>Nintendo - Switch™ 32GB Console - Neon Red/Neon Blue Joy-Con™</name>  </product>
<product>    <name>Nintendo - Switch™ 32GB Super Mario Odyssey Edition Bundle - Red Joy-Con</name>  </product>
`
    t.equals(output, expectedOutput, 'stdout is as expected')
    t.end()
  })
})

test('fetch a product by sku and output to a file', function (t) {
  bestbuy('products -q 5919905 --s name -o data.json', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `products: 1/1 (100.00%)`
    t.ok(output.startsWith(expectedOutput), 'stdout is as expected')

    // ensure file is good
    var dataFile = fs.readFileSync('data.json')

    t.equals(dataFile.toString(), `[\n{"name":"Nintendo - Switch™ 32GB Super Mario Odyssey Edition Bundle - Red Joy-Con"}\n]\n`, 'data file has expected content')
    rimraf.sync('data.json')
    t.end()
  })
})

test('fetch a product by sku and output to a file as xml', function (t) {
  // delete file

  bestbuy('products --format xml --query 5919905 --show name --output data.xml', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `products: 1/1 (100.00%)`
    t.ok(output.startsWith(expectedOutput), 'stdout is as expected')

    // ensure file is good
    var dataFile = fs.readFileSync('data.xml')

    t.equals(dataFile.toString(), `<products>\n<product>\n  <name>Nintendo - Switch™ 32GB Super Mario Odyssey Edition Bundle - Red Joy-Con</name>\n</product>\n</products>`, 'data file has expected content')
    rimraf.sync('data.xml')
    t.end()
  })
})

test('fetch a category by id and output to stdout', function (t) {
  bestbuy('categories --query "id=abcat0010000" --show name', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `[\n{"name":"Gift Ideas"}\n]\n`
    t.equals(output, expectedOutput, 'stdout is as expected')
    t.end()
  })
})

test('fetch stores by postalCode and output to stdout', function (t) {
  bestbuy('stores --query "postalCode=55109" --show "name,storeType"', function (err, output) {
    t.error(err, 'no error')
    var expectedOutput = `[\n{"name":"MAPLEWOOD MN","storeType":"Big Box"}\n,\n{"name":"MAPLEWOOD MALL","storeType":"Mobile SAS"}\n]\n`
    t.equals(output, expectedOutput, 'stdout is as expected')
    t.end()
  })
})

test('fetch all stores', function (t) {
  bestbuy('stores -q "storeType=Big Box" --show "storeId"', function (err, output) {
    t.error(err, 'no error')
    var stores = JSON.parse(output)
    t.equals(stores.length, 1021, 'all stores returned')
    t.end()
  })
})

test('fetch stores and sort by name', function (t) {
  bestbuy('stores -q "region=MN&storeType=Big Box" --show name --sort name', function (err, output) {
    t.error(err, 'no error')
    var stores = JSON.parse(output)
    stores.forEach((s, i) => i + 1 < stores.length && t.ok(s.name <= stores[i + 1].name, `${s.name} < ${stores[i + 1].name}`))
    t.end()
  })
})

test('fetch all stores and sort by name desc', function (t) {
  bestbuy('stores -q "region=MN&storeType=Big Box" --show name --sort "name.desc"', function (err, output) {
    t.error(err, 'no error')
    var stores = JSON.parse(output)
    stores.forEach((s, i) => i + 1 < stores.length && t.ok(s.name >= stores[i + 1].name, `${s.name} < ${stores[i + 1].name}`))
    t.end()
  })
})

test('fetch products as csv', function (t) {
  bestbuy('products -q "sku=5721722" -s "name,salePrice,url" -f csv', function (err, output) {
    t.error(err, 'no error')

    var expected = `name,salePrice,url\nSuper Mario Odyssey - Nintendo Switch,59.99,https://api.bestbuy.com/click/-/5721722/pdp`
    t.equals(output, expected, 'csv header row present')
    t.end()
  })
})

test('fetch products as csv without the header row using --bare', function (t) {
  bestbuy('products --query "sku=5721722" --show "name,salePrice,url" --format csv --bare', function (err, output) {
    t.error(err, 'no error')
    var expected = `Super Mario Odyssey - Nintendo Switch,59.99,https://api.bestbuy.com/click/-/5721722/pdp`
    t.equals(output, expected, 'csv header row not present')
    t.end()
  })
})

test('fetch products as tsv', function (t) {
  bestbuy('products -q "sku=5721722" -s "name,salePrice,url" -f tsv', function (err, output) {
    t.error(err, 'no error')

    var expected = `name\tsalePrice\turl\nSuper Mario Odyssey - Nintendo Switch\t59.99\thttps://api.bestbuy.com/click/-/5721722/pdp`
    t.equals(output, expected, 'tsv header row present')
    t.end()
  })
})

test('fetch products as tsv without the header row using --bare', function (t) {
  bestbuy('products --query "sku=5721722" --show "name,salePrice,url" --format tsv --bare', function (err, output) {
    t.error(err, 'no error')
    var expected = `Super Mario Odyssey - Nintendo Switch\t59.99\thttps://api.bestbuy.com/click/-/5721722/pdp`
    t.equals(output, expected, 'csv header row not present')
    t.end()
  })
})
