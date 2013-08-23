hackify-server
==============

This is the server component for hackify and can be used to host a hackify server on your local machine.
Note that this server is deployed and available at http://www.hackify.org so you don't need to run this server in order to use hackify.

## Running hackify-server locally
Clone repo then..
```
$ npm install
$ npm install -g bower
$ bower install
$ node server.js
```

## hosting a hackify room on your local instance (see https://github.com/hackify/hackify for all command line options)
```
$ npm install -g hackify
$ cd /me/mycoolproject
$ hackify -s http://localhost:4000
```

## Running karma tests
```
$ npm install -g karma
$ cd test
$ karma start
```

## Running mocha tests (assumes server running locally)
```
$ npm install -g mocha
$ cd test/server
$ mocha *
```

