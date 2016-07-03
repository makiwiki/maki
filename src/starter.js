'use strict';

var Dropbox = require('dropbox');

var auth = require('./auth');

var starter = {};

function getToken() {
  return localStorage.getItem('token');
}

var files = [
  {
    'path': "/HomePage.md",
    'url': "https://raw.githubusercontent.com/makiwiki/maki/master/resources/HomePage.md"
  },
  {
    'path': "/idol_akusyu.png",
    'url': "https://raw.githubusercontent.com/makiwiki/maki/master/resources/idol_akusyu.png"
  }
];

var starter = {
  init: function(config, cb) {
    var dbx = config.dbx;
    dbx.filesGetMetadata({ 'path': "/HomePage.md" })
    .then(function(response) {
      // console.log(response);
    })
    .catch(function(err) {
      // console.log(err);
      if (err.status === 409) {
        // TODO: should be parallel
        dbx.filesSaveUrl(files[0]).then(function() {
          dbx.filesSaveUrl(files[1]).then(function() {
            location.reload();
          });
        });
      }
    });
  }
};


module.exports = starter;
