type MutableAndRequired<T> = {
    -readonly [P in keyof T]-?: T[P]
}
