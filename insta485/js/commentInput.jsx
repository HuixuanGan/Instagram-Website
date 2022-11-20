import React from "react";
import PropTypes from "prop-types";

class CommentInput extends React.Component {
  /* Display the comment add bar
   */
  constructor(props) {
    // Initialize mutable state
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      value: "",
    };
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    // Pass the text to have the comment created and added to the post
    const { onCommentAdd } = this.props;
    const { value } = this.state;
    onCommentAdd(value);
    this.setState({ value: "" });
    event.preventDefault();
  }

  render() {
    const { value } = this.state;

    // Render comment input form
    return (
      <div className="comment-input">
        <form className="comment-form" onSubmit={this.handleSubmit}>
          <input type="text" value={value} onChange={this.handleChange} />
        </form>
      </div>
    );
  }
}
CommentInput.propTypes = {
  onCommentAdd: PropTypes.func.isRequired,
};
export default CommentInput;
