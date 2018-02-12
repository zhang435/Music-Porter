
function a(){
    return new Promise((resolve,reject) => {
        resolve(1);
    })
}
async function b(){
    arr = []
    for(var i =   0 ; i < 10;i++){
        var x  = await a();
        arr.push(x);
        console.log(arr);
    }
    
}

b()