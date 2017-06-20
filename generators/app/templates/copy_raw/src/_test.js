function foo() {
    console.log(this === undefined ?
        "We're in strict mode! Yeey!" :
        "Not in strict mode. So pathetic :(...");
}

foo();
