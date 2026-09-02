const value = object.method().anotherMethod(null, { message: "something something something something something" });

const thoughts = updates
  .slice(0, 10)
  .map(thought =>
    thought ? { id: thought.id, value: thought.value, rank: thought.rank, lastUpdated: thought.lastUpdated } : null,
  )
