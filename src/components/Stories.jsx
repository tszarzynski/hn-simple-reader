import React from "react";
import styles from "./Stories.module.css";

const Stories = ({ children }) => {
  return <ul className={styles.list}>{children}</ul>;
};

export default Stories;
