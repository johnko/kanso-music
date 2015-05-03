/**
 * Filter functions to be exported from the design doc for _changes filtering.
 */

exports.songs = function(doc, req) {
    if (doc.type && doc.type === 'song') {
        return true;
    } else {
        return false;
    }
};
