<View
  style={
    {
      someVeryLongStyle1: "true",
      someVeryLongStyle2: "true",
      someVeryLongStyle3: "true",
      someVeryLongStyle4: "true"
    }
  }
/>;

<View
  style={
    [
      {
        someVeryLongStyle1: "true",
        someVeryLongStyle2: "true",
        someVeryLongStyle3: "true",
        someVeryLongStyle4: "true"
      }
    ]
  }
/>;

<Something>
  {() => (
    <SomethingElse>
      <span />
    </SomethingElse>
  )}
</Something>;

<Something>
  {items.map(item => (
    <SomethingElse>
      <span />
    </SomethingElse>
  ))}
</Something>;

<Something>
  {function() {
    return (
      <SomethingElse>
        <span />
      </SomethingElse>
    );
  }}
</Something>;

<RadioListItem
  key={option}
  imageSource={this.props.veryBigItemImageSourceFunc &&
    this.props.veryBigItemImageSourceFunc(option)}
  imageSize={this.props.veryBigItemImageSize}
  imageView={this.props.veryBigItemImageViewFunc &&
    this.props.veryBigItemImageViewFunc(option)}
  heading={this.props.displayTextFunc(option)}
  value={option}
/>;

<ParentComponent prop={
  <Child>
    test
  </Child>
}/>;
