"""REST API for posts."""
import flask
import insta485
from insta485.api.helper import InvalidUsage, authenticate


@insta485.app.route('/api/v1/', methods=["GET"])
def get_api():
    """Return the basic /api/v1/ route."""
    context = {
        "comments": "/api/v1/comments/",
        "likes": "/api/v1/likes/",
        "posts": "/api/v1/posts/",
        "url": "/api/v1/"
    }

    return flask.jsonify(**context), 200


@insta485.app.route('/api/v1/posts/', methods=["GET"])
def get_posts():
    """Return a list of posts."""
    # Authenticate the user
    logname = authenticate()

    # Connect to the database
    connection = insta485.model.get_db()

    # Get arguments
    size = flask.request.args.get("size", default=10, type=int)
    page = flask.request.args.get("page", default=0, type=int)

    # Confirm the size and page arguments are valid
    if size < 0 or page < 0:
        raise InvalidUsage("Bad Request", 400)

    # Handle postid_lte
    postid_lte = flask.request.args.get(
        "postid_lte", default=None, type=int
    )

    # If the postid_lte isn't specified it should be
    # equal to the latest post in the database
    if not postid_lte:
        # Get the postid of the most recent post that matches the criteria
        cur = connection.execute(
            "SELECT postid "
            "FROM posts "
            "WHERE (owner == :logname "
            "OR owner IN "
            "(SELECT username2 "
            "FROM following "
            "WHERE username1 == :logname)) "
            "ORDER BY postid DESC "
            "LIMIT 1",
            {"logname": logname}
        )

        result = cur.fetchone()
        postid_lte = result['postid'] if result else 0

    print(postid_lte)

    # Get the posts made by logname or people logname follows
    cur = connection.execute(
        "SELECT postid "
        "FROM posts "
        "WHERE postid <= :postid_lte "
        "AND (owner == :logname "
        "OR owner IN "
        "(SELECT username2 "
        "FROM following "
        "WHERE username1 == :logname)) "
        "ORDER BY postid DESC "
        "LIMIT :size "
        "OFFSET :sized_page",
        {
            "logname": logname,
            "size": size,
            "sized_page": size*page,
            "postid_lte": postid_lte
        }
    )
    results = cur.fetchall()

    # Put the posturl into each item
    for result in results:
        result['url'] = f'/api/v1/posts/{result["postid"]}/'

    # Determine what the next url should be
    next_url = ""
    if len(results) == size:
        next_url = (
            f"/api/v1/posts/?size={size}&page={page+1}"
            f"&postid_lte={postid_lte}"
        )

    url = flask.request.full_path
    # If the last character in the path is ? just remove it.
    if url[-1] == "?":
        url = url[0:len(url)-1]

    context = {
        "next": next_url,
        "results": results,
        "url": url
    }

    return flask.jsonify(**context), 200


@insta485.app.route('/api/v1/posts/<int:postid>/', methods=["GET"])
def get_single_post(postid):
    """Return post on postid."""
    # Authenticate the user
    logname = authenticate()

    # Connect to the database
    connection = insta485.model.get_db()

    # Get post details
    cur = connection.execute(
        "SELECT * "
        "FROM posts "
        "WHERE postid == ?",
        (postid, )
    )
    post = cur.fetchone()

    # Confirm the post exists
    if not post:
        raise InvalidUsage("Not Found", 404)

    # Extract the data from the post
    owner = post['owner']

    # Get the owners image
    cur = connection.execute(
        "SELECT filename "
        "FROM users "
        "WHERE username == ?",
        (owner, )
    )
    owner_filename = cur.fetchone()['filename']

    # Create the 'likes' object (See spec)
    # Start by counting all the likes
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE postid == :postid",
        {"postid": postid}
    )
    num_likes = len(cur.fetchall())

    # Now figure out if lognamed liked the comment
    cur = connection.execute(
        "SELECT likeid "
        "FROM likes "
        "WHERE postid == :postid "
        "AND owner == :logname",
        {
            "logname": logname,
            "postid": postid
        }
    )
    result = cur.fetchone()

    # Set to falsy values in beginning
    logname_likes_this = False
    likes_url = None

    # If the logname does like the comment, overwrite the values
    if result:
        logname_likes_this = True
        likes_url = f"/api/v1/likes/{result['likeid']}/"

    # Finish building the likes object
    likes = {
        "lognameLikesThis": logname_likes_this,
        "numLikes": num_likes,
        "url": likes_url
    }

    # Finally build the comments object
    cur = connection.execute(
        "SELECT commentid, owner, text "
        "FROM comments "
        "WHERE postid == :postid",
        {"postid": postid}
    )
    comments = cur.fetchall()

    # Add extra information to the comment object
    for comment in comments:
        comment['lognameOwnsThis'] = (comment["owner"] == logname)
        comment['ownerShowUrl'] = f"/users/{comment['owner']}/"
        comment['url'] = f"/api/v1/comments/{comment['commentid']}/"

    # Now build the context object
    context = {
        "comments": comments,
        "comments_url": f"/api/v1/comments/?postid={postid}",
        "created": post['created'],
        "imgUrl": f"/uploads/{post['filename']}",
        "likes": likes,
        "owner": owner,
        "ownerImgUrl": f"/uploads/{owner_filename}",
        "ownerShowUrl": f"/users/{owner}/",
        "postShowUrl": f"/posts/{postid}/",
        "postid": postid,
        "url": flask.request.path
    }

    # Return post information and 200 OKAY
    return flask.jsonify(**context), 200
