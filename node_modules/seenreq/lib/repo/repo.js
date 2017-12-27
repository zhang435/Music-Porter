function repo(){
    
}

repo.prototype.exists = function(str){
    throw new Error("`exists` not implemented");
}

repo.prototype.dispose = function(){
    throw new Error("`dispose` not implemented");
}

module.exports = repo
