# exergaming-backend

[![Build Status](https://travis-ci.org/akl-game-lab/exergame-backend.svg?branch=master)](https://travis-ci.org/akl-game-lab/exergame-backend) [![Dependency Status](https://david-dm.org/akl-game-lab/exergame-backend.svg)](https://david-dm.org/akl-game-lab/exergame-backend)

Gathers data from fitness tracking services and exposes it for use in video games.

## Usage

### Installation
```
# Install node.js v4 (and npm)
# Install mongodb
# Install PhantomJS headless browser
npm install -g casperjs
npm install
```

Copy config.js.sample to config.js and set encryption key to some value which is to be kept secret (do not commit config.js). If you change this key, the contents of your database will become invalid.

```
./bin/www
```
