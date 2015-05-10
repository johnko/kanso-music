/**
 * The validate_doc_update function to be exported from the design doc.
 */

module.exports = function(newDoc, oldDoc, userCtx) {
    function user_is(role) {
        return userCtx.roles.indexOf(role) >= 0;
    }
    if (!user_is("_admin")) {
        // user is not admin, check _id
        if (newDoc._id && oldDoc._id && newDoc._id == oldDoc._id) throw ({
            forbidden: "Restricted: Not allowed to modify."
        });
    }
};
