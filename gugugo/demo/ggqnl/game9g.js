// cnzz 开放计算代码
var _czc = _czc || [];

/***************************** Game 9G 主类 *********************************/

Game9G = function(gameid, cpid) {
	this.gameid = gameid || null;
	this.cpid = cpid || null;
	this.spid = null;
	this.baseurl = "http://www.57jrw.com/h5game";
	this.gameurl = "http://www.57jrw.com/h5game/ggqnl/demo.htm";
	this.homeurl = null;
	this.gzurl = null;
	this.moreurl = null;
	this.eventurl = null;
	this.score = null;
	this.scoreName = null;
	this.shareDomain = null;
	this.shareDomains = ["57jrw.com","57jrw.com","57jrw.com", "57jrw.com", "57jrw.com", "57jrw.com"];
	this.shareData = {
		imgurl: null,
		link: null,
		title: "57jrw游戏软件",
		content: "57jrw游戏软件"
	};
	this.app = null;
	this.user = null;
	this.isnewuser = false;
	this.event = null;
	this.pkuid = null;
	this.pklastuser = null;
	this.utils = new Game9GUtils(this);
	if (this.gameid) this.utils.loading();
	this.init();
}

// 初始化
Game9G.prototype.init = function() {
	this.spid = this.utils.getParameter("spid");
	this.isnewuser = (this.utils.getParameter("f") == "zf");
	this.pkuid = this.utils.getParameter("pkuid");
	this.pklastuser = this.utils.getParameter("pklastuser");
	this.gameurl = "http://www.57jrw.com/h5game/ggqnl/demo.htm";
	this.homeurl = "http://www.57jrw.com/h5game/ggqnl/demo.htm";
	this.gzurl = "http://www.57jrw.com/h5game/index.html";
	this.moreurl = "http://www.57jrw.com/h5game/index.html";
	this.shareDomain = this.shareDomains[parseInt(Math.random() * this.shareDomains.length)];
	this.shareData.imgurl = "http://www.57jrw.com/h5game/ggqnl/icon.png";
	this.shareData.link = "http://www.57jrw.com/h5game/ggqnl/demo.htm";
	switch (this.utils.getAppType()) {
		case "wx":
			this.app = new Game9GWx(this);
			break;
		case "uc":
			this.app = new Game9GUC(this);
			break;
		case "57jrw":
			this.app = new Game9GApp(this);
			break;
	}
	/*if (this.gameid) {
		var _this = this;
		setTimeout(function() {
			_this.getEventToday();
		}, 1000);
		setTimeout(function() {
			_this.utils.showAd();
		}, 2000);
		_czc.push(["_setCustomVar", "用户", (this.isnewuser ? "新用户" : "老用户"), 1]);
		_czc.push(["_setCustomVar", "gameid", this.gameid, 1]);
		_czc.push(["_setCustomVar", "spid", this.spid, 1]);
	}*/
};

// 分享
Game9G.prototype.share = function() {
	// 调用各自 App 的分享接口
	this.app && this.app.share();
}

// 获取今日活动
/*Game9G.prototype.getEventToday = function() {
	var url = "http://wx.57jrw.com/event/getevent" + (localStorage.myuid ? "?uid=" + localStorage.myuid : "");
	var _this = this;
	this.utils.jsonp(url, null, null, function(data){
		if (data.user) _this.user = data.user;
		if (data.event) _this.event = data.event;
		if (_this.user && (_this.spid == null || _this.spid == "uc")) {
			// 重新判断是否新用户
			_this.isnewuser = false;
			_this.moreurl = _this.homeurl;
		}
	});
}*/

// 获取活动页地址
/*Game9G.prototype.getEventUrl = function() {
	return "http://www.57jrw.com/app/event.html?r=" + Math.random();
	
	var url = null;
	if (this.event) {
		url = "http://wx.57jrw.com/event/rank.jsp?eventid=" + this.event.eventId + (localStorage.myuid ? "&uid=" + localStorage.myuid : "");
	}
	else {
		url = "http://wx.57jrw.com/event/rank.jsp" + (localStorage.myuid ? "?uid=" + localStorage.myuid : "");
	}
	return url;
	
}*/

// 活动对话框
Game9G.prototype.shareFlow = function() {
	var _this = this;
	// 自动提交成绩
	if (localStorage.myuid && this.score != null && this.score > 0) {
		// 本次游戏第一次自动提交，之后仅破纪录才提交
		if (!this.isSubmitted || this.isSubmitted && (this.gameOrder == "asc" && this.score < this.rankScore || this.gameOrder == "desc" && this.score > this.rankScore)) {
			this.submit(function(data) {
				if (data.success) {
					_this.isSubmitted = true;
					_this.gameOrder = data.order;
					_this.rankScore = data.refreshRankScore || data.lastRankScore == -1 ? _this.score : data.lastRankScore;
					_this.autoScore = _this.score;
				}
			});
		}
	}
	var options = {};
	// 来自 sp 渠道的 "新用户"，去关注页
	if (this.isnewuser && this.spid && this.spid != "uc" && this.spid != "51h5") {
		options = {
			title: "分享到朋友圈",
			content: "你的成绩：" + this.scoreName,
			onclose: function() {
				window.location = _this.moreurl;
			}
		};
		this.app.shareOK = function() {
			window.location = _this.moreurl;
		}
		this.utils.shareTip(options);
		return;
	}
	// if (this.event && !this.isnewuser) {
	// 2014-11-4 20:40 全部去活动页
	if (this.event) {
		// 老用户（有设定今日活动前提下）
		if (this.event.gameid == this.gameid) {
			// 今日比赛
			options = {
				title: "分享到朋友圈 + 看你排名是否中奖",
				content: "你的成绩：" + this.scoreName,
				ignore: "放弃中奖机会"
			};
			// 分享完成提交成绩
			this.app.shareOK = function() {
				// 2014-11-28：再次玩提交（当成绩不同时）
				if (!_this.isSubmitted || _this.isSubmitted && _this.score != _this.autoScore) {
					_this.submit(function() {
						window.location = _this.getEventUrl();
					});
				}
				else {
					window.location = _this.getEventUrl();
				}
			};
			this.utils.shareTip(options);
		}
		else {
			// 非今日比赛
			options = {
				title: "分享到朋友圈 + 参加今日大奖赛",
				content: "你的成绩：" + this.scoreName,
				ignore: "不参加大奖赛"
			};
			// 分享完成去今日比赛
			this.app.shareOK = function() {
				// window.location = _this.baseurl + "/gamecenter.html?gameid=" + _this.event.gameid;
				// 2014-11-6 17:00 去大奖赛页面
				window.location = _this.getEventUrl();
			};
			this.utils.shareTip(options);
		}
	}
	else {
		// 新用户（及没有设定今日活动的情况）
		options = {
			title: "分享到朋友圈",
			content: "你的成绩：" + this.scoreName,
			onclose: function() {
				window.location = _this.moreurl;
			}
		};
		this.app.shareOK = function() {
			window.location = _this.moreurl;
		}
		this.utils.shareTip(options);
	}
}

// 提交成绩
Game9G.prototype.submit = function(callback) {
	if (!localStorage.myuid) {
		// alert("无法识别用户身份");
		return;
	}
	if (this.score == null || isNaN(this.score)) {
		// alert("无效的成绩");
		return;
	}
	var _this = this;
	var url = "http://wx.57jrw.com/rank/submit.jsp?gameid=" + this.gameid + "&uid=" + localStorage.myuid + "&score=" + this.score + "&scorename=" + encodeURIComponent(this.scoreName) + "&title=" + encodeURIComponent(this.shareData.title) + (this.pkuid ? "&pkuid=" + this.pkuid : "") + (this.pklastuser ? "&pklastuser=" + this.pklastuser : "");
	this.utils.jsonp(url, null, null, function(data) {
		if (data.success) {
			// if (data.refreshRankScore) {
			// 	alert("您的成绩已经成功提交到9G！\r\n刷新了上一次的最好成绩: " + data.rankScoreName);
			// }
			// else {
			// 	alert("您的成绩已经成功提交到9G！");
			// }
			_this.utils.debug(data);
			callback && callback.call(null, data);
		}
		else {
			_this.utils.debug("提交失败");
		}
	});
}

Game9G.prototype.isTest = function() {
	return (
		this.utils.getParameter("istest") == "y"
		|| localStorage.myuid == "b1Atb251RGNNZktTeTRCdXp3NDFCMkpoNzR0OA=="
		|| localStorage.myuid == "b1Atb251T1ZmS0VubEhKSXdxTi1NQ3NuV2xvZw=="
		|| localStorage.myuid == "b1Atb251R0xBLVRldGNjcGxGZmNLWlhsOXZ0bw=="
		// || localStorage.myuid == "b1Atb251Q2lza25RWFRIVnowTXczSmRjMWpDRQ=="
		// || localStorage.myuid == "b1Atb251SlZhY0JjQ25za3lmUlhuX2JiVGszcw=="
		// || localStorage.myuid == "b1Atb251UG8tVnNWbDM3UVFvaUI4M2hJbUQyTQ=="
	);
}

/***************************** 实用工具类 *********************************/

Game9GUtils = function(game9g) {
	this.game9g = game9g;
}

// 返回当前 App 类型 [微信、UC浏览器、etc]
Game9GUtils.prototype.getAppType = function() {
	var ua = navigator.userAgent;
	if (/micromessenger/ig.test(ua)) {
		return "wx";
	}
	else if (/ucbrowser/ig.test(ua)) {
		return "uc";
	}
	else if (/game9g/ig.test(ua)) {
		return "57jrw";
	}
	else {
		return "other";
	}
}

// 返回当前 App 版本号
Game9GUtils.prototype.getAppVersion = function() {
	var result = null;
	var version = null;
	var ua = navigator.userAgent;
	switch (this.getAppType()) {
		case "wx":
			result = ua.match(/MicroMessenger\/([^\s]+)/i);
			if (result) version = result[1];
			break;
		case "uc":
			result = ua.match(/UCBrowser\/([^\s]+)/i);
			if (result) version = result[1];
			break;
	}
	return version;
}

// 比较版本号（version1 >= version2 时返回 true，否则返回 false）
Game9GUtils.prototype.compareVersion = function(version1, version2) {
	var r1 = version1.match(/(\d+)(?!\d)/ig);
	var r2 = version2.match(/(\d+)(?!\d)/ig);
	var result = true;
	for (var i = 0; i < 99; i++) {
		if (r1.length < i + 1) { result = false; break; }
		if (r2.length < i + 1) { result = true; break; }
		var n1 = parseInt(r1[i]);
		var n2 = parseInt(r2[i]);
		if (n1 != n2) { result = (n1 > n2); break; }
	}
	return result;
}

// 获取 URL 参数
Game9GUtils.prototype.getParameter = function(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return r[2]; return null;
}

// 返回当前时间（秒值）
Game9GUtils.prototype.now = function() {
	var dt = new Date();
	dt.setMilliseconds(0);
	return dt.getTime() / 1000;
}

// 返回今天日期（秒值）
Game9GUtils.prototype.today = function() {
	var dt = new Date();
	dt.setHours(0, 0, 0, 0);
	return dt.getTime() / 1000;
}

// 格式化日期（参数一：日期对象或秒值；参数二：格式[可选]）
Game9GUtils.prototype.formatDate = function() {
	var date = arguments[0];
	var format = arguments[1] || "yyyy-MM-dd HH:mm:ss";
	if (typeof date == "number") {
		date = new Date(date * 1000);
	}
	var paddNum = function(num) {
		num += "";
		return num.replace(/^(\d)$/, "0$1");
	}
	var config = {
		yyyy : date.getFullYear(),
		yy : date.getFullYear().toString().substring(2),
		M  : date.getMonth() + 1,
		MM : paddNum(date.getMonth() + 1),
		d  : date.getDate(),
		dd : paddNum(date.getDate()),
		HH : paddNum(date.getHours()),
		mm : paddNum(date.getMinutes()),
		ss : paddNum(date.getSeconds())
	}
	return format.replace(/([a-z])(\1)*/ig, function(m){return config[m];});
}

// 显示分享图片
Game9GUtils.prototype.showShare = function() {
	var img = document.getElementById("game9gshare");
	if (img) {
		img.style.display = "";
	}
	else {
		img = document.createElement("img");
		img.id = "game9gshare";
		img.src = "http://www.57jrw.com/h5game/szcg/images/share.png";
		img.className = "game9gshare";
		img.addEventListener("click", this.hideShare);
		img.addEventListener("touchstart", this.hideShare);
		document.getElementsByTagName("body")[0].appendChild(img);
	}
}

// 隐藏分享图片
Game9GUtils.prototype.hideShare = function() {
	var img = document.getElementById("game9gshare");
	if (img) img.style.display = "none";
}

// 显示分享对话框
// Game9GUtils.prototype.shareConfirm = function(content, callback) {
// 	var _this = this;
// 	setTimeout(function(){
// 		// if (_this.game9g.isTest()) {
// 			new Game9GUtilsDialog(_this.game9g, {
// 				title: "57jrw游戏软件",
// 				content: content,
// 				buttons: [
// 					{
// 						label: "取消",
// 						click: function() {
// 							switch (_this.getAppType()) {
// 								case "wx":
// 									// 微信用户，去活动流程
// 									_this.game9g.eventFlow();
// 									break;
// 								case "uc":
// 									// UC 浏览器用户，去游戏列表
// 									// window.location = _this.game9g.baseurl + "/index.html?spid=uc";
// 									break;
// 							}
// 						}
// 					},
// 					{ label: "确定", click: callback }
// 				]
// 			}).open();
// 		// }
// 		// else {
// 		// 	new Game9GUtilsDialog(_this.game9g, {
// 		// 		title: "57jrw游戏软件",
// 		// 		content: content,
// 		// 		buttons: [
// 		// 			{ label: "取消", click: null },
// 		// 			{ label: "确定", click: callback }
// 		// 		]
// 		// 	}).open();
// 		// }
// 	}, 1000);
// }

// 对话框
Game9GUtils.prototype.dialog = function(options) {
	new Game9GUtilsDialog(this.game9g, options).open();
}

// 对话框类
Game9GUtilsDialog = function(game9g, options) {
	this.game9g = game9g;
	this.title = options.title;
	this.content = options.content;
	this.buttons = options.buttons;
}

// 打开对话框
Game9GUtilsDialog.prototype.open = function() {
	if (document.getElementById("game9gdialog")) return;
	var div = document.createElement("div");
	div.id = "game9gdialog";
	div.className = "game9gdialog";
	div.innerHTML = "<header><h2>" + this.title + "</h2></header><section>" + this.content.replace(/\n/g, "<br/>") + "</section><footer></footer>";
	for (var i=0; i<this.buttons.length; i++) {
		var btn = this.buttons[i];
		var a = document.createElement("a");
		a.innerHTML = btn.label;
		a.addEventListener("click", this.close);
		a.addEventListener("click", btn.click);
		a.addEventListener("touchstart", this.close);
		a.addEventListener("touchstart", btn.click);
		div.getElementsByTagName("footer")[0].appendChild(a);
	}
	document.getElementsByTagName("body")[0].appendChild(div);
	var mask = document.createElement("div");
	mask.id = "game9gmask";
	mask.className="game9gmask";
	document.getElementsByTagName("body")[0].appendChild(mask);
}

// 关闭对话框
Game9GUtilsDialog.prototype.close = function() {
	var div = document.getElementById("game9gdialog");
	if (div) document.getElementsByTagName("body")[0].removeChild(div);
	var mask = document.getElementById("game9gmask");
	if (mask) document.getElementsByTagName("body")[0].removeChild(mask);
}

// Ajax 请求
Game9GUtils.prototype.ajax = function(url, success) {
	new Game9GUtilsAjax(this.game9g, "GET", url, null, "json", success);
}

// JSONP 请求
Game9GUtils.prototype.jsonp = function(url, data, jsonparam, success) {
	new Game9GUtilsJsonp(url, data, jsonparam, success).request(); 
}

// Ajax 类
Game9GUtilsAjax = function(game9g, method, url, data, type, success) {
	this.game9g = game9g;
	this.xmlhttp = null;
	if (window.XMLHttpRequest) {
		this.xmlhttp = new XMLHttpRequest();
	}
	else {
		this.xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	this.type = type;
	this.success = success;
	this.xmlhttp.open(method, url, true);
	var _this = this;
	this.xmlhttp.onreadystatechange = function() {
		_this.callback.apply(_this);
	};
	this.xmlhttp.send(data);
}

// Ajax 请求回调
Game9GUtilsAjax.prototype.callback = function() {
	if (this.xmlhttp.readyState == 4 && this.xmlhttp.status == 200) {
		var data = null;
		switch (this.type) {
			case "text":
				data = this.xmlhttp.responseText;
				break;
			case "json":
				try {
					data = JSON.parse(this.xmlhttp.responseText);
				}
				catch (e) {
					data = this.xmlhttp.responseText;
				}
				break;
		}
		this.success && this.success.call(this.xmlhttp, data);
	}
}

// JSONP 类
Game9GUtilsJsonp = function(url, data, jsonparam, success, timeout) {
	var finish = false;
	var theHead = document.getElementsByTagName("head")[0] || document.documentElement;
	var scriptControll = document.createElement("script");
	var jsonpcallback = "jsonpcallback" + (Math.random() + "").substring(2);
	var collect = function() {
		if (theHead != null) {
			theHead.removeChild(scriptControll);
			try {
				delete window[jsonpcallback];
			} catch (ex) { }
			theHead = null;
		}
	};
	var init = function() {
		scriptControll.charset = "utf-8";
		theHead.insertBefore(scriptControll, theHead.firstChild);
		window[jsonpcallback] = function(responseData) {
			finish = true;
			success(responseData);
		};
		jsonparam = jsonparam || "callback";
		if (url.indexOf("?") > 0) {
			url = url + "&" + jsonparam + "=" + jsonpcallback;
		} else {
			url = url + "?" + jsonparam + "=" + jsonpcallback;
		}
		if (typeof data == "object" && data != null) {
			for (var p in data) {
				url = url + "&" + p + "=" + escape(data[p]);
			}
		}
	};
	var timer = function() {
		if (typeof window[jsonpcallback] == "function") {
			collect();
		}
		if (typeof timeout == "function" && finish == false) {
			timeout();
		}
	};
	this.request = function() {
		init();
		scriptControll.src = url;
		window.setTimeout(timer, 10000);
	};
}

// Loading
Game9GUtils.prototype.loading = function() {
	var div = document.createElement("div");
	div.id = "game9gloading";
	div.className = "game9gloading";
	if (this.game9g.cpid) {
		div.innerHTML = "<img class='game9glogo_up' src='http://www.57jrw.com/h5game/kplxj/img/slogon.png' /><img class='cplogo' src='' />";
	}
	else {
		div.innerHTML = "<img class='game9glogo' src='http://www.57jrw.com/h5game/kplxj/img/slogon.png' />";
	}
	document.getElementsByTagName("body")[0].appendChild(div);
	setTimeout(function(){
		document.getElementsByTagName("body")[0].removeChild(div);
	}, 3000);
}

// 显示广告
Game9GUtils.prototype.showAd = function() {
	// UC 广告：如果已经是 UC 浏览器不显示
	if (this.game9g.spid == "uc" && this.getAppType() != "uc") {
		var url = "http://wx.57jrw.com/pm/get.jsp?spid=" + this.game9g.spid;
		this.jsonp(url, null, null, function(data){
			if (data.ad) {
				var img = document.createElement("img");
				img.id = "game9gad";
				img.src = data.ad.imgurl;
				img.className = "game9gad";
				img.addEventListener("touchstart", function(){
					window.location = "http://wx.57jrw.com/pm/click.jsp?id=" + data.ad.id;
				});
				var first = document.getElementsByTagName("body")[0].firstChild;
				document.getElementsByTagName("body")[0].insertBefore(img, first);
			}
		});
	}
}

// 调试工具
Game9GUtils.prototype.debug = function(obj) {
	if (this.game9g.isTest()) {
		alert(this.describe(obj));
	}
}

// 返回描述 Object 对象的字符串
Game9GUtils.prototype.describe = function(obj, tab) {
	tab = tab || "";
	var content = "";
	if (typeof obj == "object") {
		for (var item in obj) {
			if (typeof obj[item] == "object")
				content += tab + item + " = \n" + tab + "(\n" + this.describe(obj[item], tab + "    ") + tab + ")\n";
			else
				content += tab + item + " = " + obj[item] + "\n";
		}
	}
	else {
		content += tab + obj;
	}
	return content;
}

// 跟踪事件 (action:动作,string,必选; value:值,int,可选; callback:完成回调函数,Function,可选)
Game9GUtils.prototype.track = function() {
	var action = null;
	var value = null;
	var callback = null;
	switch (arguments.length) {
		case 1:
			action = arguments[0];
			break;
		case 2:
			action = arguments[0];
			if (!isNaN(arguments[1])) value = arguments[1];
			if (typeof arguments[1] == "function") callback = arguments[1];
			break;
		case 3:
			action = arguments[0];
			value = arguments[1];
			callback = arguments[2];
			break;
	}
	var url = "http://wx.57jrw.com/open/track?gameid=" + this.game9g.gameid + "&action=" + encodeURIComponent(action) + (value == null ? "" : "&value=" + value) + (localStorage.myuid ? "&uid=" + localStorage.myuid : "");
	this.jsonp(url, null, null, function(data) {
		if (data.success) {
			callback && callback.apply(null);
		}
	});
}

// 统计代码
Game9GUtils.prototype.tongji = function() {
	try {
		// // baidu
		// var _bdhmProtocol = (("https:" == document.location.protocol) ? " https://" : " http://");
		// document.write(unescape("%3Cscript src='" + _bdhmProtocol + "hm.baidu.com/h.js%3F0ae524064813b8dc07ece5ce724a7b04' type='text/javascript'%3E%3C/script%3E"));
		// cnzz 统计代码
		var cnzz_protocol = (("https:" == document.location.protocol) ? " https://" : " http://");
		document.write(unescape("%3Cspan id='cnzz_stat_icon_2947366'%3E%3C/span%3E%3Cscript src='" + cnzz_protocol + "s5.cnzz.com/stat.php%3Fid%3D2947366' type='text/javascript'%3E%3C/script%3E"));
	} catch (e) {
		console.error(e);
	}
}

/***************************** 微信工具类 *********************************/

Game9GWx = function(game9g) {
	this.game9g = game9g;
	this.version = null;
	this.shareOK = null;
	this.shareCancel = null;
	this.init();
}

// 初始化
Game9GWx.prototype.init = function() {
	this.version = this.game9g.utils.getAppVersion();
	var _this = this;
	document.addEventListener("WeixinJSBridgeReady", function onBridgeReady() {
		WeixinJSBridge.on("menu:share:appmessage", function(argv) {
			WeixinJSBridge.invoke("sendAppMessage", {
				"img_url": _this.game9g.shareData.imgurl,
				"link": _this.game9g.shareData.link,
				"desc": _this.game9g.shareData.content,
				"title": _this.game9g.shareData.title
			}, function(res){
				if (res.err_msg == "send_app_msg:cancel") {
					_this.shareCancelHandler();
				}
				else {
					_this.shareOKHandler();
				}
			});
		});
		WeixinJSBridge.on("menu:share:timeline", function(argv) {
			WeixinJSBridge.invoke("shareTimeline", {
				"img_url": _this.game9g.shareData.imgurl,
				"img_width": "640",
				"img_height": "640",
				"link": _this.game9g.shareData.link,
				"desc": _this.game9g.shareData.content,
				"title": _this.game9g.shareData.title
			}, function(res){
				if (res.err_msg == "share_timeline:cancel") {
					_this.shareCancelHandler();
				}
				else {
					_this.shareOKHandler();
				}
			});
		});
	}, false);
}

// 分享接口实现
Game9GWx.prototype.share = function() {
	if (this.game9g.gameid) {
		this.game9g.shareFlow();
	}
}

// 分享完成
Game9GWx.prototype.shareOKHandler = function() {
	//_czc.push(﻿["_trackEvent", "分享", "成功"]);
	// 回调分享完成 callback
	this.shareOK && this.shareOK.apply(this.game9g); // 注意：方法的 this 已设置为 game9g
}

// 分享取消
Game9GWx.prototype.shareCancelHandler = function() {
	// _czc.push(﻿["_trackEvent", "分享", "取消"]);
	// 回调分享取消 callback
	this.shareCancel && this.shareCancel.apply(this.game9g); // 注意：方法的 this 已设置为 game9g
}

/***************************** UC 工具类 *********************************/

Game9GUC = function(game9g) {
	this.game9g = game9g;
	this.version = null;
	window.uc_param_str = {};
	this.init();
}

// 初始化
Game9GUC.prototype.init = function() {
	this.version = this.game9g.utils.getAppVersion();
	var url = "http://hao.uc.cn/getucparam.php";
	var data = { uc_param_str: "dnfrpfbivecpbtnt" };
	this.game9g.utils.jsonp(url, data, null, function(data) {
		window.uc_param_str = data;
	});
}

// 判断是否满足最低版本要求
Game9GUC.prototype.isVersionOver = function(version) {
	return this.game9g.utils.compareVersion(this.version, version);
}

// 分享接口实现
Game9GUC.prototype.share = function() {
	if (uc_param_str.fr === 'android' || uc_param_str.fr === 'iphone') {
		if (uc_param_str.fr === 'android') {
			// Android
			try {
				ucweb.startRequest("shell.page_share", [
					this.game9g.shareData.title,
					this.game9g.shareData.content,
					this.game9g.shareData.link,
					''
				]);
			} catch (e) {
				console.error(e.message);
			}
		} else {
			// iOS
			if (this.isVersionOver("9.9.0.0")) {
				// 9.9.0.0 以上版本
				this.createIconImage();
				ucbrowser.web_share(
					this.game9g.shareData.title,
					this.game9g.shareData.content,
					this.game9g.shareData.link,
					'', '', '来自57jrw游戏软件', 'game9gucicon'
				);
			}
			else {
				// 9.9.0.0 之前版本
				location.href = "ext:web_share:";
			}
		}
	}
	else {
		alert("其它分享接口");
	}
}

// 插入 Icon 图片以供 UC 截图使用
Game9GUC.prototype.createIconImage = function() {
	var img = document.getElementById("game9gucicon");
	if (!img) {
		img = document.createElement("img");
		img.id = "game9gucicon";
		img.src = "http://www.57jrw.com/h5game/ggqnl/icon.png";
		img.className = "game9gucicon";
		document.getElementsByTagName("body")[0].appendChild(img);
	}
}

/***************************** 9G App 类 *********************************/

Game9GApp = function(game9g) {
	this.game9g = game9g;
	this.version = null;
	this.shareOK = null;
	this.shareCancel = null;
	this.oldTitle = null;
	this.init();
}


// 初始化
Game9GApp.prototype.init = function() {
	var _this = this;
	document.addEventListener("game9gWxShareOk", function onBridgeReady() {
		document.title = _this.oldTitle;
		_this.shareOK && _this.shareOK.apply(_this.game9g); // 注意：方法的 this 已设置为 game9g
	});
}

// 分享接口实现
Game9GApp.prototype.share = function() {
	this.oldTitle = document.title;
	var space = "9G............................................................|";
	document.title = space + this.game9g.shareData.link + "|" + this.game9g.shareData.title + "|" + this.game9g.shareData.content + "|" + this.game9g.shareData.imgurl;
	if (this.game9g.gameid) this.game9g.shareFlow();
}
