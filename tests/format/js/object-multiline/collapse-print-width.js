// Objects whose content has forced breaks should NOT collapse even with
// objectWrap: collapse, because the object cannot truly fit on one line.

// Property value forces a multi-line break (args too long to fit on one line).
const a = [
  {
    $push: includeFields.reduce(
      (acc, field) => ({ ...acc, [field]: field }),
      {},
    ),
  },
];

// Short simple objects that fit on one line should still collapse.
const b = [
  {
    $set: { [groupByField]: "$_id" },
  },
  {
    $unset: "_id",
  },
];

// Nested object whose collapsed form would exceed print width.
const c = [
  {
    $group: {
      _id: groupByField,
      opinions: {
        $push: includeFields.reduce(
          (acc, field) => ({ ...acc, [field]: field }),
          {},
        ),
      },
    },
  },
];
