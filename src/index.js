'use strict';

var Dropbox = require('dropbox').Dropbox;
var md = null;
var queryString = require('query-string');

var starter = require('./starter');

var m = require('mithril');
m.route.prefix = '?';

var prop = require('mithril/stream');

var app = {};
var auth = require('./auth');

window.Maki = function (CLIENT_ID, REDIRECT_URI, options) {
  md = require('markdown-it')()
    .use(require('./markdown-it-pathmod')(options.DEREFERRER_URI || ''))
    .use(require('markdown-it-deflist'))
    .use(require('markdown-it-katex'));
  auth.config.CLIENT_ID = CLIENT_ID;
  auth.config.REDIRECT_URI = REDIRECT_URI;
  document.addEventListener('DOMContentLoaded', function (event) {
    if (location.pathname === '/') {
      var a = document.createElement('a');
      a.href = document.referrer;
      var ref = a.protocol + '//' + a.host + '/';
      if (
        (ref === 'https://www.dropbox.com/' ||
          ref === auth.config.REDIRECT_URI) &&
        location.hash !== ''
      ) {
        var token = queryString.parse(location.hash).access_token;
        setToken(token);
        app.config = new app.Config({ token: getToken() });
        starter.init(app.config);
      }
    }
    m.route(document.body, '/', {
      '/': app,
      '/:name...': app,
    });
  });
};

app.Config = function (data) {
  this.dbx = new Dropbox({ accessToken: data.token });
};

app.Page = function (data) {
  this.name = prop('');
  this.content = prop('');
};

app.vm = (function () {
  var vm = {};
  vm.init = function () {
    vm.page = new app.Page();
  };
  return vm;
})();

app.renderPage = function (name) {
  var dbx = app.config.dbx;
  var path = '/' + name + '.md';
  // m.startComputation()
  dbx
    .filesDownload({ path: path })
    .then(function (response) {
      var blob = response.fileBlob;
      var reader = new FileReader();
      reader.onload = function () {
        var buffer = reader.result;
        var html = md.render(buffer);
        app.vm.page.content(m('div', { id: 'content' }, m.trust(html)));
        m.redraw();
        // m.endComputation()
      };
      reader.readAsText(blob, 'utf-8');
    })
    .catch(function (err) {
      console.log(err);
      location.href = '/?/HomePage?do=auth';
    });
};

app.listPages = function (base) {
  var dbx = app.config.dbx;
  var path = base.replace(/\/+$/, '');
  // m.startComputation()
  dbx
    .filesListFolder({ path: path, recursive: true })
    .then(function (response) {
      // console.log(response)
      var list = [];
      response.entries.forEach(function (el, i, ar) {
        if (el['.tag'] === 'file') {
          // console.log(el.path_display)
          var name = el.path_display.substr(1).replace(/\.md$/, '');
          var row = m('tr', [m('td', [m('a', { href: '/?/' + name }, name)])]);
          list.push(row);
        }
      });
      var listView = [
        m('table.table.table-striped.table-hover', [
          m('thead', [m('tr', [m('th', 'Name')])]),
          m('tbody', list),
        ]),
      ];
      app.vm.page.content(listView);
      m.redraw();
    })
    .catch(function (err) {
      console.log(err);
      location.href = '/?/HomePage?do=auth';
    });
};

function setToken(token) {
  localStorage.setItem('token', token);
}

function getToken() {
  return localStorage.getItem('token');
}

function removeToken() {
  localStorage.removeItem('token');
}

app.oninit = function (vnode) {
  if (m.route.get() === '/') {
    location.href = '/?/HomePage';
  }
  var doArg = m.route.param('do');
  if (doArg === 'auth') {
    m.mount(document.body, auth);
    return false;
  } else if (doArg === 'logout') {
    if (app.config) {
      app.condig.dbx.authTokenRevoke();
    }
    removeToken();
    app.config = null;
    location.href = '/?/HomePage';
  } else if (doArg === 'index') {
    app.config = app.config || new app.Config({ token: getToken() });
    app.vm.init();
    app.vm.page.name('Index');
    document.title = 'Index';
    app.listPages('/');
  } else {
    app.config = app.config || new app.Config({ token: getToken() });
    app.vm.init();
    var name = m.route.get();
    // TODO: Fix dirty hack
    // https://www.dropbox.com/developers/documentation/http/documentation
    // says [REDIRECT_URI]#access_token=ABCDEFG&token_type=...
    // while Mithrill returns access_token... for m.route.get() for some reason
    if (name.startsWith('access_token')) {
      location.href = '/?/HomePage';
    } else {
      name = name.substr(1).replace(/\?.*$/, '');
      app.vm.page.name(name);
      document.title = name;
      app.renderPage(name);
    }
  }
};

app.view = function () {
  var cur = m.route.get();
  if (cur.indexOf('?') !== -1) {
    cur = '/?' + cur.substr(0, cur.indexOf('?'));
  } else {
    cur = '/?' + cur;
  }
  if (app.vm.page === undefined) {
    return [];
  }
  return [
    m('div', { id: 'main', class: 'container grid-960' }, [
      m('header', { class: 'navbar' }, [
        m('section', { class: 'navbar-section' }, [
          m(
            'a',
            { href: '#', class: 'navbar-brand', id: 'page-name' },
            app.vm.page.name(),
          ),
        ]),
        m('section', { class: 'navbar-section' }, [
          m(
            'input',
            {
              type: 'text',
              class: 'form-input input-inline',
              placeholder: 'Search',
            },
            '',
          ),
          m('a.btn', { href: '/?/HomePage' }, 'Home'),
          m('a.btn', { href: cur + '?do=index' }, 'Index'),
          m('a.btn', { href: '#' }, 'Share'), // cur + "?do=share"
          m('a.btn.btn-primary', { href: cur + '?do=logout' }, 'Logout'),
        ]),
      ]),
      app.vm.page.content(),
    ]),
  ];
};
