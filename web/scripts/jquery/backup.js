var images = [];
var count = 0;

var backupReady = function() {
	$("#result").html('<span style="color:green">Downloading Images.</span>');
	$.ajax({
		url: "/download",
		type: "GET",
		success: function(data) {
			if(data.error) errorFunction(data.error);
			else {
				displayImages(data.result, function () {
					$("#result").html('<span style="color:green">Select image(s).</span>');
					$('img').each(function () {
						$(this).prop('selected', false);
					});
					
					$("img").click(function () {
						var imageId = this.id;
						var url = $(this).attr('src');
						if($(this).prop('selected') == false) {
							$(this).prop('selected', true);
							images.push(url);
							count++;
							console.log("images:", images, "\ncount:", count);
							$("#result").html('<span style="color:green">Image '+imageId[imageId.length-1]+' checked. Total '+count+' image(s) selected.</span>');
						} else {
							$(this).prop('selected', false);
							var i = images.indexOf(url);
							if(i > -1) {
								images.splice(i, 1);
							}
							if(count > 0) count--;
							if(count <= 0) count = 0;
							console.log("images:", images, "\ncount:", count);
							$("#result").html('<span style="color:green">Image '+imageId[imageId.length-1]+' unchecked. Total '+count+' image(s) selected.</span>');
						}
						if(count > 0) $('#send').prop('disabled', false);
						else $('#send').prop('disabled', true);
					});
				});
			}
		}
	});
}

var backup = function () {
	console.log("images:", images, "\ncount:", count);
	if(images.length == 0) errorFunction("Please Selecte images");
	else {
		$('img').each(function () {
			$(this).prop('selected', false);
		});
		$('#send').prop('disabled', true);
		$.ajax({
		    url: "/send",
		    type: "POST",
		    dataType: "json",
		    data: {"images":images},
		    success: function(data) {
		    	images = [];
				count = 0;
		      	if(data.result) {
					var html = '<span style="color:green">Sent image(s) are:</span><br/><br/>';
					data.result.images.forEach(function (image) {
						html += '<img src="'+image+'" style="width:100px;height:50px;">&nbsp;&nbsp;&nbsp;&nbsp;'
					});
					$("#result").html(html);
		      	}
				if(data.error) errorFunction(data.error);
			}
	  	});
	}
}

var errorFunction = function (error) {
	$("#result").html('<span style="color:red">'+error+'</span>');
}

var displayImages = function (result, callback) {
	console.log(result);
	var div, section, article, img, articleArr = [], sectionArr = [];
	result.forEach(function (url, i) {	
		img = (i+1)+':&nbsp;'+url.split("/")[url.split("/").length-1]+'<br/><img src="'+url+'" id="img'+(i+1)+'" class="img-thumbnail" style="width: 700px; height: 500px" />'
		article = '<article class="col-md-6">'+img+'</article>';
		articleArr.push(article);
		if(i % 2 != 0) {
			var newArticle = articleArr.join('');
			articleArr = [];
			section = '<section class="row">'+newArticle+'</section>';
			sectionArr.push(section);
		}
	});
	div = sectionArr.join('');
	sectionArr = [];
	$('#image').html(div);
	callback();
}