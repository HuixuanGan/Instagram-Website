import React from "react";
import PropTypes from "prop-types";
import PostTop from "./post-top";
import Likes from "./likes";
import Comment from "./comment";
import CommentInput from "./commentInput";

class Post extends React.Component {
  /* Display image and post owner of a single post
   */
  constructor(props) {
    // Initialize mutable state
    super(props);

    // When making functions do this for each one.
    this.handleCommentDelete = this.handleCommentDelete.bind(this);
    this.handleCommentAdd = this.handleCommentAdd.bind(this);
    this.handleAddLike = this.handleAddLike.bind(this);
    this.handleLikeDelete = this.handleLikeDelete.bind(this);

    this.state = {
      imgUrl: "",
      owner: "",
      ownerImgUrl: "",
      ownerShowUrl: "",
      postShowUrl: "",
      created: "",
      lognameLikesThis: false,
      numLikes: 0,
      likeUrl: "",
    };
  }

  componentDidMount() {
    // This line automatically assigns this.props.url to the const variable url
    const { url } = this.props;
    // Call REST API to get the post's information
    fetch(url, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState({
          imgUrl: data.imgUrl,
          owner: data.owner,
          ownerImgUrl: data.ownerImgUrl,
          ownerShowUrl: data.ownerShowUrl,
          postShowUrl: data.postShowUrl,
          created: data.created,
          comments: data.comments,
          commentsUrl: data.comments_url,
          lognameLikesThis: data.likes.lognameLikesThis,
          numLikes: data.likes.numLikes,
          postid: data.postid,
          likeUrl: data.likes.url,
        });
      })
      .catch((error) => console.log(error));
  }

  handleCommentDelete(deleteUrl, commentid) {
    // Make sure comments object exists in state
    const { comments } = this.state;
    if (!comments) {
      return;
    }

    // Make the fetch request to remove it from the database
    fetch(deleteUrl, {
      method: "DELETE",
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        // Remove the comment from the list (Should make post rerender)
        this.setState((prevState) => ({
          comments: prevState.comments.filter(
            (comment) => comment.commentid !== commentid
          ),
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleCommentAdd(text) {
    // Post to /api/v1/comments/?postid=:postid
    // Make note of the method, credentials, headers, and body portion
    const { commentsUrl } = this.state;
    fetch(commentsUrl, {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState((prevState) => ({
          // This is the spread operator
          // All we're really doing is adding the new comment to the end of the list
          comments: [...prevState.comments, data],
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleAddLike() {
    const { lognameLikesThis, postid } = this.state;
    // Don't add a like if already liked or postid wasn't set yet
    if (lognameLikesThis || !postid) return;

    // /api/v1/likes/?postid=<postid>
    fetch(`/api/v1/likes/?postid=${postid}`, {
      method: "POST",
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState((prevState) => ({
          lognameLikesThis: true,
          numLikes: prevState.numLikes + 1,
          likeUrl: data.url,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  handleLikeDelete() {
    const { lognameLikesThis, likeUrl } = this.state;

    // If the post isn't liked already or the likeUrl isn't set then exit.
    if (!lognameLikesThis || !likeUrl) return;

    // Delete the like and update state accordingly
    fetch(likeUrl, {
      method: "DELETE",
      credentials: "same-origin",
    })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);

        this.setState((prevState) => ({
          lognameLikesThis: false,
          numLikes: prevState.numLikes - 1,
          likeUrl: null,
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    // Extract relevant info from state.
    const {
      imgUrl,
      owner,
      ownerImgUrl,
      postShowUrl,
      created,
      ownerShowUrl,
      lognameLikesThis,
      numLikes,
      comments,
    } = this.state;

    if (comments) {
      // When the data arrives in state we can create the comments to render
      this.commentsObj = comments.map((comment) => (
        <Comment
          key={comment.commentid} // This is required by react
          commentid={comment.commentid}
          url={comment.url}
          lognameOwnsThis={comment.lognameOwnsThis}
          owner={comment.owner}
          ownerShowUrl={comment.ownerShowUrl}
          text={comment.text}
          onCommentDelete={this.handleCommentDelete}
        />
      ));
    }
    // Render post image and post owner
    return (
      <div className="post-container">
        <PostTop
          owner={owner}
          ownerUrl={ownerShowUrl}
          ownerImgUrl={ownerImgUrl}
          postUrl={postShowUrl}
          timestamp={created}
        />
        <div className="post-main">
          <img
            src={imgUrl}
            className="post-img"
            alt="post"
            onDoubleClick={this.handleAddLike}
          />
        </div>
        <div className="post-footer">
          <Likes
            lognameLikesThis={lognameLikesThis}
            numLikes={numLikes}
            onUnlike={this.handleLikeDelete}
            onLike={this.handleAddLike}
          />
          {this.commentsObj}
          <CommentInput onCommentAdd={this.handleCommentAdd} />
        </div>
      </div>
    );
  }
}
Post.propTypes = {
  url: PropTypes.string.isRequired,
};
export default Post;
