function validation() {
    var url = document.getElementById("xiamiUrl").value;
    if (!url.includes("page/2?spm")) {
        alert("Invalid url, it has to be the url of second page of your playlist");
        return false;
    }
    return true;
}