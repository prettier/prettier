// @flow

// $WithVersion >=0.0.0
(123: string); // should be suppressed

// $WithVersion >=1000000.0.0
(123: string); // should not be suppressed
