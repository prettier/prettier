// @flow

// These exist in both user code and node_modules, but user code wins
import ambiguous from 'ambiguous';
(ambiguous: empty)

import sub_ambiguous from 'subdir/ambiguous';
(sub_ambiguous: empty)

// These exist in only user code
import user_code from 'user_code';
(user_code: empty)

import sub_user_code from 'subdir/user_code';
(sub_user_code: empty)

// These exist in only node code
import node_code from 'node_code';
(node_code: empty)

import sub_node_code from 'subdir/node_code';
(sub_node_code: empty)

// These exist nowhere
import nonexistent from 'nonexistent'
import sub_nonexistent from 'subdir/nonexistent'
