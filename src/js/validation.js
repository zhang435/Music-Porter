function xiamiValidation() {
    /**
     * validator for url from user
     */
    document.getElementById('xiamiUrl').disabled = true;
    var url = document.getElementById("xiamiUrl").value;
    var reg = /^https:\/\/www.xiami.com\/space\/lib-song\/u\/\d+\/page\/\d\?spm=\S+$/g;
    if (url.match(reg) == null) {
        alert("Invalid url, it has to be the url of second page of your playlist");
        document.getElementById('xiamiUrl').disabled = false;
        return false;
    }
    return true;
}

function neteaseValidation() {
    document.getElementById('neteaseUrl').disabled = true;
    var url = document.getElementById("neteaseUrl").value;
    var reg = /^https:\/\/music.163.com\/#\/playlist\?id=\d+$/g;


    if (url.match(reg) == null) {
        alert("Invalid url, Please check the url");
        document.getElementById('neteaseUrl').disabled = false;
        return false;
    };
    return true;
}
// var url = "https://www.xiami.com/space/lib-song/u/32935150/page/2?spm=a1z1s.6928797.1561534521.347.5oNhml"
// var reg = /^https:\/\/www.xiami.com\/space\/lib-song\/u\/\d+\/page\/\d\?spm=\S+$/g;
// console.log(url.match(reg))


// url = "https://music.163.com/#/playlist?id=501341874"
// var reg = /^https:\/\/music.163.com\/#\/playlist\?id=\d+$/g;
// console.log(url.match(reg))