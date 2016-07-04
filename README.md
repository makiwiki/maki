# Maki

[![Dependencies][deps-image]][deps-url]

Maki is a Dropbox-based personal wiki engine.

## Table of Contents

* [Features](#features)
* [Using a Maki wiki](#using-a-maki-wiki)
* [Contributing](#contributing)
* [Todo](#todo)

## Features

* Private in principle
* Distraction-free: integrated with cloud storage
* Everything runs on client-side
* Supports Markdown
* Math rendering with KaTeX
* Sub pages

## Using a Maki wiki

* <http://makiwiki.github.io/>
* or set up by your own (see below)

### Installation

1. [Create app](https://www.dropbox.com/developers/apps) for Maki in your Dropbox account.
2. Place `dist/*` files into your webspace, such as GitHub Pages.
3. Edit `CLIENT_ID` and `REDIRECT_URI` in `index.html`.
4. That's all!

## Contributing

TBA

## Todo

* Modular architecture
  * Support other cloud storage services
  * Support other markup languages
  * Support plugins

[deps-image]: https://david-dm.org/makiwiki/maki.svg
[deps-url]: https://david-dm.org/makiwiki/maki
