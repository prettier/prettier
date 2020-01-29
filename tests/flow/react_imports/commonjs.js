const React = require('react');

(React.Component: Object); // OK
(React.Component: number); // Error
('Hello, world!': React.Node); // OK
({}: React.Node); // Error
(null: React.Missing); // Error
