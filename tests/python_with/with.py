with open('tmp/index.html') as f:
    index = f.read()

with open('tmp/index.html'):
    print('great')

with A() as X, B() as Y, C() as Z:
    do_something()