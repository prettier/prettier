graphql(schema, `
mutation     MarkReadNotificationMutation(
    $input
    : MarkReadNotificationData!
  )
{ markReadNotification(data: $input ) { notification {seenState} } }`)

gql(schema, `
mutation     MarkReadNotificationMutation(
    $input
    : MarkReadNotificationData!
  )
{ markReadNotification(data: $input ) { notification {seenState} } }`)
