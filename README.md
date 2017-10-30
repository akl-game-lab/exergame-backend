# exergaming-backend

[![Build Status](https://travis-ci.org/akl-game-lab/exergame-backend.svg?branch=master)](https://travis-ci.org/akl-game-lab/exergame-backend) [![Dependency Status](https://david-dm.org/akl-game-lab/exergame-backend.svg)](https://david-dm.org/akl-game-lab/exergame-backend)

Gathers data from fitness tracking services and exposes it for use in video games.

## Usage

### Installation

```
# Install node.js v6.11.5 (and npm) (https://nodejs.org) - (note: nvm is a helpful tool for getting the right node version)
# Install mongodb (https://www.mongodb.com/download-center)
npm install
```

Copy config.js.sample to config.js and set encryption key to some value which is to be kept secret (do not commit config.js). If you change this key, the contents of your database will become invalid.

```
./bin/www
```

### Running in the Background

To run in the background, use a program called forever.js which can be installed with npm:

```
npm install -g forever
forever start bin/www
```

### Running the Tests

Simply run the following command.

```
npm test
```

## Contribution Guide

The code structure and the functions of the various classes are fairly self explanatory, however some parts do need explaining

### Transformer Classes

The transformer classes contain the 'transform' method to format the exercise data from the database into an appropriate format for use in a video game. For example, Skyrim has a three attribute (health, stamina and magicka) system, so when it makes a request, it will specify that it wants the hsm format. The transformer factory will take that as input and will instantiate the HsmTransformer class to format the exercise data from the database.

If a new format is to be created, simply write the appropriate transformer class and update the TransformerFactory class

