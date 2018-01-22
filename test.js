function A(){
    return new Promise((resolve,reject) =>{
        setTimeout(() => {
            reject("A");    
        }, 2000);
        
    })
}

async function B(){
    var x = await A().catch(_ => -1);
    console.log(x);
}

B()