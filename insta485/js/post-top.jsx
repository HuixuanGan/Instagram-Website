import React from "react";
import moment from "moment/moment";
import PropTypes from "prop-types";

function PostTop(props) {
  /* Display image and post owner of a single post
   */
  const { owner, ownerImgUrl, postUrl, ownerUrl, timestamp } = props;
  const humanTimestamp = moment.utc(timestamp).fromNow(); // Make the timestamp human readable

  // Render top bar for a post object
  return (
    <div className="post-top">
      <a className="user-link" href={ownerUrl}>
        <img className="post-icon" src={ownerImgUrl} alt={`${owner}'s icon.`} />
        <p className="post-name">{owner}</p>
      </a>
      <p className="timestamp">
        <a href={postUrl}>{humanTimestamp}</a>
      </p>
    </div>
  );
}

PostTop.propTypes = {
  owner: PropTypes.string.isRequired,
  ownerImgUrl: PropTypes.string.isRequired,
  ownerUrl: PropTypes.string.isRequired,
  postUrl: PropTypes.string.isRequired,
  timestamp: PropTypes.string.isRequired,
};

export default PostTop;
