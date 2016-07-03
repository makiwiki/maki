/*
Copyright (c) 2016 Dropbox Inc., http://www.dropbox.com/

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    "Software"), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
    LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
    OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
    WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var request = require('superagent');
var Promise = require('es6-promise').Promise;

var BASE_URL = 'https://content.dropboxapi.com/2/';

// This doesn't match what was spec'd in paper doc yet
var buildCustomError = function (error, response) {
  return {
    status: error.status,
    error: response.text,
    response: response
  };
};

var downloadRequest = function (path, args, accessToken, selectUser) {
  var promiseFunction = function (resolve, reject) {
    var apiRequest;

    function success(data) {
      if (resolve) {
        resolve(data);
      }
    }

    function failure(error) {
      if (reject) {
        reject(error);
      }
    }

    function responseHandler(error, response) {
      var responseData;
      var toDownload;
      if (error) {
        failure(buildCustomError(error, response));
      } else {
        responseData = JSON.parse(response.headers['dropbox-api-result']);
        toDownload = new Blob([response.xhr.response], { type: 'application/octet-stream' });
        responseData.objectDownloadUrl = URL.createObjectURL(toDownload);
        success(responseData);
      }
    }

    apiRequest = request.post(BASE_URL + path)
      .set('Authorization', 'Bearer ' + accessToken)
      .set('Dropbox-API-Arg', JSON.stringify(args));

    if (selectUser) {
      apiRequest = apiRequest.set('Dropbox-API-Select-User', selectUser);
    }

    apiRequest.responseType('blob');

    // apiRequest.send(body)
    apiRequest.end(responseHandler);
  };

  return new Promise(promiseFunction);
};

module.exports = downloadRequest;
