// Wrapping text
x =
  <div>
    Some text that would need to wrap on to a new line in order to display correctly and nicely
  </div>

// Wrapping tags
x =
  <div>
    <first>f</first> <first>f</first> <first>f</first> <first>f</first> <first>f</first> <first>f</first>
  </div>

// Wrapping tags
x =
  <div>
    <first>f</first><first>f</first><first>f</first><first>f</first><first>f</first><first>f</first>
  </div>

// Wrapping tags
x =
  <div>
    <a /><b /><c />
    <first>aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa</first> <first>f</first>
  </div>

// Wrapping tags
x =
  <div>
    <sadashdkjahsdkjhaskjdhaksjdhkashdkashdkasjhdkajshdkashdkashd /> <first>f</first>
  </div>

x =
  <div>
    before<div>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur at mollis lorem.</div>after
  </div>

x =
  <div>
    before{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}{stuff}{stuff}after{stuff}after
  </div>

x =
  <div>
    before {stuff} after {stuff} after {stuff} after {stuff} after {stuff} after {stuff}  {stuff}  {stuff} after {stuff} after
  </div>

x =
  <div>
    Please state your <b>name</b> and <b>occupation</b> for the board of <b>school</b> directors.
  </div>

function DiffOverview(props) {
  const { source, target, since } = props;
  return (
    <div>
      <div className="alert alert-info">
        <p>
          This diff overview is computed against the current list of records in
          this collection and the list it contained on <b>{humanDate(since)}</b>.
        </p>
        <p>
          <b>Note:</b> <code>last_modified</code> and <code>schema</code> record metadata
          are omitted for easier review.
        </p>
      </div>
      <Diff source={source} target={target} />
    </div>
  );
}

x = <font size={-3}><i>Starting at minute {graphActivity.startTime}, running for {graphActivity.length} to minute {graphActivity.startTime + graphActivity.length}</i></font>

x =
  <div>
    First second third
    <div attr="a very long string attribute that will overflow because it is very long">Something</div>
  </div>

x =
  <div>
    <div>
      First
    </div>
    Second
    <div>
      Third
    </div>
  </div>

x =
  <div>
    First <div>
      Second
    </div> Third
  </div>

leading_whitespace =
  <div> First Second Third Fourth Fifth Sixth Seventh Eighth Ninth Tenth Eleventh Twelfth Thirteenth Fourteenth</div>

trailing_whitespace =
  <div>First Second Third Fourth Fifth Sixth Seventh Eighth Ninth Tenth Eleventh Twelfth Thirteenth Fourteenth </div>

no_leading_or_trailing_whitespace =
  <div>First Second Third Fourth Fifth Sixth Seventh Eighth Ninth Tenth Eleventh Twelfth Thirteenth Fourteenth</div>

facebook_translation_leave_text_around_tag =
  <div>
    <span>
      First
    </span>,
    (<span>
      Second
    </span>)
  </div>

this_really_should_split_across_lines =
  <div>
    before{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after{stuff}after
  </div>

unstable_before =
  <div className="yourScore">
    Your score: <span className="score">{`${mini.crosstable.users[sessionUserId]} - ${mini.crosstable.users[user.id]}`}</span>
  </div>

unstable_after_first_run = (
  <div className="yourScore">
    Your score:{" "}
    <span className="score">{`${mini.crosstable.users[sessionUserId]} - ${mini
      .crosstable.users[user.id]}`}</span>
  </div>
);

solitary_whitespace =
  <div first="first" second="second" third="third" fourth="fourth" fifth="fifth" sixth="sixth"> </div>

jsx_whitespace_on_newline =
  <div>
    <div>
      First
    </div> <div>
      Second
    </div> <div>
      Third
    </div>
  </div>

jsx_around_multiline_element =
  <div>Before <div>{"Enough text to make this element wrap on to multiple lines when formatting"}</div> After</div>

jsx_around_multiline_element_second_pass = (
  <div>
    Before{" "}
    <div>
      {
        "Enough text to make this element wrap on to multiple lines when formatting"
      }
    </div>{" "}
    After
  </div>
);

convert_space_expressions =
  <div>{" "}</div>

x =
  <div>
    <first />
    <second />
    <third />
    <fourth />
    <fifth />
    <sixth />
  </div>

const Abc = () => {
  return (
    <div>
      Please state your
      {" "}
      <b>name</b>
      {" "}
      and
      {" "}
      <b>occupation</b>
      {" "}
      for the board of directors.
    </div>
  );
};

x = <div id="moo">Some stuff here</div>

headers_and_paragraphs = (
  <div>
    <h2>First</h2>
    <p>The first paragraph.</p>

    <h2>Second</h2>
    <p>The second paragraph.</p>
  </div>
);

no_text_one_tag_per_line =
  <div>
    <first /><second />
  </div>

with_text_fill_line =
  <div>
    Text <first /><second />
  </div>

line_after_br =
  <div>
    Text<br />
    More text <br />
    And more<br />
  </div>

line_after_br_2 = <div>A<br />B<br />C</div>

br_followed_by_whitespace = <div><br /> text</div>

dont_preserve_blank_lines_when_jsx_contains_text =
  <div>

    <div>First</div>

    Second

  </div>

multiple_expressions =
  <div>
    {header}
    {body}
    {footer}
  </div>

single_expression_child_tags =
  <div>
    You currently have <strong>{dashboardStr}</strong> and <strong>{userStr}</strong>
  </div>


