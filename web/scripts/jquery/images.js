var images = [];
var count = 0;

var imagesReady = function() {
	$("#result").html('<span style="color:green">Downloading Images.</span>');
	$.ajax({
		url: "/download",
		type: "GET",
		success: function(data) {
			if(data.error) errorFunction(data.error);
			else {
				displayImages(data.result, function () {
					$("#result").html('<span style="color:green">Image(s) downloaded.</span>');
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

var errorFunction = function (error) {
	$("#result").html('<span style="color:red">'+error+'</span>');
}

var displayImages = function (result, callback) {
	console.log(result);
	var div, section, article, img, articleArr = [], sectionArr = [];
	result.forEach(function (url, i) {
		if(url.indexOf('.txt') == -1) {
			img = (i+1)+':&nbsp;'+url.split("/")[url.split("/").length-1]+'<br/><img src="'+url+'" id="img'+(i+1)+'" class="img-thumbnail" style="width: 700px; height: 500px" />';
		}
		article = '<article class="col-md-6">'+img+'</article>';
		articleArr.push(article);
		if(i % 2 != 0) {
			section = '<section class="row">'+articleArr.join('')+'</section>';
			sectionArr.push(section);
			articleArr = [];
		} else if(i == result.length-1) {
			section = '<section class="row">'+articleArr.join('')+'</section>';
			sectionArr.push(section);
			articleArr = [];
		}
	});
	div = sectionArr.join('');
	sectionArr = [];
	$('#image').html(div);
	callback();
}