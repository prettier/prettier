(do {});
(async do {});
(throw error);

(do {}) || fallback;
(async do {}) || fallback;
(throw error) || fallback;

(do {}).message;
(async do {}).message;
(throw error).message;

((do {}), (async do {}), (throw error), other);

(do {}) + 1;
(async do {}) + 1;
(throw error) + 1;

1 + do {};
1 + async do {};
1 + throw error;

() => do {};
() => async do {};
() => throw error;

if (condition) (do {});
if (condition) (async do {});
if (condition) (throw error);

for (;;) (do {});
for (;;) (async do {});
for (;;) (throw error);

label: (do {});
label: (async do {});
label: (throw error);

value = do {};
value = async do {};
value = throw error;
