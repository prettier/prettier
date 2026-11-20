import Card from "./Card.jsx";
import CardTitle from "./CardTitle.jsx";
import styles from "./LanguageItem.module.css";
import Markdown from "./Markdown.jsx";

/**
 *
 * @param {object} props
 * @param {string} props.name
 * @param {string?} props.nameLink
 * @param {string} props.image
 * @param {string[]} props.variants
 */
export default function LanguageItem({ name, nameLink, image, variants }) {
  return (
    <Card as="li" className={styles.languageItem}>
      <div className={styles.header}>
        <img
          src={image}
          className={styles.image}
          alt=""
          width={40}
          height={40}
          loading="lazy"
        />
        <CardTitle>{nameLink ? <a href={nameLink}>{name}</a> : name}</CardTitle>
      </div>
      {variants.length > 0 && (
        <ul className={styles.variants}>
          {variants.map((variant) => (
            <li key={variant}>
              <Markdown inline>{variant}</Markdown>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
