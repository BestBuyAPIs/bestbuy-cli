# bestbuy-cli

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/bestbuy-cli.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/bestbuy-cli
[travis-image]: https://img.shields.io/travis/BestBuyAPIs/bestbuy-cli.svg?style=flat-square
[travis-url]: https://travis-ci.org/BestBuyAPIs/bestbuy-cli
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

Download data from the Best Buy Catalog API in bulk from the command line.

Get an API key at [developer.bestbuy.com](https://developer.bestbuy.com).

![Best Buy CLI Tool](https://cdn.rawgit.com/BestBuyAPIs/bestbuy-cli/master/images/download-all-stores.gif)

## Install

```
npm install --global bestbuy-cli
```

Can't install node? [Download a standalone executable](https://github.com/BestBuyAPIs/bestbuy-cli/releases) from the GitHub Releases page!

## Usage

```bash
>bestbuy --help

Best Buy Bulk Download Tool (https://github.com/BestBuyAPIs/bestbuy-cli)

Usage: bestbuy [resource] [options]

    Examples:
      bestbuy categories
      bestbuy products --query "active=true" --show "name,sku" --output products.json
      bestbuy stores --format xml --output stores.xml

    resource              resource to download: products, categories, stores
    --query, -q           use a custom query to filter the results
    --show, -s            fields to show
    --sort, -r            sort results by fields (comma separated)
    --key, -k             Best Buy API key (default: "BBY_API_KEY environment variable")
    --format, -f          format of the response as json, xml, csv or tsv (default: "json")
    --output, -o          name of file to send output (optional; If not present, out will go to stdout)
    --bare, -b            newline delimited - each item on own line without extra cruft (default: false)
    --version, -v         show version information
    --help, -h            show help

```
Visit the [Best Buy API Documentation](https://developer.bestbuy.com/documentation) for more details on writing custom queries.

## License

[MIT](LICENSE.md)
