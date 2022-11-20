import React from "react";
import PropTypes from "prop-types";

class Likes extends React.Component {
  /* Display like count and like/unlike button
   */
  constructor(props) {
    // Initialize mutable state
    super(props);

    this.handlerLikeButtonStatus = this.handlerLikeButtonStatus.bind(this);
  }

  // Call unlike if currently liked
  // Call like if currently unliked
  handlerLikeButtonStatus() {
    const { lognameLikesThis, onUnlike, onLike } = this.props;
    if (lognameLikesThis) {
      onUnlike();
    } else {
      onLike();
    }
  }

  render() {
    const { lognameLikesThis, numLikes } = this.props;

    const buttonText = lognameLikesThis ? "unlike" : "like";

    const likeText = numLikes !== 1 ? "likes" : "like";

    // Render top bar for a post object
    return (
      <div className="likes">
        <button
          className="like-unlike-button"
          onClick={this.handlerLikeButtonStatus}
          type="button"
        >
          {buttonText}
        </button>
        <p className="likeCount">
          {numLikes} {likeText}
        </p>
      </div>
    );
  }
}
Likes.propTypes = {
  lognameLikesThis: PropTypes.bool.isRequired,
  numLikes: PropTypes.number.isRequired,
  onUnlike: PropTypes.func.isRequired,
  onLike: PropTypes.func.isRequired,
};
export default Likes;
