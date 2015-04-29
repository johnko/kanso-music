exports.list = {
    next: function(e) {
        var currentSong = $('.nowPlaying');
        if (!currentSong) return;

        var nextElement = currentSong.next('.song');
        if (nextElement.length === 0) return;

        $(this).trigger('play', nextElement.data('doc'));
    },
    play: function(e, doc) {
        $('.nowPlaying').removeClass('nowPlaying');
        $('#song_' + doc._id).addClass('nowPlaying');

        /* TO BE BOUND TO PLAYER WIDGET PLAY */
    },
    previous: function(e) {
        var currentSong = $('.nowPlaying');
        if (!currentSong) return;

        var previousElement = currentSong.prev('.song');
        if (previousElement.length === 0) return;

        $(this).trigger('play', previousElement.data('doc'));
    },
    loggedIn: {
        after: function(data) {
            var doc;

            var list = data.rows.map(function(r) {
                doc = r.doc;
                return doc;
            }); /* EPIC MUSTACHE! */

            $(this).trigger('setList', [list]);
        },
        query: {
            "view": "songs",
            "include_docs": "true"
        }
    },
    loggedOut: {
        "mustache": "_"
    },
    setList: {
        after: function(e, data) {
            var prefix = $$(this).app.db.uri;
            var doc;

            for (var i = 0; i < data.length; i++) {
                doc = data[i];

                if (doc._attachments) {
                    for (var name in doc._attachments) {
                        if (!doc.url && name.substring(name.length - 3) == 'mp3') {
                            doc.url = prefix + encodeURIComponent(doc._id) + '/' + encodeURIComponent(name);
                        } else if (!doc.coverUrl && name.substring(0, 5) == 'cover') {
                            doc.coverUrl = prefix + encodeURIComponent(doc._id) + '/' + encodeURIComponent(name);
                        }
                    }
                }

                $('#song_' + doc._id).data('doc', doc);
            }
        },
        data: function(e, data) {
            var doc;
            var i = 0;

            return {
                songs: data.map(function(r) {
                    doc = r;
                    doc.rowClass = 'l' + (i++ % 2);
                    return doc;
                })
            };
        },
        mustache: "<table>\n\t<tr>\n\t\t<th class='artist'>Artist</th>\n\t\t<th class='title'>Title</th>\n\t\t<th class='album'>Album</th>\n\t</tr>\n{{#songs}}\n\t<tr class=\"song {{rowClass}}\" id=\"song_{{_id}}\">\n\t\t<td class='artist'>{{artist}}</td>\n\t\t<td class='title'>{{title}}</td>\n\t\t<td class='album'>{{album}}</td>\n\t</tr>\n{{/songs}}\n</table>",
        selectors: {
            "tr.song": {
                click: function(e) {
                    $(this).trigger('play', $(this).data('doc'));
                }
            }
        }
    }
};

exports.player = {
    play: function(e, doc) {
        var player = $(this).data('player');
        var cover = $('img', this);

        if (player.stop)
            player.stop();

        if (doc) {
            player.src = doc.url;
            player.load();

            if (doc.coverUrl)
                cover.attr('src', doc.coverUrl);

            cover.css('visibility', doc.coverUrl ? 'visible' : 'hidden');
        }

        if (player.play)
            player.play();
    },
    loggedIn: {
        after: function(e) {
            /* we will need to access the raw AUDIO element contained in the widget */
            var div = this.get()[0];
            $(this).data('player', div.getElementsByTagName('audio')[0]);
        },
        mustache: "<img>\n<a class=\"prevButton\" href=\"\">&lt;&lt;</a>\n<audio controls=\"controls\">You'd better get an HTML5-compliant browser!</audio>\n<a class=\"nextButton\" href=\"\">&gt;&gt;</a>",
        selectors: {
            "a.nextButton": {
                click: function(e) {
                    $(this).trigger('next');
                    return false;
                }
            },
            "audio": {
                ended: function(e) {
                    $(this).trigger('next');
                }
            },
            "a.prevButton": {
                click: function(e) {
                    $(this).trigger('previous');
                    return false;
                }
            }
        }
    },
    loggedOut: {
        "mustache": "_"
    },
};

exports.searchBox = {
    search: function(e, query) {
        /* TODO : maybe there's a better way to query couchdb-lucene... ? */
        if (!query || query === '') {
            return;
        }
        var app = $$(this).app;
        var widget = $(this);
        /* TODO : protect "query". lucene is sensitive */
        var reqUrl = app.db.uri + '_fti/' + app.ddoc._id + '/songs?q=' + encodeURIComponent(query) + '&include_docs=true';
        $.ajax({
            type: "GET",
            url: reqUrl,
            complete: function(req) {
                var resp = $.httpData(req, "json");

                if (req.status >= 400)
                    alert("Error while requesting couchdb-lucene : " + resp.reason);
                else {
                    var doc;

                    var list = resp.rows.map(function(r) {
                        doc = r.doc;
                        return doc;
                    });

                    widget.trigger('setList', [list]);
                }
            }
        });
    },
    loggedOut: {
        mustache: "_"
    },
    loggedIn: {
        mustache: "<input value='Search...'/>",
        selectors: {
            "input": {
                focus: function(e) {
                    var input = $(this);
                    if (input.val() == 'Search...') input.val('');
                },
                keyup: function(e) {
                    $.log("keyup!");
                    var elem = $(this);
                    if (elem.data('value') == elem.val()) /* no value change since last call */
                        return;
                    elem.data('value', elem.val());
                    if (elem.data('timer')) {
                        clearTimeout(elem.data('timer'));
                        $.log("cleared");
                    }
                    elem.data('timer', setTimeout(function() {
                        $.log("triggered");
                        elem.data('timer', null);
                        elem.trigger('search', elem.val());
                    }, 500));
                }
            }
        }
    }
};
