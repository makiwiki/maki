'use strict';

var m = require('mithril');

var Dropbox = require('dropbox').Dropbox;

var auth = {};
auth.config = {};

auth.oninit = function (vnode) {
  vnode.state.auth = function (e) {
    e.preventDefault();
    var dbx = new Dropbox({ clientId: auth.config.CLIENT_ID });
    var authUrl = dbx.getAuthenticationUrl(auth.config.REDIRECT_URI);
    location.href = authUrl;
    return false;
  };
};

auth.view = function (vnode) {
  return [
    m('div', { id: 'main', class: 'container grid-960' }, [
      m('header', { class: 'navbar' }, [
        m('section', { class: 'navbar-section' }, [
          m(
            'a',
            { href: '#', class: 'navbar-brand', id: 'page-name' },
            m.route.get().substr(1).replace(/\?.*$/, ''),
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
          m('a.btn', { href: '#' }, 'All'),
          m('a.btn', { href: '#' }, 'Share'),
          m('a.btn.btn-primary', { href: '#' }, 'Logout'),
        ]),
      ]),
      m('.modal.active.modal-sm', [
        m('.modal-overlay'),
        m('.modal-container', [
          m('.modal-body', [
            m('.content', [
              m('.text-center', [
                m('h1', 'Maki'),
                m('h6', 'A Dropbox-based Personal Wiki'),
                m(
                  'a',
                  { href: 'https://github.com/makiwiki/maki' },
                  'https://github.com/makiwiki/maki',
                ),
              ]),
            ]),
          ]),
          m('.modal-footer', [
            m('.text-center', [
              m(
                'a.btn',
                { href: '', onclick: vnode.state.auth },
                'Login with Dropbox',
              ),
            ]),
          ]),
        ]),
      ]),
    ]),
  ];
};

module.exports = auth;
