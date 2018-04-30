/*! markdown-it-linkscheme v1.0.2 | MIT License | github.com/adam-p/markdown-it-linkscheme */

var Dropbox = require('dropbox').Dropbox;

function getToken() {
  return localStorage.getItem('token');
}

module.exports = function builder(redirectorUrl) {
  return function pathMod(md) {
    var oldLinkOpenOverride = md.renderer.rules.link_open;

    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      var hrefIndex = tokens[idx].attrIndex('href');

      if (hrefIndex >= 0 && tokens[idx].attrs[hrefIndex][1].charAt(0) !== '#' && !/^(?:[a-z]+:)?\/\//.test(tokens[idx].attrs[hrefIndex][1])) {
        tokens[idx].attrs[hrefIndex][1] = '/?/' + tokens[idx].attrs[hrefIndex][1];
      }

      if (hrefIndex >= 0 && /^(?:[a-z]+:)?\/\//.test(tokens[idx].attrs[hrefIndex][1])) {
        tokens[idx].attrs[hrefIndex][1] = redirectorUrl + tokens[idx].attrs[hrefIndex][1];
      }

      if (oldLinkOpenOverride) {
        return oldLinkOpenOverride.apply(self, arguments);
      }
      else {
        // There was no previous renderer override. Just call the default.
        return self.renderToken.apply(self, arguments);
      }
    };

    var oldImageOverride = md.renderer.rules.image;

    md.renderer.rules.image = function(tokens, idx, options, env, slf) {
      var srcIndex = tokens[idx].attrIndex('src');
      var imgClass = tokens[idx].attrs[srcIndex][1].replace('.', '-');
      tokens[idx].attrs.push(['class', imgClass]);

      if (srcIndex >= 0 && !/^(?:[a-z]+:)?\/\//.test(tokens[idx].attrs[srcIndex][1])) {
        var dbx = new Dropbox({ accessToken: getToken() });
        var path = `/${tokens[idx].attrs[srcIndex][1]}`;
        dbx.filesDownload({ 'path': path }).then(function(response) {
          var blobURL = URL.createObjectURL(response.fileBlob);
          // console.log('url', blobURL);
          Array.prototype.forEach.call(document.getElementsByClassName(imgClass), function(el, index) {
            el.src = blobURL;
            // console.log('el', el);
          });
        }).catch(function(error) {
          console.log(error);
        });
        tokens[idx].attrs[srcIndex][1] = "";
        if (oldImageOverride) {
          return oldImageOverride.apply(slf, arguments);
        }
        else {
          return slf.renderToken.apply(slf, arguments);
        }
      }
    };
  };
};
