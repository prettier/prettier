const { graphql } = require("react-relay");

graphql`
 mutation     MarkReadNotificationMutation(
    $input
    : MarkReadNotificationData!
  )
{ markReadNotification(data: $input ) { notification {seenState} } }
`;
