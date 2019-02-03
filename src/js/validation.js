function xiamiValidation() {
    /**
     * validator for url from user
     */

    var url = document.getElementById("xiamiUrl").value;
    var reg = /https:\/\/www.xiami.com\/space\/lib-song\/u\/\d+\/page\/\d\?spm=\S+/g;
    if (url.match(reg) == null) {
        alert("Invalid url, it has to be the url of second page of your playlist");
        return false;
    }
    return true;
}

function neteaseValidation() {
    var url = document.getElementById("neteaseUrl").value;
    var reg = /https:\/\/music.163.com\/playlist\?id=\d+/g;


    if (url.match(reg) == null) {
        alert("Invalid url, Please check the url");
        return false;
    };
    return true;
}
var url = "https://www.xiami.com/s/18313828/page/2?spm=a1z1s.6928797.1561534521.342.HmvvYd"
var reg = /https:\/\/www.xiami.com\/space\/lib-song\/u\/\d+\/page\/\d\?spm=\S+/g;
console.log(url.match(reg) == null)