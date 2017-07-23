$(document).ready(function () {
	$('li').each(function () {
		if($(this).attr('class') == 'active') {
			var id = this.id;
			var page = '/'+id;
			load(page);
		}
	});
	$('li').click(function () {
		$('li').each(function () {
			$(this).removeClass('active');
		});
		$('#brand').attr('style', 'background-color:none');
		var id = this.id;
		var page = '/'+id;
		$(this).addClass('active');
		load(page);
	});
	$('#brand').click(function () {
		$('li').each(function () {
			$(this).removeClass('active');
		});
		$('#brand').attr('style', 'background-color:lightgrey');
		$.get("/index", function () {});
	});
	$.get("/news", function (news) {
		console.log(news);
		if(!news.error) {
			var htmlNote = htmlUpdate = '';
			news.result.notes.forEach(function (note, i) {
				htmlNote += '<span>'+(i+1)+'. '+note+'</span><br/>';
				$('#note p').html(htmlNote);
			});
			news.result.updates.forEach(function (update, i) {
				htmlUpdate += '<span>'+(i+1)+'. '+update+'</span><br/>';
				$('#update p').html(htmlUpdate);
			});
		} else {
			$('#note p').html('<span>No notes.</span>');
			$('#update p').html('<span>No updates.</span>');
		}
	});
});

var load = function (page) {
	console.log(page);
	var file = '/web/html'+page+'.html';
	$('#pages').load(file, function () {
		//console.log(window.location.href);
		initPage(page.split('/')[1]);
	});
}

var initPage = function (page) {
	switch(page) {
		case 'images': imagesReady(); break;
		case 'backup' : backupReady(); break;
		case 'restore' : restoreReady(); break;
		case 'users' : usersReady(); break;
		case 'subscript' : subscriptReady(); break;
		default : break;
	}
}