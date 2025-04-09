type a= {
    // prettier-ignore
    [A in B]: C  |  D
  }

type a= {
    [
      // prettier-ignore
      A in B
    ]: C  |  D
  }

type a= {
    [
      A in
      // prettier-ignore
      B
    ]: C  |  D
  }

type a= {
    [A in B]:
      // prettier-ignore
      C  |  D
  }

type a= {
    [
      /* prettier-ignore */
      A in B
    ]: C  |  D
  }

type a= {
    [
      A in
      /* prettier-ignore */
      B
    ]: C  |  D
  }

type a= {
    [A in B]:
      /* prettier-ignore */
      C  |  D
  }


type a= {
    /* prettier-ignore */ [A in B]: C  |  D
  }

type a= {
    [/* prettier-ignore */ A in B ]: C  |  D
  }

type a= {
    [A in /* prettier-ignore */ B]: C  |  D
  }

type a= {
    [A in B]: /* prettier-ignore */ C  |  D
  }

type a= {
    /* prettier-ignore */
    [A in B]: C  |  D
  }
