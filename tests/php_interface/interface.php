<?php

interface testInterface {
    public function setVariable($test);
}

interface test2 extends testInterface {
  public function other($hi);
}