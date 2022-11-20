import React from "react";
import PropTypes from "prop-types";

class Comment extends React.Component {
  /* Display a singular comment
   */
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  // Call the delete comment function for the comment id of the comment
  handleClick() {
    const { onCommentDelete, url, commentid } = this.props;
    onCommentDelete(url, commentid);
  }

  render() {
    // Render the singular comment with a comment delete button
    const { lognameOwnsThis, owner, ownerShowUrl, text } = this.props;

    const deleteButton = lognameOwnsThis ? (
      <button
        className="delete-comment-button"
        onClick={this.handleClick}
        type="button"
      >
        Delete Comment
      </button>
    ) : null;

    return (
      <div className="comment-box">
        <p className="comment">
          <a className="comment-name" href={ownerShowUrl}>
            {owner}
          </a>
        </p>
        <p className="comment">{text}</p>
        {deleteButton}
      </div>
    );
  }
}
Comment.propTypes = {
  commentid: PropTypes.number.isRequired,
  url: PropTypes.string.isRequired,
  onCommentDelete: PropTypes.func.isRequired,
  lognameOwnsThis: PropTypes.bool.isRequired,
  owner: PropTypes.string.isRequired,
  ownerShowUrl: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};
export default Comment;
