// @flow

/**
 * This test represents a pattern which is commonly used to make tab bars, but
 * this pattern is also used in many other places.
 */

import React from 'react';

class Tab extends React.Component<{}, void> {}
class NotTab extends React.Component<{}, void> {}

type TabBarNode =
  | void
  | null
  | boolean
  | React$Element<typeof Tab>
  | Array<TabBarNode>; // NOTE: This is intentionally `Array<T>` and not
                       // `Iterable<T>` because `strings` are `Iterable<string>`
                       // which is then `Iterable<Iterable<string>>` recursively
                       // making strings valid children when we use
                       // `Iterable<T>`.

class TabBar extends React.Component<{children: TabBarNode}, void> {}

<TabBar />; // Error: `children` is required.

<TabBar><Tab/></TabBar>; // OK: We can have a single tab.
<TabBar><Tab/><Tab/></TabBar>; // OK: We can have two tabs.
<TabBar>  <Tab/><Tab/></TabBar>; // Error: Spaces are strings.
<TabBar><Tab/>  <Tab/></TabBar>; // Error: Spaces are strings.
<TabBar><Tab/><Tab/>  </TabBar>; // Error: Spaces are strings.

// OK: We can have a single tab on multiple lines.
<TabBar>
  <Tab/>
</TabBar>;

// OK: We can have a multiple tabs on multiple lines.
<TabBar>
  <Tab/>
  <Tab/>
  <Tab/>
</TabBar>;

// OK: We can have an array of tabs.
<TabBar>
  {[
    <Tab/>,
    <Tab/>,
    <Tab/>,
  ]}
</TabBar>;

// OK: We can have two arrays of tabs.
<TabBar>
  {[
    <Tab/>,
    <Tab/>,
  ]}
  {[
    <Tab/>,
    <Tab/>,
  ]}
</TabBar>;

<TabBar><NotTab/></TabBar>; // Error: We can only have tab components.
<TabBar><NotTab/><NotTab/></TabBar>; // Error: We can only have tab components.

// Error: Nope, can't sneak a non-tab in there.
<TabBar>
  <Tab/>
  <NotTab/>
  <Tab/>
  <Tab/>
</TabBar>;

// OK: Booleans are allowed in the type.
<TabBar>
  {Math.random() > 0.5 && <Tab/>}
</TabBar>;

// OK: Booleans are allowed in the type.
<TabBar>
  {Math.random() > 0.5 && <Tab/>}
  {Math.random() > 0.5 && <Tab/>}
</TabBar>;
