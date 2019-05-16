function xiamiValidation() {
    /**
     * validator for url from user
     */

    var url = document.getElementById("xiamiUrl").value;
    var reg = /https:\/\/(www)?(emumo)?.xiami.com\/space\/lib-song\/u\/\d+\/page\/\d\?spm=\S+$/g;
    if (url.match(reg) == null) {
        alert("Invalid url, it has to be the url of second page of your playlist");
        return false;
    }
    return true;
}

function neteaseValidation() {
    var url = document.getElementById("neteaseUrl").value;
    var reg = /^https:\/\/music.163.com\/#\/playlist\?id=\d+(&userid=\d+)?$/g;


    if (url.match(reg) == null) {
        alert("Invalid url, Please check the url");
        return false;
    };
    return true;
}

function test() {
    var url = "https://www.xiami.com/space/lib-song/u/32935150/page/2?spm=a1z1s.6928797.1561534521.347.5oNhml"
    var reg = /https:\/\/(www)?(emumo)?.xiami.com\/space\/lib-song\/u\/\d+\/page\/\d\?spm=\S+$/g;
    console.log(url.match(reg) != null)
    var url = "https://emumo.xiami.com/space/lib-song/u/34340923/page/2?spm=a1z1s.6928797.1561534521.329.SCuFko";
    console.log(url.match(reg) != null)


    url = "https://music.163.com/#/playlist?id=501341874"
    var reg = /^https:\/\/music.163.com\/#\/playlist\?id=\d+(&userid=\d+)?$/g;
    console.log(url.match(reg) != null)

    url = "https://music.163.com/#/playlist?id=37560357&userid=43051609"
    console.log(url.match(reg) != null)

    url = "https://music.163.com/#/playlist?id=37560357&userid=43051609&sdf"
    console.log(url.match(reg) == null)
}

test()