(do {});
(throw error);

(do {}) || fallback;
(throw error) || fallback;

(do {}).message;
(throw error).message;

((do {}), (throw error), other);

(do {}) + 1;
(throw error) + 1;

1 + do {};
1 + throw error;

() => do {};
() => throw error;

if (condition) (do {});
if (condition) (throw error);

for (;;) (do {});
for (;;) (throw error);

label: (do {});
label: (throw error);

value = do {};
value = throw error;
