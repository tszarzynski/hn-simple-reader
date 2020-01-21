import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getMoreStories, getRecentStories } from "../store/storiesSlice";
import Story from "./Story";
import Stories from "./Stories";
import MoreStories from "./MoreStories";
import Error from "./Error";

const List = () => {
  const dispatch = useDispatch();
  const { stored, isFetching, error } = useSelector(state => state.stories);

  // fetch on scroll
  useEffect(() => {
    function handleScroll() {
      if (
        isFetching ||
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight * 0.85

      )
        return;
        // get more stories if scrolled to the bottom of the screen
      dispatch(getMoreStories());
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch, isFetching]);

  // initial fetch
  useEffect(() => {
    dispatch(getRecentStories());
  }, [dispatch]);

  return (
    <Stories>
      {error && <Error errorMsg={error}></Error>}
      {stored.filter(story => story && story.url && !story.dead && !story.deleted).map(story => (
        <Story key={story.id} story={story} />
      ))}
      {isFetching && <MoreStories></MoreStories>}
    </Stories>
  );
};

export default List;
