exports.songs = {
    map: function(doc) {
        if ((doc.type == "mp3") || (doc.type == "m4a")) {
            emit(doc._id, null);
        }
    }
};

exports.artists = {
    map: function(doc) {
        if ((doc.type == "mp3") || (doc.type == "m4a")) {
            if (doc.artist) {
                emit(doc.artist, null);
            }
        }
    }
};

exports.titles = {
    map: function(doc) {
        if ((doc.type == "mp3") || (doc.type == "m4a")) {
            if (doc.title) {
                emit(doc.title, null);
            }
        }
    }
};

exports.albums = {
    map: function(doc) {
        if ((doc.type == "mp3") || (doc.type == "m4a")) {
            if (doc.album) {
                emit(doc.album, null);
            }
        }
    }
};
