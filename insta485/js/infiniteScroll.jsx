import React from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import Post from "./post";

class InfiniteScrollBox extends React.Component {
  /* Display posts infinitely
   */
  constructor(props) {
    super(props);

    this.fetchMorePosts = this.fetchMorePosts.bind(this);

    this.state = {
      items: [],
      url: "/api/v1/posts/",
      hasMore: true,
    };
  }

  componentDidMount() {
    this.fetchMorePosts();
  }

  fetchMorePosts() {
    const { url } = this.state;
    fetch(url, { credentials: "same-origin" })
      .then((response) => {
        if (!response.ok) throw Error(response.statusText);
        return response.json();
      })
      .then((data) => {
        this.setState((prevState) => ({
          items: prevState.items.concat(data.results),
          url: data.next,
          hasMore: data.next !== "",
        }));
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    const { items, hasMore } = this.state;

    return (
      <main className="home">
        <InfiniteScroll
          dataLength={items.length}
          next={this.fetchMorePosts}
          hasMore={hasMore}
          loader={<h4>Loading...</h4>}
        >
          {items.map((result) => (
            <Post url={result.url} key={result.postid} />
          ))}
        </InfiniteScroll>
      </main>
    );
  }
}
export default InfiniteScrollBox;
