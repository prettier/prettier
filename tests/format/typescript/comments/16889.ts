class myClass {
  @decorator
  /**
   * The method description
   *
  */
  async method() {
  }

  @decorator/**
   * The method description
   *
  */
  async method() {
  }

  @decorator/**
   * The method description
   *
  */ async method() {
  }

  @decorator
  async /* comment */ method() {
  }

  @decorator /* comment */ async method() {
  }

  @decorator
  // line comment
  async method() {
  }

  @decorator // line comment
  async method() {
  }
}

