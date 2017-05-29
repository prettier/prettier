a {
  box-shadow: inset 0 $size $size (-$size) black;
  width: calc(100% - (#{var(--g-spacing)} - #{$iframe-x-padding}) * 2);
  padding-right: (100% * $info-width / (1 - $image-width));
  padding-bottom:
    (
      100% *
      $image-height / ($image-width-responsive + $image-margin-responsive * 2)
    );
}
