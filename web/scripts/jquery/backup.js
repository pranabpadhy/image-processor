var backupReady = function() {
	$('#result').html('<span style="color:green">Upload your images.</span><br/><br/>');
	$('#upload').change(function (event) {
		upload(event);
	});
}

var errorMsg = function (error) {
	$("#result").html('<span style="color:red">'+error+'</span>');
}

var upload = function (event) {
	$("#result").html('');
	var imageFiles = event.target.files;
	var data = new FormData();
	for(var i=0; i<imageFiles.length; i++) {
		var file = imageFiles[i];
		if(!file.type.match('image.*')) return errorMsg("Please Only Select Images...");
		else {
			data.append('image', file, file.name);
			$.ajax({
				url: '/upload',
				data: data,
				type: 'POST',
				contentType: false,
				processData: false,
				success: function (result) {
					console.log('result:', result);
					console.log(i);
					if(result.error) return errorMsg("Coudn't get the files");
					else {
						var res = result.result;
						html = '<span style="color:green">'+res+' uploaded.</span><br/>';
						$("#result").append(html);
					}
				}					
			});
		}
    }
}