function foo(x,callback) {
    for(i = 0; i < 10; i ++)
        callback(i);
}

foo(10,(i) => {
    console.log(i);
})

