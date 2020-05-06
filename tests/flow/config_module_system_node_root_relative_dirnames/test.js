// @flow

/**
 * 1) All "ambiguous" code exists in first/, second/ and node_modules/.
 *    first/ wins
 * 2) All "user_code" code exists in first/ and second/
 *    first/ wins
 * 3) All "second_only" code exists only in second/
 *    second/ wins
 * 4) All "node_code" code exists in only node_modules/
 *    node_modules/ wins
 */

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

// These exist in only user code, and only in second/
import second_only_user_code from 'second_only_user_code';
(second_only_user_code: empty)

import sub_second_only_user_code from 'subdir/second_only_user_code';
(sub_second_only_user_code: empty)

// These exist in only node code
import node_code from 'node_code';
(node_code: empty)

import sub_node_code from 'subdir/node_code';
(sub_node_code: empty)

// These exist nowhere
import nonexistent from 'nonexistent'
import sub_nonexistent from 'subdir/nonexistent'
