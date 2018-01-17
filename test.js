function foo(ls) {
    return new Promise((resolve,reject) => {
        if(ls === 10)
            resolve(10)
        reject(1)
    })
}

foo(10)
.then((num) => {
    return new Promise((resolve,reject) => {

    }
})
.catch((err) => {
    console.log("error");
})