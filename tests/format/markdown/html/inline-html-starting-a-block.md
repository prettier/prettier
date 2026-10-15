Inline HTML that would start an HTML block must not be wrapped onto its own line,
because that ends the paragraph it belongs to.

The quick brown fox jumps over the lazy dog and keeps on running <!-- a comment --> until it stops.

The quick brown fox jumps over the lazy dog and keeps on runningsss <?php echo "x"; ?> until it stops.

The quick brown fox jumps over the lazy dog and keeps on running <!DOCTYPE html> until it stops.

The quick brown fox jumps over the lazy dog and keeps on ru <![CDATA[some data]]> until it stops.

The quick brown fox jumps over the lazy dog and keeps on running <div>a block</div> until it stops.

The quick brown fox jumps over the lazy dog and keeps <script>var x = 1;</script> until it stops.

A closing tag starts a block too, so the quick brown fox keeps on running </div> until it stops.

Condition 7 cannot interrupt a paragraph, so the quick brown fox keeps <span>running</span> onward.

Condition 7 cannot interrupt a paragraph, so the quick brown fox keeps <custom-element>on</custom-element> going.
