"""
Routes for the /api/v1/likes/ endpoint.

/api/v1/likes/?postid=<postid> method=POST"
/api/v1/likes/<likeid>/ method=DELETE
"""
import flask
from insta485.api.helper import authenticate, InvalidUsage
import insta485


@insta485.app.route("/api/v1/likes/", methods=['POST'])
def likes_post():
    """Add a like to the given post."""
    # first check for authentication
    logname = authenticate()
    postid = flask.request.args.get('postid', None)

    connection = insta485.model.get_db()

    # first check if the like is already linked with the postid
    cur = connection.execute(
        "SELECT * "
        "FROM likes "
        "WHERE postid == ? AND owner == ?",
        (postid, logname)
    )

    conflict = cur.fetchone()

    if conflict:
        likeid = conflict['likeid']
        context = {
            "likeid": likeid,
            "url": f"/api/v1/likes/{likeid}/"
        }
        return flask.jsonify(**context), 200

    # now insert the like data into the post
    connection.execute(
        "INSERT INTO "
        "likes(postid, owner) "
        "VALUES (?, ?)",
        (postid, logname)
    )

    # https://www.w3resource.com/sqlite/core-functions-last_insert_rowid.php
    # SELECT last_insert_rowid()
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE likeid = (SELECT last_insert_rowid())"
    )

    likeid = cur.fetchone()['likeid']

    context = {
        "likeid": likeid,
        "url": f"/api/v1/likes/{likeid}/"
    }

    return flask.jsonify(**context), 201


@insta485.app.route("/api/v1/likes/<int:likeid>/", methods=['DELETE'])
def likes_delete(likeid):
    """Delete a given like."""
    logname = authenticate()

    connection = insta485.model.get_db()

    # Check if the likeid exists
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE likeid == :likeid",
        {"likeid": likeid}
    )

    like = cur.fetchone()

    # if the likeid does not exist then return 403
    if not like:
        raise InvalidUsage("Not Found", 404)

    # Check if the owner owns the likeid
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE owner == :logname "
        "AND likeid == :likeid",
        {
            "logname": logname,
            "likeid": likeid
        }
    )

    owner = cur.fetchone()
    # If the logname does not own the likeid then return 403
    if not owner:
        raise InvalidUsage("Forbidden", 403)

    cur = connection.execute(
        "DELETE "
        "FROM likes "
        "WHERE likeid == :likeid",
        {"likeid": likeid}
    )

    return "", 204
