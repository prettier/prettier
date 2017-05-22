function ugly ( {a=1,     b     =   2     }      ) {
  function ugly ( {a=1,     b     =   2     }      ) {
    function ugly ( {a=1,     b     =   2     }      ) {
  	  	     `multiline template string
              with <<<PRETTIER_RANGE_START>>>too<<<PRETTIER_RANGE_END>>> much indentation`
      // The [222, 225) range selects "too" above
    }
  }
}
