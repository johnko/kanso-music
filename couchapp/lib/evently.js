exports.list = {
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
            var imgextensions = ['.jpg', 'jpeg', '.png', '.gif'];

            for (var i = 0; i < data.length; i++) {
                doc = data[i];
                doc.supplied = '';
                if (doc._attachments) {
                    for (var name2 in doc._attachments) {
                        if (doc.track) delete doc.track;
                        if (!doc.mp3 && name2.substring(name2.length - 4) == '.mp3') {
                            doc.mp3 = prefix + encodeURIComponent(doc._id) + '/' + encodeURIComponent(name2);
                            if (doc.supplied.length > 1) {
                                doc.supplied += ', ';
                            }
                            doc.supplied += 'mp3';
                        } else if (!doc.poster && imgextensions.indexOf(name2.substring(name2.length - 4).toLowerCase()) > -1) {
                            doc.poster = prefix + encodeURIComponent(doc._id) + '/' + encodeURIComponent(name2);
                        }
                    }
                } else if (doc.dtfc) {
                    for (var name in doc.dtfc) {
                        if (doc.track) delete doc.track;
                        if (!doc.mp3 && name.substring(name.length - 4) == '.mp3') {
                            doc.mp3 = "/dtfc/" + doc.dtfc[name].sha512;
                            if (doc.supplied.length > 1) {
                                doc.supplied += ', ';
                            }
                            doc.supplied += 'mp3';
                        } else if (!doc.poster && imgextensions.indexOf(name.substring(name.length - 4).toLowerCase()) > -1) {
                            doc.poster = "/dtfc/" + doc.dtfc[name].sha512;
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
                    var doc = $(this).data('doc');
                    var myPlaylist = $("#player").data('myPlaylist');
                    //console.log(myPlaylist);
                    myPlaylist.add(doc);
                    if (myPlaylist.play) {
                        myPlaylist.play();
                    }
                }
            }
        }
    }
};

exports.player = {
    loggedIn: {
        after: function(e) {
            var myPlaylist = new jPlayerPlaylist({
                jPlayer: "#jquery_jplayer_N",
                cssSelectorAncestor: "#jp_container_N"
            }, [], {
                playlistOptions: {
                    autoPlay: true,
                    enableRemoveControls: true
                },
                swfPath: "./vendor/jplayer/jplayer",
                supplied: "m4a, oga, mp3",
                useStateClassSkin: true,
                autoBlur: true,
                smoothPlayBar: false,
                keyEnabled: true,
                audioFullScreen: false,
                volume: 1
            });
            $("#player").data('myPlaylist', myPlaylist);
        },
        mustache: "<br/>" +
            //'<div id="jp_container_N" class="jp-video jp-video-270p" role="application" aria-label="media player">' +
            '<div id="jp_container_N" class="jp-audio" role="application" aria-label="media player">' +
            '	<div class="jp-type-playlist">' +
            '		<div id="jquery_jplayer_N" class="jp-jplayer"></div>' +
            '		<div class="jp-gui jp-interface">' +
            '			<div class="jp-volume-controls">' +
            '				<button class="jp-mute" role="button" tabindex="0">mute</button>' +
            '				<button class="jp-volume-max" role="button" tabindex="0">max volume</button>' +
            '				<div class="jp-volume-bar">' +
            '					<div class="jp-volume-bar-value"></div>' +
            '				</div>' +
            '			</div>' +
            '			<div class="jp-controls-holder">' +
            '				<div class="jp-controls">' +
            '					<button class="jp-previous" role="button" tabindex="0">previous</button>' +
            '					<button class="jp-play" role="button" tabindex="0">play</button>' +
            '					<button class="jp-stop" role="button" tabindex="0">stop</button>' +
            '					<button class="jp-next" role="button" tabindex="0">next</button>' +
            '				</div>' +
            '				<div class="jp-progress">' +
            '					<div class="jp-seek-bar">' +
            '						<div class="jp-play-bar"></div>' +
            '					</div>' +
            '				</div>' +
            '				<div class="jp-current-time" role="timer" aria-label="time"></div>' +
            '				<div class="jp-duration" role="timer" aria-label="duration"></div>' +
            '				<div class="jp-toggles">' +
            '					<button class="jp-repeat" role="button" tabindex="0">repeat</button>' +
            '					<button class="jp-shuffle" role="button" tabindex="0">shuffle</button>' +
            '				</div>' +
            '			</div>' +
            '		</div>' +
            '		<div class="jp-playlist">' +
            '			<ul>' +
            '				<!-- The method Playlist.displayPlaylist() uses this unordered list -->' +
            '				<li>&nbsp;</li>' +
            '			</ul>' +
            '		</div>' +
            '		<div class="jp-no-solution">' +
            '			<span>Update Required</span>' +
            '			To play the media you will need to either update your browser to a recent version or update your <a href="http://get.adobe.com/flashplayer/" target="_blank">Flash plugin</a>.' +
            '		</div>' +
            '	</div>' +
            '</div>',
        selectors: {
            "audio": {
                ended: function(e) {
                    $(this).trigger('next');
                }
            },
        }
    },
    loggedOut: {
        "mustache": "_"
    },
};

exports.libraryTitle = {
    loggedOut: {
        mustache: "_"
    },
    loggedIn: {
        mustache: "<h2>Library</h2>"
    }
};

exports.pageMenu = {
    loggedOut: {
        mustache: "_"
    },
    loggedIn: {
        mustache: "<li><a id=\"addallplaylist\" href=\"#\">Add all to playlist</a></li>\n" +
            "<li><a id=\"clearplaylist\" href=\"#\">Clear playlist</a></li>\n",
        selectors: {
            "a#addallplaylist": {
                click: function(e) {
                    e.preventDefault();
                    var myPlaylist = $("#player").data('myPlaylist');
                    //var allsongs = [];
                    var songrows = $("tr.song").each(function() {
                        var row = $(this);
                        var doc = row.data("doc");
                        //allsongs.push(doc);
                        myPlaylist.add(doc);
                    });
                    //myPlaylist.setPlaylist(allsongs);
                    if (myPlaylist.play) {
                        myPlaylist.play();
                    }
                }
            },
            "a#clearplaylist": {
                click: function(e) {
                    e.preventDefault();
                    //$("#jquery_jplayer_N").jPlayer("stop");
                    var myPlaylist = $("#player").data('myPlaylist');
                    myPlaylist.setPlaylist([]);
                }
            },
        }
    }
};

exports.searchBox = {
    search: function(e, query) {
        var reqUrl;
        var view = "titles";
        if (!query || query === '') {
            // show all songs
            reqUrl = "./_ddoc/_view/songs?include_docs=true";
        } else {
            var regexpartist = new RegExp("^artist:");
            var regexpalbum = new RegExp("^album:");
            if (regexpartist.test(query)) {
                query = query.replace("artist:", "");
                view = "artists";
            } else if (regexpalbum.test(query)) {
                query = query.replace("album:", "");
                view = "albums";
            }
            // search by title
            reqUrl = "./_ddoc/_view/" + view +
                "?startkey=" + encodeURIComponent('"' + query.toLowerCase() + '"') +
                "&endkey=" + encodeURIComponent('"' + query.toUpperCase() + '\\ufff0' + '"') +
                "&include_docs=true";
        }
        var app = $$(this).app;
        var widget = $(this);
        $.ajax({
            type: "GET",
            url: reqUrl,
            success: function(data) {
                var resp = JSON.parse(data);
                var doc;
                var list = resp.rows.map(function(r) {
                    doc = r.doc;
                    return doc;
                });
                widget.trigger('setList', [list]);
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
                    //$.log("keyup!");
                    var elem = $(this);
                    if (elem.data('value') == elem.val()) /* no value change since last call */
                        return;
                    elem.data('value', elem.val());
                    if (elem.data('timer')) {
                        clearTimeout(elem.data('timer'));
                        //$.log("cleared");
                    }
                    elem.data('timer', setTimeout(function() {
                        //$.log("triggered");
                        elem.data('timer', null);
                        elem.trigger('search', elem.val());
                    }, 500));
                }
            }
        }
    }
};
