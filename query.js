const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cheerio = require("cheerio");
const formData = require("form-data");
const config = require("../token/config.json");

async function saucenaoIP(url){
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
	console.log($("*").html());
	//console.log(parseFloat($(".result .resulttable .resulttablecontent .resultmatchinfo").eq(0).text().slice(0, -1)));
	return $("div[class='result']").length == 1 ?
			":x: Low similarity" : $(".result .resulttable .resulttablecontent .resultcontentcolumn").find("a").eq(0).attr("href");

}

async function ascii2d(url){
	var formdata = mkfd(url);
	let body = await fetch('https://ascii2d.net/search/url/'+url)
	.then(res => res.text());
	let $ = cheerio.load(body);
	var i = ($("div.detail-box.gray-link").eq(0).find("a").eq(0).attr("href") == null) ? 1 : 0;
	var r;
	if ($("div.detail-box.gray-link").eq(0+i).find("small").text() == "twitter") r = $("div.detail-box.gray-link").eq(0+i).find("a").eq(0).attr("href");
	else if ($("div.detail-box.gray-link").eq(1+i).find("small").text() == "twitter") r = $("div.detail-box.gray-link").eq(1+i).find("a").eq(0).attr("href");
	else r = $("div.detail-box.gray-link").eq(0+i).find("a").eq(0).attr("href");
	return (r == null) ? ":x: Error" : r ;

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

function mkParam(config) {
	return (
		'?output_type=2' +
		'&api_key=' + config.token +
		'&numres=' + config.depth +
		'&dedupe=1' +
		'&url=' + encodeURIComponent(config.url)
	);
}

function isPixivUrl(url) {
	let pattern = /^(https:\/\/i\.pximg\.net|https:\/\/www\.pixiv\.net)(.+)(\/|=)(?<pixiv_id>\d+)/i;
	let res = pattern.exec(url);
	if(!res) return false;
	return {
		pixiv_id: res.groups.pixiv_id
	}
}

function isTweetUrl(url) {
	let pattern = /^(https:\/\/twitter\.com|https:\/\/(www|mobile)\.twitter\.com)(.+)\/(?<tweet_id>\d+)/i;
	let res = pattern.exec(url);
	if(!res) return false;
	return {
		tweet_id: res.groups.tweet_id
	}
}

async function isUrlVaild(url) {
	let http_status = await fetch(url)
	.then(res => {return res.status;});
	if (http_status == 200) return true;
	return false;
}

async function saucenao(config){
	let headers = {
		"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0",
		"Acept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
		"Accept-Language": "zh-TW,zh;q=0.8,en-US;q=0.6,en;q=0.4,ja;q=0.2",
		"Content-Type": "application/x-www-form-urlencoded",
		"DNT": "1",
		"Upgrade-Insecure-Requests": "1",
		"Sec-GPC": "1"
	};

	let requestOptions = {
		method: 'GET',
		headers: headers,
	};

	let body = await fetch('https://saucenao.com/search.php'+mkParam(config), requestOptions)
	.then(res => res.json());
	if(body.header.status != 0) return { status: body.header.status };
	/*
	pixiv id >>
	tweet_id >>
	source == pixiv >>
	source == twitter >>
	next
	*/
	var catch_url = {url: '', vaild: false, index: 0};
	for(var i=0;i<config.depth;i++) {
		if(parseFloat(body.results[i].header.similarity) < config.threadhold) break;
		//pixiv_id
		if(body.results[i].data.pixiv_id != null) {
			catch_url.url = 'https://www.pixiv.net/artworks/' + body.results[i].data.pixiv_id;
			if(await isUrlVaild(catch_url.url)){
				catch_url.vaild = true;
				catch_url.index = i;
				break;
			}
		}
		//source == pixiv
		if(isPixivUrl(body.results[i].data.source)) {
			catch_url.url = 'https://www.pixiv.net/artworks/' + isPixivUrl(body.results[i].data.source).pixiv_id;
			if(await isUrlVaild(catch_url.url)){
				catch_url.vaild = true;
				catch_url.index = i;
				break;
			}
		}
		//source == twitter
		if(isTweetUrl(body.results[i].data.source)) {
			catch_url.url = 'https://twitter.com/i/web/status/' + isTweetUrl(body.results[i].data.source).tweet_id;
			catch_url.vaild = true;
			catch_url.index = i;
			break;
		}
		//tweet_id
		if(body.results[i].data.tweet_id != null) {
			catch_url.url = 'https://twitter.com/i/web/status/' + body.results[i].data.tweet_id;
			catch_url.vaild = true;
			catch_url.index = i;
			break;
		}
	}
	//Redundant url
	var testRes;
	for(var i=0;i<config.depth;i++) {
		if(catch_url.vaild) break;
		if(parseFloat(body.results[i].header.similarity) < config.threadhold) break;
		if(body.results[i].data.ext_urls == null) continue;
		if(isPixivUrl(body.results[i].data.ext_urls[0])) {
			testRes = await isUrlVaild(body.results[i].data.ext_urls[0]);
			if(!testRes) continue;
		}
		catch_url.url = body.results[i].data.ext_urls[0];
		catch_url.vaild = true;
		catch_url.index = i;
		break;
	}
	console.log(catch_url);
	let threadhold = (body.results[catch_url.index].header.similarity >= config.threadhold);
	return {
		status: 0,
		short_limit: body.header.short_limit,
		long_limit: body.header.long_limit,
		dayRemaining: body.header.long_remaining,
		hMinRemaining: body.header.short_remaining,
		similarity: parseFloat(body.results[catch_url.index].header.similarity),
		thumbnail: body.results[catch_url.index].header.thumbnail,
		pixiv_id: body.results[catch_url.index].data.pixiv_id,
		url: catch_url.url,
		threadhold: threadhold
	};
}

module.exports = { saucenao, ascii2d };
