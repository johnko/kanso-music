var kansotopbar = require('kanso-topbar');

$(document).ready(function() {
    if (window.location.href.match(/\/_rewrite$/) !== null) location.href += '/';

    kansotopbar.init();
});

/*
 *    var splitUrl = document.location.href.split('/');
 *    var designPos = splitUrl.indexOf('_design');
 *    if (designPos > 4) {
 *       var newPrefix = "";
 *       for (var i = 3; i < (designPos - 1); i++) {
 *           newPrefix += "/" + splitUrl[i];
 *       }
 *       $.couch.urlPrefix = newPrefix;
 *   }
 */

$.couch.urlPrefix = "./";
$.couch.app(function(app) {
    var newLoggedOut = app.ddoc.vendor.couchapp.evently.account.loginForm;
    newLoggedOut.after = function(data) {
        var elem = $(this);
        $('#kanso-topbar-login-dropdown form').submit(function(ev) {
            ev.preventDefault();
            var form = this;
            var username = $('input[name="name"]', form).val();
            var password = $('input[name="password"]', form).val();
            elem.trigger('doLogin', [username, password]);
            return false;
        });
    };
    var customAccount = $.extend(true, {}, app.ddoc.vendor.couchapp.evently.account, {
        "loggedIn": {
            "data": function(e, r) {
                kansotopbar.updateSession(r.userCtx);
                var elem = $(this);
                $('#kanso-topbar-session .kanso-topbar-logout a').click(function(ev) {
                    ev.preventDefault();
                    elem.trigger('doLogout');
                    return false;
                });
                return {
                    /*
                     *name: r.userCtx.name,
                     *uri_name: encodeURIComponent(r.userCtx.name),
                     *auth_db: encodeURIComponent(r.info.authentication_db)
                     */
                };
            },
            "after": function(data) {
                kansotopbar.hideDropDown();
            },
            "mustache": "_"
        },
        "loggedOut": newLoggedOut
    });

    $("#account").evently(customAccount);

    $("#player").evently("player", app);
    $.evently.connect("#account", "#player", ["loggedIn", "loggedOut"]);

    $("#list").evently("list", app);
    $.evently.connect("#account", "#list", ["loggedIn", "loggedOut"]);

    $.evently.connect("#list", "#player", ["play"]);
    $.evently.connect("#player", "#list", ["next", "previous"]);

    $("#searchBox").evently("searchBox", app);
    $.evently.connect("#account", "#searchBox", ["loggedIn", "loggedOut"]);
    $.evently.connect("#searchBox", "#list", ["setList"]);

}, {
    db: "_db",
    design: "music"
});

$('#aboutLink').click(function(e) {
    $('#about').fadeIn();
    e.preventDefault();
});

$('#aboutCloseLink').click(function(e) {
    $('#about').fadeOut();
    e.preventDefault();
});
