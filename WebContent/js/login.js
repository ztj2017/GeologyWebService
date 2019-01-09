$().ready(function() {
	function compileStr(code) {
		var c = String.fromCharCode(code.charCodeAt(0) + code.length);
		for(var i = 1; i < code.length; i++) {
			c += String.fromCharCode(code.charCodeAt(i) + code.charCodeAt(i - 1));
		}
		return escape(c);
	};
	$("#login_form").validate({
		rules: {
			username: "required",
			password: {
				required: true
			},
		},
		messages: {
			username: "请输入姓名&nbsp",
			password: {
				required: "请输入密码"
			},
		},
		errorPlacement: function(error, element) { //错误信息位置设置方法 
			error.appendTo($("#msg")); //这里的element是录入数据的对象 
		},
		submitHandler: function(form) {
			var data = {};
			data.userName = $("#username").val();
			data.passPharse = $("#pwd").val();
			$.ajax({
				type: "post",
				url: "/GeologyService/user/v1/login",
				dataType: "json",
				contentType: "application/json",
				async: false,
				data: JSON.stringify(data),
				success: function(responseData, textStatus, XHRObj) {
					window.location.href = "main.html?" + responseData.id;
				},
				error: function(XHRObj, textStatus, errorThrown) {
					if(XHRObj.status == 400){
						$("#msg").html("登陆失败.");
					}
					else{
						$("#msg").html("服务器内部出错.");
					}
					
				},
				complete: function(XHRObj, textStatus) {
					$("#pwd").val("");
				}
			});

		}
	});
});