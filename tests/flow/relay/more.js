/**
 * @format
 * @flow
 */

/*********************************
 * Misc Relay types              *
 *********************************/

declare opaque type FragmentTypeof;
declare opaque type FragmentReference<T: FragmentTypeof>;
declare opaque type BadFragmentReference<T>;
declare opaque type RelayProp;

const React = require('React');

/*********************************
 * RelayModernTyped              *
 *********************************/

// prettier-ignore
type $RelayProps<Props, RelayPropT> = $ObjMap<
  $Diff<Props, {relay: RelayPropT | void}>,
  & (<T: FragmentTypeof, Data: {+__typeof: T}>(Data) => {+__fragments: FragmentReference<T>})
  & (<T: FragmentTypeof, Data: {+__typeof: T}>(?Data) => ?{+__fragments: FragmentReference<T>})
  & (<T: FragmentTypeof, Data: {+__typeof: T}>($ReadOnlyArray<Data>) => $ReadOnlyArray<{+__fragments: FragmentReference<T>}>)
  & (<T: FragmentTypeof, Data: {+__typeof: T}>(?$ReadOnlyArray<Data>) => ?$ReadOnlyArray<{+__fragments: FragmentReference<T>}>)
  & (<T: FragmentTypeof, Data: {+__typeof: T}>($ReadOnlyArray<?Data>) => $ReadOnlyArray<?{+__fragments: FragmentReference<T>}>)
  & (<T: FragmentTypeof, Data: {+__typeof: T}>(?$ReadOnlyArray<?Data>) => ?$ReadOnlyArray<?{+__fragments: FragmentReference<T>}>)
  & (<T>(T) => T),
>;

declare function createFragmentContainer<Props: {}>(
  Component: React.ComponentType<Props>,
  fragments: mixed,
): React.ComponentType<$RelayProps<Props, RelayProp>>;

/*********************************
 * From generated files          *
 *********************************/

declare export opaque type RelayModernTypedFlowtest_user$reference: FragmentTypeof;
export type RelayModernTypedFlowtest_user = {|
  +__typeof: RelayModernTypedFlowtest_user$reference,
  +name: ?string,
|};

declare export opaque type RelayModernTypedFlowtest_users$reference: FragmentTypeof;
export type RelayModernTypedFlowtest_users = $ReadOnlyArray<{|
  +__typeof: RelayModernTypedFlowtest_users$reference,
  +name: ?string,
|}>;

/*********************************
 * RelayModernTyped-flowtest     *
 *********************************/

class SingularTest extends React.Component<{
  string: string,
  onClick: () => void,
  user: RelayModernTypedFlowtest_user,
  nullableUser: ?RelayModernTypedFlowtest_user,
  optionalUser?: RelayModernTypedFlowtest_user,
}> {}
SingularTest = createFragmentContainer(SingularTest, 'fragments go here');

class PluralTest extends React.Component<{
  users: RelayModernTypedFlowtest_users,
  nullableUsers: ?RelayModernTypedFlowtest_users,
  optionalUsers?: RelayModernTypedFlowtest_users,
}> {}
PluralTest = createFragmentContainer(PluralTest, 'fragments go here');

declare var aUserRef: {
  +__fragments: FragmentReference<RelayModernTypedFlowtest_user$reference>,
};

declare var oneOfUsersRef: {
  +__fragments: FragmentReference<RelayModernTypedFlowtest_users$reference>,
};

declare var usersRef: $ReadOnlyArray<{
  +__fragments: FragmentReference<RelayModernTypedFlowtest_users$reference>,
}>;

declare var nonUserRef: {
  +__fragments: BadFragmentReference<{thing: true}>,
};

function cb(): void {}

// Error: can't pass null for user
<SingularTest onClick={cb} string="x" user={null} nullableUser={null} />;

// Error: user is required
<SingularTest onClick={cb} string="x" nullableUser={null} />;

// Error: can't pass non-user ref for user
<SingularTest onClick={cb} string="x" user={nonUserRef} nullableUser={null} />;

// OK
<SingularTest onClick={cb} string="x" user={aUserRef} nullableUser={null} />;

// OK
<SingularTest
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={aUserRef}
/>;

// OK
<SingularTest
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={null}
  optionalUser={aUserRef}
/>;

// Error: optional, not nullable!
<SingularTest
  onClick={cb}
  string="x"
  user={aUserRef}
  nullableUser={null}
  optionalUser={null}
/>;

// OK
declare var aComplexUserRef: {
  __fragments: FragmentReference<{thing1: true}> &
    FragmentReference<RelayModernTypedFlowtest_user$reference> &
    FragmentReference<{thing2: true}>,
};
<SingularTest
  string="x"
  onClick={cb}
  user={aComplexUserRef}
  nullableUser={aComplexUserRef}
  optionalUser={aComplexUserRef}
/>;

// Error: can't pass null for user
<PluralTest users={null} nullableUsers={null} />;

// Error: users is required
<PluralTest nullableUsers={null} />;

// Error: can't pass non-user refs for user
<PluralTest users={[nonUserRef]} nullableUsers={null} />;

// OK
<PluralTest users={usersRef} nullableUsers={null} />;

// OK
<PluralTest
  users={([oneOfUsersRef]: Array<typeof oneOfUsersRef>)}
  nullableUsers={null}
/>;

// OK
<PluralTest users={[oneOfUsersRef].map(x => x)} nullableUsers={null} />;

// OK
<PluralTest users={[oneOfUsersRef]} nullableUsers={null} />;

// OK
<PluralTest users={usersRef} nullableUsers={[oneOfUsersRef]} />;

// OK
<PluralTest users={usersRef} nullableUsers={null} optionalUsers={usersRef} />;

// Error: optional, not nullable!
<PluralTest users={usersRef} nullableUsers={null} optionalUsers={null} />;

// Error: `onClick` prop is not a function
<SingularTest onClick={'cb'} string="x" user={aUserRef} nullableUser={null} />;

// Error: `string` prop is not a string
<SingularTest onClick={cb} string={1} user={aUserRef} nullableUser={null} />;
