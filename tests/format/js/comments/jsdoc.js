/** @type {any} */
const x = (
    <div>
        <div />
    </div>
);

/**
 * @type {object}
 */
() => (
    <div>
        sajdfpoiasdjfpoiasdjfpoiasdjfpoiadsjfpaoisdjfapsdiofjapioisadfaskfaspiofjp
    </div>
);

/**
 * @type {object}
 */
function HelloWorld() {
    return (
        <div>
           <span>Test</span>
        </div>
    );
}

/**
 * Trailing double spaces should be preserverd  
 * because it's significant in markdown.
 *
 * Trailing single space should be ignored. 
 *
 * @type {any}
 */
let a;

/***
 * This is not a JSDoc  
 * so trailing double spaces are ignored
 *
 * @type {any}
 */
let b;
