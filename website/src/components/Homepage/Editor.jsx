import Card from "./Card.jsx";
import CardTitle from "./CardTitle.jsx";
import styles from "./Editor.module.css";
import Markdown from "./Markdown.jsx";

/**
 *
 * @param {object} props
 * @param {string} props.content
 * @param {string} props.image
 * @param {string} props.name
 */
export default function Editor({ content = "", image, name }) {
  return (
    <Card as="li" className={styles.editor}>
      <img
        src={image}
        className={styles.image}
        alt=""
        width={48}
        height={48}
        loading="lazy"
      />
      <div>
        <CardTitle>{name}</CardTitle>
        <Markdown className={styles.links}>
          {content.replaceAll("\n", "  \n")}
        </Markdown>
      </div>
    </Card>
  );
}
