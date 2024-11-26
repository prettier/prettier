class A {
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


  @decorator
   /* comment */
  public async method() {
  }

  @decorator
   /* comment */
  static async method() {
  }

  @decorator
   /* comment */
  protected async method() {
  }

  @decorator
   /* comment */
  protected async method() {
  }

   /* comment */
  abstract method():void;

}

