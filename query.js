const fetch = require("node-fetch");
const cheerio = require("cheerio");
const formData = require("form-data");

async function saucenao(url){
  var formdata = mkfd(url);
  let body = await fetch('https://saucenao.com/search.php',
  {
    method: 'POST',
    headers: formdata.getHeaders(),
    body: formdata,
    redirect: 'follow'
  })
  .then(res => res.text());
  let $ = cheerio.load(body);
  return $("div[class='result']").length == 1 ?
      null : $(".result .resulttable .resulttablecontent .resultcontentcolumn").find("a").eq(0).attr("href");

}

async function ascii2d(url){
  var formdata = mkfd(url);
  let body = await fetch('https://ascii2d.net/search/url/'+url)
  .then(res => res.text());
  let $ = cheerio.load(body);
  var i = ($("div.detail-box.gray-link").eq(0).find("a").eq(0).attr("href") == null) ? 1 : 0;
  if ($("div.detail-box.gray-link").eq(0+i).find("small").text() == "twitter") return $("div.detail-box.gray-link").eq(0+i).find("a").eq(0).attr("href");
  else if ($("div.detail-box.gray-link").eq(1+i).find("small").text() == "twitter") return $("div.detail-box.gray-link").eq(1+i).find("a").eq(0).attr("href");
  else return $("div.detail-box.gray-link").eq(0+i).find("a").eq(0).attr("href");

}

function mkfd(url) {
  let formdata = new formData();
  formdata.append("Content-Type", "application/octect-stream");
  formdata.append("url", url);
  formdata.append("frame", "1");
  formdata.append("hide", "0");
  formdata.append("database", "999");
  return formdata;
}

module.exports = { saucenao, ascii2d, mkfd };
