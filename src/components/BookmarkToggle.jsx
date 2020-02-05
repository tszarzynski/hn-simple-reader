import React from "react";
import styles from "./BookmarkToggle.module.css";
import { toggleBookmarkPost } from "../store/storiesSlice";
import { useDispatch } from "react-redux";

const BookmarkToggle = ({ story }) => {
    const dispatch = useDispatch();
 
    const {id, bookmarked} = story;
   

    function onToggle() {
        dispatch(toggleBookmarkPost({id}))
    }


  return (
      <label>{bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      <input name="toggle" type="checkbox" checked={ bookmarked || false} onChange={() => onToggle()}></input>
      </label>
  
  );
};

export default BookmarkToggle;
