import React from 'React';

(React.Component: Object); // OK
(React.Component: number); // Error
('Hello, world!': React.Node); // Error: Not in default export.
({}: React.Node); // Error: Not in default export.
(null: React.Missing); // Error: Not in default export.
