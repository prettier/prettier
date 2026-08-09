[Test](http://localhost:8080/test?language=DE&currency=EUR)

<!-- `&…;` sequences must stay literal, otherwise they decode on the next parse -->

[link](/hello?foo&quot\;bar)

![image](/hello?foo&quot\;bar)

[title](/hello "foo&quot\;bar")

[definition]: /hello?foo&quot\;bar

[numeric](/hello?foo&#38\;bar)

[hexadecimal](/hello?foo&#x22\;bar)

[unknown name](/hello?foo&notanentity\;bar)

[angle brackets](</hello world?foo&quot\;bar>)

<https://example.com/?foo&quot\;bar>
