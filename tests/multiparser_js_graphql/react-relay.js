const { graphql } = require("react-relay");
const Relay = require("react-relay/classic");

graphql`
 mutation     MarkReadNotificationMutation(
    $input
    : MarkReadNotificationData!
  )
{ markReadNotification(data: $input ) { notification {seenState} } }
`;

graphql.experimental`
 mutation     MarkReadNotificationMutation(
    $input
    : MarkReadNotificationData!
  )
{ markReadNotification(data: $input ) { notification {seenState} } }
`;

Relay.QL`
 mutation     MarkReadNotificationMutation(
    $input
    : MarkReadNotificationData!
  )
{ markReadNotification(data: $input ) { notification {seenState} } }
`;
