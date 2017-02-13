function f() {
  if (position)
    return {name: pair};
  else
    return {name: pair.substring(0, position), value: pair.substring(position + 1)};
}

function f() {
  if (position) return { name: pair };
  else return {
      name: pair.substring(0, position),
      value: pair.substring(position + 1)
    };
}

function f() {
  if (position)
    return { name: pair };
  else
    return {
      name: pair.substring(0, position),
      value: pair.substring(position + 1)
    };
}

function render() {
  return (
    <View>
      <Image
        onProgress={(e) => this.setState({progress: Math.round(100 * e.nativeEvent.loaded / e.nativeEvent.total)})}
      />
    </View>
  );
}

function render() {
  return (
    <View>
      <Image
        onProgress={e =>
          this.setState({
            progress: Math.round(
              100 * e.nativeEvent.loaded / e.nativeEvent.total,
            ),
          })}
      />
    </View>
  );
}

function render() {
  return (
    <View>
      <Image
        onProgress={e =>
          this.setState({
            progress: Math.round(
              100 * e.nativeEvent.loaded / e.nativeEvent.total,
            ),
          })}
      />
    </View>
  );
}
