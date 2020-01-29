// @flow
'use strict';

type Dict<K, V> = {
  [key: K]: V
};

function foo<K, V>() {
    const dict: Dict<K, V> = {};
    function bar(): $Values<Dict<K, V>> {
        declare var key : K;
        return dict[key];
    }
}
