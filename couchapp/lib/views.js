exports.songs = {
    map: function(doc) {
        if (doc.type == "song") {
            emit(doc._id, null);
        }
    }
};

exports.artists = {
    map: function(doc) {
        if (doc.type == "song") {
            if (doc.artist) {
                emit(doc.artist, null);
            }
        }
    }
};

exports.titles = {
    map: function(doc) {
        if (doc.type == "song") {
            if (doc.title) {
                emit(doc.title, null);
            }
        }
    }
};

exports.albums = {
    map: function(doc) {
        if (doc.type == "song") {
            if (doc.album) {
                emit(doc.album, null);
            }
        }
    }
};
