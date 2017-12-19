<?php
class Foo {
  // variable doc
  public $test;
  public $other = 1;

  /**
   * This is a function
   */
  private function hi($input) {
    return $input . $this->test;
  }

  public function reallyReallyReallyReallyReallyReallyReallyLongMethodName($input, $otherInput = 1) {
    return true;
  }
}
