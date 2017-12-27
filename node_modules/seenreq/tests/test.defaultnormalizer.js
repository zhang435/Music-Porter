var assert = require("assert")
var seenreq = require("../lib/seenreq.js")
var seen = new seenreq();

assert.equal("GET http://www.google.com/\r\n",seen.normalize("http://www.GOOGLE.com"));

assert.equal("GET https://www.google.com.hk/?ei=qg5QVYyVBcrC8Afz6ICoDw&gfe_rd=cr&gws_rd=ssl&q=how%20to%20test%20url%20duplicate&safe=strict\r\n",seen.normalize("https://www.google.com.hk/?gfe_rd=cr&ei=qg5QVYyVBcrC8Afz6ICoDw&gws_rd=ssl&safe=strict&q=how+to+test+url+duplicate"));

var opt = {
    uri:"http://www.google.com"
};

assert.equal("GET http://www.google.com/\r\n",seen.normalize(opt));

opt = {
    url:"http://www.GOOGLE.com"
}

assert.equal("GET http://www.google.com/\r\n",seen.normalize(opt));

assert.equal("GET http://stackoverflow.com/questions/\r\n",seen.normalize("http://stackoverflow.com/questions/"));

opt = {
    uri:"http://www.GOOGLE.com",
    qs:{
	q:"How to do request seen test"
    }
}

assert.equal("GET http://www.google.com/?q=How%20to%20do%20request%20seen%20test\r\n",seen.normalize(opt));

opt = {
    method:'GET',
    uri:"http://www.google.com",
    qs:{
	q:"How to do request seen test",
	gfe_rd:'cr',
	ei:'qg5QVYyVBcrC8Afz6ICoDw',
	gws_rd:'ssl',
	safe:'strict'
    }
}

assert.equal("GET http://www.google.com/?ei=qg5QVYyVBcrC8Afz6ICoDw&gfe_rd=cr&gws_rd=ssl&q=How%20to%20do%20request%20seen%20test&safe=strict\r\n",seen.normalize(opt));

var opt_form = {
    method:"POST",
    uri:"https://github.com/logout",
    form:{
	utf8:'✓',
	authenticity_token:'R1d7nfjekS+a5/h8+L2DrSy02gt7GCxRLFla5JBjwMrYQRDRrGPaTFz/tHTQKaqYfMeZIYlYMhfBrnMwDDz+cg=='
    }
}

assert.equal("POST https://github.com/logout\r\nauthenticity_token=R1d7nfjekS+a5/h8+L2DrSy02gt7GCxRLFla5JBjwMrYQRDRrGPaTFz/tHTQKaqYfMeZIYlYMhfBrnMwDDz+cg==&utf8=✓",seen.normalize(opt_form));

opt = {
    method:"POST",
    uri:"https://github.com/logout",
    form:"utf8=✓&authenticity_token=R1d7nfjekS+a5/h8+L2DrSy02gt7GCxRLFla5JBjwMrYQRDRrGPaTFz/tHTQKaqYfMeZIYlYMhfBrnMwDDz+cg=="
}

assert.equal(seen.normalize(opt_form),seen.normalize(opt));

var opt_body = {
    method:"POST",
    uri:"https://github.com/logout",
    body:{
	utf8:'✓',
	authenticity_token:'R1d7nfjekS+a5/h8+L2DrSy02gt7GCxRLFla5JBjwMrYQRDRrGPaTFz/tHTQKaqYfMeZIYlYMhfBrnMwDDz+cg=='
    },
    json:true
}

assert.equal('POST https://github.com/logout\r\n{"authenticity_token":"R1d7nfjekS+a5/h8+L2DrSy02gt7GCxRLFla5JBjwMrYQRDRrGPaTFz/tHTQKaqYfMeZIYlYMhfBrnMwDDz+cg==","utf8":"✓"}',seen.normalize(opt_body));

assert.equal("GET http://www.google.com/\r\n",seen.normalize("http:\/\/www.GOOGLE.com/"));
//assert.equal("GET http://www.google.com/\r\n",seen.normalize("http://www.GOOGLE.com#abc=124"));

seen = new seenreq({ removeKeys: ["ts", "timestamp", "utm","uts","ut","spm","acm","scm","rn","from","type"]});
assert.equal("GET https://shouji.tmall.com/\r\n",seen.normalize("https://shouji.tmall.com/?spm=875.7931836/B.category2016015.1.ypfT08&acm=lb-zebra-148799-667863.1003.8.708026&scm=1003.8.lb-zebra-148799-667863.ITEM_14561662186585_708026"));
assert.equal("GET https://list.tmall.com/search_product.htm\r\n",seen.normalize("https://list.tmall.com/search_product.htm?spm=a222t.8063993.4308149192.7.9g9NCJ&acm=lb-zebra-164656-978568.1003.8.845089&from=.list.pc_1_searchbutton&type=p&scm=1003.8.lb-zebra-164656-978568.ITEM_14629998461062_845089"));
assert.equal("GET https://list.tmall.com/search_shopitem.htm?cat=50024400&jumpto=3&sort=s&totalPage=4&user_id=2616970884\r\n",seen.normalize("https://list.tmall.com/search_shopitem.htm?cat=50024400&user_id=2616970884&totalPage=4&sort=s&jumpto=3"));
assert.equal("GET https://detail.tmall.com/item.htm?areaId=110100&cat_id=50024400&id=536083939353&is_b=1&q=\r\n",seen.normalize("https://detail.tmall.com/item.htm?spm=a220m.1000862.1000725.6.D94Mbt&id=536083939353&areaId=110100&is_b=1&cat_id=50024400&q=&rn=63b2257700ef5e09a7e5d293391d3ef2"));


assert.equal("GET http://bj.lianjia.com/zufang/chaoyang/bd2/a.html?a=2&bbc=1\r\n",seen.normalize("http://bj.lianjia.com/zufang/chaoyang/bd2/a.html?bbc=1&a=2#opt"));
assert.equal("GET https://list.tmall.com/search_product.htm?active=1&cat=50024400&industryCatId=50024400&smAreaId=130729&sort=s&style=w\r\n", seen.normalize("https://list.tmall.com/search_product.htm?cat=50024400&sort=s&style=w&active=1&industryCatId=50024400&smAreaId=130729#J_Filter"));
assert.equal("GET https://list.tmall.com/search_product.htm?active=1&cat=50024400&industryCatId=50024400&smAreaId=130729&sort=s&style=w#J_Filter\r\n", seen.normalize("https://list.tmall.com/search_product.htm?cat=50024400&sort=s&style=w&active=1&industryCatId=50024400&smAreaId=130729#J_Filter",{stripFragment:false}));
