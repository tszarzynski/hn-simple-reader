import React from "react";
import { extractDomain, timeSince, isValidUrl } from "../utils";
import styles from "./Story.module.css";

const Story = ({ story }) => {
  return (
    <li className={styles.item}>
      <div className={styles.container}>
        <div className={styles.header}>
          <a
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <h2 className={styles.title}>{story.title}</h2>
            {isValidUrl(story.url) && (
              <h3 className={styles.domain}>({extractDomain(story.url)})</h3>
            )}
          </a>
        </div>
        <div className={styles.details}>
          <span className={styles.time}>{timeSince(story.time)} ago</span>
          <span className={styles.author}>by {story.by}</span>
          <span> - </span>
          <span className={styles.score}>
            {story.score} {story.score > 1 ? "points" : "point"}
          </span>
          <span> - </span>
          <span className={styles.descendants}>
            {story.descendants}{" "}
            {story.descendants > 1 || story.descendants === 0
              ? "comments"
              : "comment"}
          </span>
        </div>
      </div>
    </li>
  );
};

export default React.memo(Story);
