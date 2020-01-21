import React from "react";
import styles from "./Error.module.css";

const Error = ({ errorMsg }) => {
  return (
    <div className={styles.container}>
      <p>Ups! Something went wrong!</p>
      <p>{errorMsg}</p>
    </div>
  );
};

export default Error;
