"""REST API for comments."""
import flask
import insta485
from insta485.api.helper import authenticate, InvalidUsage


@insta485.app.route("/api/v1/comments/", methods=["POST"])
def add_comment():
    """Add comment to database."""
    # Authenticate the user
    logname = authenticate()

    # Get the postid from the arguments
    postid = flask.request.args.get("postid", None)

    # Get the text from the form data
    request_data = flask.request.get_json()
    text = request_data.get("text", None)

    # connect to the database
    connection = insta485.model.get_db()

    # insert comment object
    connection.execute(
        "INSERT INTO comments"
        "(owner, postid, text) "
        "VALUES "
        "(:logname, :postid, :text)",
        {
            "text": text,
            "logname": logname,
            "postid": postid
        }
    )

    # Get the comment object that was just created
    cur = connection.execute(
        "SELECT commentid, text "
        "FROM comments "
        "WHERE commentid == (SELECT last_insert_rowid())"
    )

    new_comment = cur.fetchone()

    # Build the response
    context = {
        "commentid": new_comment['commentid'],
        "lognameOwnsThis": True,
        "owner": logname,
        "ownerShowUrl": f'/users/{logname}/',
        "text": new_comment['text'],
        "url": f'/api/v1/comments/{new_comment["commentid"]}/'
    }

    return flask.jsonify(**context), 201


@insta485.app.route("/api/v1/comments/<int:commentid>/", methods=["DELETE"])
def delete_comment(commentid):
    """Delete a from the database."""
    logname = authenticate()

    # Make a connection to the database
    connection = insta485.model.get_db()

    # Grab the specified commentid
    cur = connection.execute(
        "SELECT owner "
        "FROM comments "
        "WHERE commentid == :commentid",
        {"commentid": commentid}
    )

    comment = cur.fetchone()

    # Check to see if the comment exists
    if not comment:
        raise InvalidUsage("Not Found", 404)

    # Confirm the logged in user owns the comment
    if not comment['owner'] == logname:
        raise InvalidUsage("Forbidden", 403)

    # Delete the comment from the database
    connection.execute(
        "DELETE "
        "FROM comments "
        "WHERE commentid == :commentid",
        {"commentid": commentid}
    )

    # Return 204 NO CONTENT
    return "", 204
