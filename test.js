



function a(){
    return new Promise((resolve,reject) =>{
        resolve(1);

    })
}


// a().then( val => {
//     return new Promise((resolve,reject) => {
//         console.log("b");
//     })
// })

function c(){
    a()
    .then(ans => {
        return new Promise((resolve,reject)  => {
            if (ans === 1)
                resolve(1);
            reject(2);
        })
    })
    .catch(error => console.log(error));
 
}

c()