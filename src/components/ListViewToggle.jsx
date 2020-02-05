import React from "react";
import styles from "./BookmarkToggle.module.css";
import { toggleListView } from "../store/storiesSlice";
import { useDispatch, useSelector } from "react-redux";

const ListViewToggle = () => {
    const dispatch = useDispatch();
    const { showBookmarked } = useSelector(state => state.stories);
 
    function onToggle() {
        dispatch(toggleListView())
    }

  return (
      <label>{showBookmarked ? 'Show all' : 'Show bookmarked'}
      <input name="listToggle" type="checkbox" checked={ showBookmarked } onChange={() => onToggle()}></input>
      </label>
  
  );
};

export default ListViewToggle;
