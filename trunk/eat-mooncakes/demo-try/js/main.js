(function(){
	var o_body = document.getElementById('gameLayer') || document.body;
	o_body.style.height = window.innerHeight;
	var transform = typeof(o_body.style.webkitTransform) != 'undefined' ? 'webkitTransform' : (typeof(o_body.style.msTransform) != 'undefined'?'msTransform':'transform');
	var transitionDuration = transform.replace(/ransform/g, 'ransitionDuration');
	var blockSize,a_gameLayer = [],a_touchArea = [];

	//欢迎页
	var o_welcomeLayer = document.getElementById('welcomeLayer');
	var o_btnReady = document.getElementById('btnReady');
	function func_closeWelcomeLayer(){
		o_welcomeLayer.style.display="none";
		o_welcomeLayer.className.replace(/show/g,'')
	}
	function func_openWelcomeLayer(){
		o_welcomeLayer.style.display="block";
		o_welcomeLayer.className.replace(/hide/g,'');
	}


	// 游戏页
	var o_main = document.getElementById('mainLayer');
	var o_gameLayer;
	var o_timeCounter = document.getElementById('timeCounter');
	var _ttreg = / t{1,2}(\d+)/, _clearttClsReg = / t{1,2}\d+| bad/;
	var a_gameBBList = [], a_gameBBListIndex = 0, _gameOver = false, _gameStart = false, _gameTime, _gameTimeNum, _gameScore;
	function func_createGameLayer(){
		var html = '<div id="gameLayer">';
		for(var i=1;i<=2;i++){
			var id = 'gameLayer' + i;
			html += '<div id="' + id +'" class="glayer">';
			for(var j=0; j<10;j++){
				for(var k = 0;k<4;k++){
					html += '<div id="'+id+'-'+(k+j*4)+'" num="'+(k+j*4)+'" class="block'+(k?' bl':'')+'"></div>';
				}
			}
			html += '</div>';
		}
		html += '</div>';
		return html;
	}
	function func_countBlockSize(){
		blockSize = o_body.offsetWidth/4;
		o_body.style.height = window.innerHeight+'px';
		o_gameLayer.style.height = window.innerHeight+'px';
		a_touchArea[0] = window.innerHeight-blockSize*0;
		a_touchArea[1] = window.innerHeight-blockSize*3;
	}
	function func_refreshGameLayer (box, loop, offset) {
		var i = Math.floor(Math.random()*1000)%4+(loop?0:4);
		for( var j=0; j<box.childNodes.length; j++){
			var r = box.children[j],
				rstyle = r.style;
			rstyle.left = (j%4)*blockSize+'px';
			rstyle.bottom = Math.floor(j/4)*blockSize+'px';
			rstyle.width = blockSize+'px';
			rstyle.height = blockSize+'px';
			r.className = r.className.replace(_clearttClsReg, '');
			if( i == j ){
				_gameBBList.push( {cell:i%4, id:r.id} );
				r.className += ' t'+(Math.floor(Math.random()*1000)%5+1);
				r.notEmpty = true;
				i = ( Math.floor(j/4)+1)*4+Math.floor(Math.random()*1000 )%4;
			}else{
				r.notEmpty = false;
			}
		}
		if( loop ){
			box.style.webkitTransitionDuration = '0ms';
			box.style.display          = 'none';
			box.y                      = -blockSize*(Math.floor(box.children.length/4)+(offset||0))*loop;
			setTimeout(function(){
				box.style[transform] = 'translate3D(0,'+box.y+'px,0)';
				setTimeout( function(){
					box.style.display     = 'block';
				}, 100 );
			}, 200 );
		} else {
			box.y = 0;
			box.style[transform] = 'translate3D(0,'+box.y+'px,0)';
		}
		box.style[transitionDuration] = '150ms';
	}
	function func_gameLayerMoveNextRow (){
		for(var i=0; i<a_gameLayer.length; i++){
			var g = a_gameLayer[i];
			g.y += blockSize;
			if( g.y > blockSize*(Math.floor(g.children.length/4)) ){
				func_refreshGameLayer(g, 1, -1);
			}else{
				g.style[transform] = 'translate3D(0,'+g.y+'px,0)';
			}
		}
	}
	/**
	* @time:ms
	*/
	function func_creatTimeText (time) {
		var text = (100000+time+'').substr(-4,4);
		text = text.substr(0,2)+"'"+text.substr(2)+"''"
		return text;
	}
	function func_timeCounter () {
		_gameTimeNum --;
		if( _gameTimeNum <= 0){
			o_timeCounter.innerHTML = '时间到！';
			func_gameOver();
			o_gameLayer.className += ' flash';
			
		}else{
			o_timeCounter.innerHTML = func_creatTimeText(_gameTimeNum);
		}
	}
	function func_gameStart(){
		_gameStart = true;
		_gameTime = setInterval(func_timeCounter, 10);
	}
	function func_gameReStart () {
		_gameBBList = [];
		_gameBBListIndex = 0;
		_gameScore = 0;
		_gameOver = false;
		_gameStart = false;
		_gameTimeNum = 2000;
		o_timeCounter.innerHTML = func_creatTimeText(_gameTimeNum);
		func_countBlockSize();
		func_refreshGameLayer(a_gameLayer[0]);
		func_refreshGameLayer(a_gameLayer[1], 1);
	}
	function func_gameReplay(){
		func_gameReStart();
		func_closeScoreLayer();
	}
	function func_gameOn (e) {
		if(_gameOver){
			return false;
		}
		var tar = e.target;
		var y = e.clientY || e.targetTouches[0].clientY,
			x = (e.clientX || e.targetTouches[0].clientX) - o_body.offsetLeft,
			p = _gameBBList[_gameBBListIndex];
		if ( y > a_touchArea[0] || y < a_touchArea[1] ) {
			return false;
		}
		if( (p.id==tar.id&&tar.notEmpty) || (p.cell==0&&x<blockSize) || (p.cell==1&&x>blockSize&&x<2*blockSize) || (p.cell==2&&x>2*blockSize&&x<3*blockSize) || (p.cell==3&&x>3*blockSize) ){
			if( !_gameStart ){
				func_gameStart();
			}
			tar = document.getElementById(p.id);
			tar.className = tar.className.replace(_ttreg, ' tt$1');
			_gameBBListIndex++;
			_gameScore ++; 
			func_gameLayerMoveNextRow();
		}else if( _gameStart && !tar.notEmpty ){
			func_gameOver();
			tar.className += ' bad';
		}
		return false;
	}
	function func_gameOver(){
		clearInterval(_gameTime);
		_gameOver= true;
		setTimeout(function(){
			//o_gameLayer.className = '';
			func_showResult();
			func_openScoreLayer();
		}, 1500);
	}

	// 结果页
	var o_gameScoreLayer = document.getElementById('scoreLayer');
	var o_btnReplay = document.getElementById('btnReplay');
	var o_btnShare = document.getElementById('btnShare');
	var o_shareLayer = document.getElementById('shareLayer');
	function func_showResult(){
		var iclasses=["lev1","lev2","lev3","lev4","lev5"];
		var text=""
		if(_gameScore<=10){
			index=0;
			text="你消灭了"+_gameScore+"个五仁月饼，你牙真好，五仁月饼都不舍得扔！"
		}else if(_gameScore<=30){
			index=1;
			text="你消灭了"+_gameScore+"个五仁月饼，存货还很多哦！这可怎么办？"
		}else if(_gameScore<=50){
			index=2;
			text="亲，你消灭了"+_gameScore+"个五仁月饼，继续加油哦！"
		}else if(_gameScore<=99){
			index=3;
			text="亲，你消灭了"+_gameScore+"个五仁月饼，广大群众感谢你！"
		}else{
			index=4;
			text="亲，你消灭了"+_gameScore+"个五仁月饼，你真全民英雄！"
		}
		o_gameScoreLayer.className = o_gameScoreLayer.className.replace(/lev\d/,'').trim()+' '+iclasses[index];
		document.getElementById('score-text').innerHTML = text;

		var best = func_cookie('best-score');
		if( !best || _gameScore > best ){
			best = _gameScore;
			func_cookie('best-score', best, 100);
		}
		document.getElementById('score-best').innerHTML = '最佳 '+best;
		o_gameScoreLayer.style.display = 'block';
		// func_submitScore(_gameScore);
	}
	function func_submitScore (score){
		if(score>0){
			// game9g.score =parseInt(score);
			// game9g.scoreName = "消灭了"+score+"个";
			// game9g.shareData.title ="我在月饼大战中消灭了"+score+"个五仁月饼,快来挑战一下吧！- 57jrw游戏软件";
		}
	}
	function func_openScoreLayer () {
		o_gameScoreLayer.style.display = 'block';
		o_gameScoreLayer.className.replace(/hide/g,'show');

	}
	function func_closeScoreLayer () {
		o_gameScoreLayer.style.display = 'none';
		o_gameScoreLayer.className.replace(/show/g,'hide');
	}
	function func_openShareLayer () {
		o_shareLayer.style.display = 'block';
		o_shareLayer.className.replace(/hide/g,'');
	}
	function func_closeShareLayer (){
		o_shareLayer.style.display = 'none';
		o_shareLayer.className.replace(/show/g,'');
	}
	function func_toStr(value){
		if(typeof value == 'object'){
			return JSON.stringify(value);
		}else{
			return value;
		}
	}
	function func_cookie(name,value,time){
		if(name){
			if(value){
				if(time){
					var date = new Date();
					date.setTime(date.getTime() + 864e5*time),time = date.toGMTString();
				}
				return document.cookie = name + "=" + escape(func_toStr(value)) + (time ? "; expires=" + time + (arguments[3] ? "; domain=" + arguments[3] + (arguments[4] ? "; path=" + arguments[4] + (arguments[5] ? "; secure" : "") : "") : "") : ""), !0;
			}
			return value = document.cookie.match("(?:^|;)\\s*" + name.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1") + "=([^;]*)"), value = value && "string" == typeof value[1] ? unescape(value[1]) : !1, (/^(\{|\[).+\}|\]$/.test(value) || /^[0-9]+$/g.test(value)) && eval("value=" + value), value;
		}
		var data = {};
		value = document.cookie.replace(/\s/g,'').split(';');
		for(var i = 0;value.length>i;i++)
			name = value[i].split("="), name[1] && (data[name[0]] = unescape(name[1]));
		return data;
	}
	function func_init(){
		o_main.innerHTML = func_createGameLayer();
		o_main.appendChild(o_timeCounter);
		o_gameLayer = document.getElementById('gameLayer');
		
		for(var i=0;i<o_gameLayer.childNodes.length;i++){
			a_gameLayer.push(o_gameLayer.childNodes[i]);
			a_gameLayer[i].children = a_gameLayer[i].querySelectorAll('div');
		}
		createjs.Sound.registerSound( {src:"audio/err.mp3", id:"err"} );
        createjs.Sound.registerSound( {src:"audio/end.mp3", id:"end"} );
        createjs.Sound.registerSound( {src:"audio/tap.mp3", id:"tap"} );
		func_gameReStart();
	}

	func_init();
	// events
	o_btnReady.addEventListener('touchstart',func_closeWelcomeLayer,false);
	o_btnReplay.addEventListener('touchstart',func_gameReplay,false);
	o_btnShare.addEventListener('touchstart',func_openShareLayer,false);
	o_gameLayer.addEventListener('touchstart',func_gameOn,false)
	o_shareLayer.addEventListener('touchstart',func_closeShareLayer,false);

	// 微信分享
	window.shareData = {
       "imgUrl": "http://www.wenzhangku.com/weixin/xiaopingguo/l.png",
       "timeLineLink": "http://www.wenzhangku.com/weixin/xiaopingguo/",
       "tTitle": "干掉五仁月饼！",
       "tContent": "干掉五仁月饼！"
   	};
   	var mebtnopenurl = 'http://mp.weixin.qq.com/s?__biz=MzA5NTMzMTgxMg==&mid=200040545&idx=1&sn=429ecbe3ae11cb5c7ad65a35a9a60be7#rd';
	document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    
	    WeixinJSBridge.on('menu:share:appmessage', function(argv) {
	       WeixinJSBridge.invoke('sendAppMessage', {
	           "img_url": window.shareData.imgUrl,
	           "link": window.shareData.timeLineLink,
	           "desc": window.shareData.tContent,
	           "title": window.shareData.tTitle
	       }, function(res) {
	        document.location.href = mebtnopenurl;
	       })
	    });
	 
	   WeixinJSBridge.on('menu:share:timeline', function(argv) {
	       WeixinJSBridge.invoke('shareTimeline', {
	           "img_url": window.shareData.imgUrl,
	           "img_width": "640",
	           "img_height": "640",
	           "link": window.shareData.timeLineLink,
	           "desc": window.shareData.tContent,
	           "title": window.shareData.tTitle
	       }, function(res) {
	        document.location.href = mebtnopenurl;
	       });
	   });
	}, false);
})();