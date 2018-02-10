
function a(){
    return new Promise((resolve,reject) => {
        reject({error :1});
    })
}
async function b(){
    var x = await a().catch(error => error);
    console.log(x);
}

b()