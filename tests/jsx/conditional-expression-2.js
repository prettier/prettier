foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
null

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
undefined

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
0

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
function() {}

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
() => {}

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
''

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
bar

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
/./g

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span> :
<span>a short jsx</span>

foo ? <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>:
<span>another loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

// -- swap

foo ? null
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? undefined
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? 0
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? function() {}
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? () => {}
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? ''
: <span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? bar
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? /./g
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? <span>a short jsx</span>
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

foo ? <span>another loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>
:<span>loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong jsx</span>

