const React = require('React');

(React.Component: Object); // OK
(React.Component: number); // Error
('Hello, world!': React.Node); // OK
({}: React.Node); // Error
(null: React.Missing); // Error
