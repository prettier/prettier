## plain js block

```js    
console.log    (    "hello world"    );
```

## js block with meta

```js {cmd=node .line-numbers}
console.log    (    "hello world"    );
```

## js block with meta but no space (the language should not be detected)

```js{cmd=node .line-numbers}
console.log    (    "hello world"    );
```

## js block with meta and extra spaces (only the first set of spaces should be changed)

```js    cmd=node    something="a    b"
console.log    (    "hello world"    );
```
