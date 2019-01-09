PARK = "ZNS";
var app = angular.module('app', ['ui.router']);
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('default', {
			url: '/',
			templateUrl: 'template/park-brief.html'
		})
		.state('natural-landscape', {
			url: '/natural-landscape',
			templateUrl: 'template/natural-landscape.html'
		})
		.state('human-landscape', {
			url: '/human-landscape',
			templateUrl: 'template/human-landscape.html'
		})
		.state('scientific-research', {
			url: '/scientific-research',
			template: '这是打印机页面3'
		})
		.state('user-center-pwd', {
			url: '/user-center/pwd',
			templateUrl: 'template/user-center-pwd.html',
			controller: 'pwdController',
			cache: false
		})
		.state('user-center-park', {
			url: '/user-center/park/{action}',
			templateUrl: 'template/user-center-park.html',
			controller: 'parkController',
			cache: false
		})
		.state('scenic-spots', {
			url: '/scenic-spots/{spot_id}?key',
			templateUrl: 'template/scenic-spots.html',
			controller: 'spotsController',
			cache: false
		})
		.state('relics-create', {
			url: '/scenic-spots/{spot_id}/relic/create',
			templateUrl: 'template/relic-create.html',
			controller: 'relicsCreateController',
			cache: false
		})
		.state('relics-details', {
			url: '/scenic-spots/{spot_id}/view/{id}',
			templateUrl: 'template/relic-detail.html',
			controller: 'relicsDetailController',
			cache: false
		})
		.state('relics-edit', {
			url: '/scenic-spots/{spot_id}/edit/{id}',
			templateUrl: 'template/relic-edit.html',
			controller: 'relicsEditController',
			cache: false
		})
		.state('no-data', {
			url: '/no-data',
			templateUrl: 'template/no-data.html',
			controller: 'noDataCtrl',
			cache: false
		});

	$urlRouterProvider.otherwise('/');
	$urlRouterProvider.when('login', "index.html");
}]);

app.factory('filterServ', function() {
	return {
		filter: function(id, list) {
			if(!id) {
				return list;
			}
			var t = 0;
			angular.forEach(list, function(v, i) {
				if(v.id == id) {
					t = i;
				}
			});
			return list[t];
		}
	}
});

app.factory("requestServ", function() {
	return {
		get: function(url) {
			var result = {};
			$.ajax({
				type: "get",
				url: url,
				dataType: "json",
				async: false,
				success: function(responseData, textStatus, XHRObj) {
					result = responseData;
				},
				error: function(XHRObj, textStatus, errorThrown) {
					if(XHRObj.status == 403) {
						window.location.href = "index.html";
					}
				},
				complete: function(XHRObj, textStatus) {

				}
			});
			return result;
		},
		post: function(url, data) {
			var result = {};
			$.ajax({
				type: "post",
				url: url,
				dataType: "json",
				async: false,
				contentType: "application/json",
				data: JSON.stringify(data),
				success: function(responseData, textStatus, XHRObj) {
					result.status = XHRObj.status;
					result.responseData = responseData;
				},
				error: function(XHRObj, textStatus, errorThrown) {
					if(XHRObj.status == 403) {
						window.location.href = "index.html";
					}
					result.status = XHRObj.status;
				},
				complete: function(XHRObj, textStatus) {

				}
			});
			return result;
		}
	};
});

app.factory('getLoginInfo', ['requestServ', function(requestServ) {
	return function() {
		var curentUserId = window.location.search.split("?")[1];
		return requestServ.get("/GeologyService/user/v1/" + curentUserId);
		return userInfo.parentId;
	}
}]);

app.controller('spotsController', ['$scope', 'filterServ', '$stateParams', '$state', 'getLoginInfo', 'requestServ', function($scope, filterServ, $stateParams, $state, getLoginInfo, requestServ) {
	var userInfo = getLoginInfo();
	var jqListData = requestServ.get("/GeologyService/park/v1/spots?owner=" + userInfo.parentId);
	if(jqListData.length == 0) {
		$state.go("no-data");
		return;
	}
	$scope.isHideCreate = userInfo.parentId != userInfo.id;
	$scope.spotsList = jqListData;
	if($stateParams.spot_id == 1) {
		$scope.currentId = jqListData[0].id;
	} else {
		$scope.currentId = $stateParams.spot_id;
	}

	var dataObj = filterServ.filter($scope.currentId, jqListData);
	$scope.spotsName = dataObj.name;
	$scope.spotsID = dataObj.id;
	$scope.viewDetails = function(jqId, relicId) {
		$state.go("relics-details", {
			spot_id: jqId,
			id: relicId
		});
		return;
	};

	//按景区ID查询遗址  分页
	var relicsByPage = requestServ.get("/GeologyService/v1/relic/" + $scope.currentId);
	if($stateParams.key != undefined) {
		alert(123)
	}

	var resultArray = [];
	var relics = relicsByPage.relics;
	if(relics != undefined) {
		for(var i = 0; i < relics.length; i += 4) {
			resultArray.push(relics.slice(i, i + 4));
		}
	}
	var page = {};
	page.maxPage = 1;
	$scope.page = page;
	if(relicsByPage.page != undefined) {
		$scope.page = relicsByPage.page;
	}
	$scope.relicList = resultArray;

}]);

app.controller('relicsDetailController', ['$scope', 'filterServ', '$stateParams', '$state', 'requestServ', 'getLoginInfo', function($scope, filterServ, $stateParams, $state, requestServ, getLoginInfo) {
	var userInfo = getLoginInfo();
	var jqListData = requestServ.get("/GeologyService/park/v1/spots?owner=" + userInfo.parentId);
	if(jqListData.length == 0) {
		$state.go("no-data");
		return;
	}
	$scope.isHideEdit = userInfo.parentId != userInfo.id;
	$scope.spotsList = jqListData;

	$scope.relicId = $stateParams.spot_id;
	var dataObj = filterServ.filter($scope.relicId, jqListData);
	$scope.spotsName = dataObj.name;
	$scope.spotsID = dataObj.id;

	//按遗址ID查询
	var data = requestServ.get("/GeologyService/v1/relic/" + $stateParams.spot_id + "/" + $stateParams.id);
	$scope.relicName = data.name;
	$scope.relicDetails = data;
	var picList = [];
	if(data.pic != undefined) {
		picList = JSON.parse(data.pic);
	}

	if(picList.length > 3) {
		$scope.hidePage = false;
		var maxPage = Math.ceil(picList.length / 3);
		var pageList = [];
		for(var i = 0; i < maxPage; i++) {
			pageList[i] = i + 1;
		}
		$scope.pageList = pageList;

	} else {
		$scope.hidePage = true;
	}

	$scope.showList = picList.slice(0, 3);

	$scope.pageTo = function(num) {
		$scope.showList = picList.slice(num * 3, num * 3 + 3);
	}

	$scope.valuesToModal = function() { //增加分页后要把页码值传来
		$("#h4").html("确定要删除 <i>" + data.name + "</i> 这项吗？");
		$("#hidespan").html(data.id + "," + data.scenicSpotsId);
	};

}]);

app.controller('relicsEditController', ['$scope', 'filterServ', '$stateParams', '$state', 'getLoginInfo', 'requestServ', function($scope, filterServ, $stateParams, $state, getLoginInfo, requestServ) {
	var userInfo = getLoginInfo();
	var jqListData = requestServ.get("/GeologyService/park/v1/spots?owner=" + userInfo.parentId);
	if(jqListData.length == 0) {
		$state.go("no-data");
		return;
	}
	$scope.editSubmit = userInfo.parentId != userInfo.id;
	$scope.spotsList = jqListData;
	$scope.spotId = $stateParams.spot_id;
	$scope.updateSpotId = $stateParams.spot_id;
	var dataObj = filterServ.filter($scope.spotId, jqListData);
	$scope.spotsName = dataObj.name;

	//按遗址ID查询
	var data = requestServ.get("/GeologyService/v1/relic/" + $stateParams.spot_id + "/" + $stateParams.id);
	$scope.relicName = data.name;
	$scope.relicDetails = data;

	var picList = [];
	if(data.pic != undefined) {
		picList = JSON.parse(data.pic);
	}

	if(picList.length > 3) {
		$scope.hidePage = false;
		var maxPage = Math.ceil(picList.length / 3);
		var pageList = [];
		for(var i = 0; i < maxPage; i++) {
			pageList[i] = i + 1;
		}
		$scope.pageList = pageList;

	} else {
		$scope.hidePage = true;
	}

	$scope.showList = picList.slice(0, 3);

	var tempNum = 0;
	$scope.pageTo = function(num) {
		$scope.showList = picList.slice(num * 3, num * 3 + 3);
		tempNum = num;
	}

	var deleteImgList = [];
	$scope.removeImg = function(e) {
		var imgSrc = $(e.target).parent().next().attr("src");
		//$(e.target).parent().parent().parent().remove();
		var index = picList.indexOf(imgSrc);
		if(index > -1) {
			picList.splice(index, 1);
			deleteImgList.push(imgSrc);
		}
		if(picList.length > 3) {
			$scope.hidePage = false;
			var maxPage = Math.ceil(picList.length / 3);
			var pageList = [];
			for(var i = 0; i < maxPage; i++) {
				pageList[i] = i + 1;
			}
			$scope.pageList = pageList;

		} else {
			$scope.hidePage = true;
		}
		$scope.showList = picList.slice(tempNum * 3, tempNum * 3 + 3);
		if($scope.showList.length < 1) {
			tempNum -= 1;
			$scope.showList = picList.slice(tempNum * 3, tempNum * 3 + 3);
		}
		console.log("picList after remove = " + picList);
		console.log("to be delete pic = " + deleteImgList);
	};

	$scope.doEdit = function() {
		console.log("doEdit")
		var form = new FormData(document.getElementById("uploadFm"));
		if(document.getElementById("uploadFm").children[0].value != '') {
			$.ajax({
				url: "/GeologyService/image/v1/upload/" + userInfo.id + "/" + $scope.spotId + "/" + $stateParams.id,
				type: "post",
				data: form,
				processData: false,
				contentType: false,
				async: false,
				success: function(data) {
					console.log("img upload success!");
					for(var i = 0; i < data.location.length; i++) {
						picList.push(data.location[i]);
					}
					console.log("final update image =" + picList);
				},
				error: function(XHRObj, textStatus, errorThrown) {
					if(XHRObj.status == 403) {
						window.location.href = "index.html";
					}
				}
			});
		}

		var updateObj = {};
		if($scope.updateSpotId != $scope.spotId) {
			updateObj.scenicSpotsIdForUpdate = $scope.updateSpotId;
		}

		if(picList.length > 0) {
			updateObj.sPic = picList[0];
			updateObj.pic = picList;
		} else {
			updateObj.sPic = "/upload/nopic.png";
		}
		updateObj.scenicSpotsId = $stateParams.spot_id;
		updateObj.bh = $("td[contenteditable='true']")[0].innerHTML;
		updateObj.name = $("td[contenteditable='true']")[1].innerHTML;
		if(updateObj.bh == '' || updateObj.name == '') {
			$("#modal-alert").modal('show');
			return;
		}
		updateObj.category = $("td[contenteditable='true']")[2].innerHTML;
		updateObj.coordinate = $("td[contenteditable='true']")[3].innerHTML;
		updateObj.descr = $("td[contenteditable='true']")[4].innerHTML;
		updateObj.deleteImg = deleteImgList;
		var res = requestServ.post("/GeologyService/v1/relic/" + $stateParams.id, updateObj);
		if(res.status == 200) {
			console.log("update success!");
			$state.go("relics-details", {
				spot_id: $scope.updateSpotId,
				id: $stateParams.id
			});
			//清除数据
			return;
		}
	};
}]);

app.controller('relicsCreateController', ['$scope', 'filterServ', '$stateParams', '$state', 'getLoginInfo', 'requestServ', function($scope, filterServ, $stateParams, $state, getLoginInfo, requestServ) {
	var userInfo = getLoginInfo();
	var jqListData = requestServ.get("/GeologyService/park/v1/spots?owner=" + userInfo.parentId);
	if(jqListData.length == 0) {
		$state.go("no-data");
		return;
	}
	$scope.spotsList = jqListData;
	$scope.spotId = $stateParams.spot_id;
	var dataObj = filterServ.filter($scope.spotId, jqListData);
	$scope.spotsName = dataObj.name;
	$scope.relicName = "添加遗址信息";

	$scope.doCreate = function() {
		//先创建基本信息，再根据返回的relicId，上传图片并更新到数据表
		var relicBody = {};
		relicBody.bh = $("td[contenteditable='true']")[0].innerHTML;
		relicBody.name = $("td[contenteditable='true']")[1].innerHTML;
		if(relicBody.bh == '' || relicBody.name == '') {
			$("#modal-alert").modal('show');
			return;
		}
		relicBody.category = $("td[contenteditable='true']")[2].innerHTML;
		relicBody.coordinate = $("td[contenteditable='true']")[3].innerHTML;
		relicBody.descr = $("td[contenteditable='true']")[4].innerHTML;
		relicBody.scenicSpotsId = $stateParams.spot_id;
		var data = requestServ.post("/GeologyService/v1/relic", relicBody);
		if(data.status != 200) {
			alert("创建失败");
			return;
		}
		var relicId = data.responseData.id;
		var form = new FormData(document.getElementById("uploadFm"));
		if(document.getElementById("uploadFm").children[0].value != '') {
			$.ajax({
				url: "/GeologyService/image/v1/upload/" + userInfo.id + "/" + $scope.spotId + "/" + relicId,
				type: "post",
				data: form,
				processData: false,
				contentType: false,
				success: function(data) {
					console.log("img upload success!")
					var updateObj = {};
					updateObj.sPic = data.location[0];
					updateObj.pic = data.location;
					updateObj.scenicSpotsId = $stateParams.spot_id;
					var res = requestServ.post("/GeologyService/v1/relic/" + relicId, updateObj);
					if(res.status == 200) {
						console.log("img info update success!");
						gotoDetailPage(relicId);
						return;
					}
				},
				error: function(XHRObj, textStatus, errorThrown) {
					if(XHRObj.status == 403) {
						window.location.href = "index.html";
					}
					console.log("img upload failed!")
				}
			});
		} else {
			gotoDetailPage(relicId);
			return;
		}
	};

	function gotoDetailPage(relicId) {
		$state.go("relics-details", {
			spot_id: $scope.spotId,
			id: relicId
		});
		//清除数据
		document.getElementById("uploadFm").children[0].value = '';
		$("td[contenteditable='true']")[0].innerHTML = '';
		$("td[contenteditable='true']")[1].innerHTML = '';
		$("td[contenteditable='true']")[2].innerHTML = '';
		$("td[contenteditable='true']")[3].innerHTML = '';
		$("td[contenteditable='true']")[4].innerHTML = '';
	}

}]);

app.controller("pwdController", ['$scope', '$stateParams', 'getLoginInfo', function($scope, $stateParams, getLoginInfo) {
	$scope.changePwd = function(aa) {

	}
}]);
app.controller("noDataCtrl", ['$scope', '$stateParams', 'getLoginInfo', function($scope, $stateParams, getLoginInfo) {

}]);
app.controller("parkController", ['$scope', '$stateParams', 'getLoginInfo', 'requestServ', function($scope, $stateParams, getLoginInfo, requestServ) {
	var userInfo = getLoginInfo()
	var userId = userInfo.id;
	var pattern = /^[\u4E00-\u9FA5A-Za-z]{1,20}$/;
	$scope.hiddenCreate = true;
	$scope.hiddenList = false;
	if($stateParams.action == 'jq') {
		$scope.actionUrl = "jq-create";
		$scope.btnName = "创建景区";
		$scope.actionName = '景区管理';
		var jqInfo = requestServ.get("/GeologyService/park/v1/spots?owner=" + userId);
		if(jqInfo.length > 0) {
			$scope.hideNoData = true;
		}
		$scope.dataList = jqInfo;
	} else if($stateParams.action == 'jq-create') {
		$scope.actionName = '创建景区';
		$scope.hiddenCreate = false;
		$scope.hiddenList = true;
		$scope.create = function() {
			var spotName = $("#spotName").val();
			if(!pattern.test(spotName)) {
				$("#labMsg").addClass("label-warning").html("请输入正确名称！");
				return;
			};
			var createObj = {};
			createObj.name = spotName;
			createObj.owner = userId;
			createObj.parkId = PARK;
			createObj.info = $("#spotDesc").val();
			var result = requestServ.post("/GeologyService/park/v1/spot", createObj);
			if(result.status == 200) {
				$("#labMsg").addClass("label-success").html("添加成功！");
				$("#spotName").val("");
				$("#spotDesc").val("");
			} else {
				$("#labMsg").addClass("label-warning").html("添加失败！");
			}
		}

	} else if($stateParams.action == 'zr') {
		$scope.actionUrl = "zr-create";
		$scope.btnName = "创建自然景观";
		$scope.actionName = '自然景观';
		var jqInfo = requestServ.get("/GeologyService/park/v1/zr?owner=" + userId);
		console.log(jqInfo.length)
		if(jqInfo.length > 0) {
			$scope.hideNoData = true;
		}
		$scope.dataList = jqInfo;
	} else if($stateParams.action == 'zr-create') {
		$scope.actionName = '创建自然景观';
		$scope.hiddenCreate = false;
		$scope.hiddenList = true;
		$scope.create = function() {
			var spotName = $("#spotName").val();
			if(!pattern.test(spotName)) {
				$("#labMsg").addClass("label-warning").html("请输入正确名称！");
				return;
			};
			var createObj = {};
			createObj.name = spotName;
			createObj.owner = userId;
			createObj.parkId = PARK;
			createObj.info = $("#spotDesc").val();
			var result = requestServ.post("/GeologyService/park/v1/spot", createObj);
			if(result.status == 200) {
				$("#labMsg").addClass("label-success").html("添加成功！");
				$("#spotName").val("");
				$("#spotDesc").val("");
			} else {
				$("#labMsg").addClass("label-warning").html("添加失败！");
			}
		}
	}

	$scope.clearMsg = function() {
		$("#labMsg").html("");
	};

}]);
app.controller('navbarCtrl', ['$scope', 'getLoginInfo', 'requestServ', function($scope, getLoginInfo, requestServ) {
	var userInfo = getLoginInfo();
	$scope.loginUser = userInfo.userName;
	$scope.rights = userInfo.roleType == 0;
	$scope.navbarActiveIndex = -1;
	$scope.index = function(index) {
		$scope.navbarActiveIndex = index;
	};
}]);

//点击模态框事件
$(document).on('click', '#quit', function() {
	//清除缓存session
	window.location.href = "index.html";
});
$(document).on('click', '#deleteItem', function() {
	//掉删除接口 /relics/{spotId}/delete/{relicId}
	var param = $("#hidespan").html().split(",");
	var spotId = param[1];
	var relicId = param[0];
	console.log("spotId=" + spotId);
	console.log("relicId=" + relicId);
	$("#modal-container-850813").modal('hide');
	window.location.href = "#!/scenic-spots/" + spotId;
});

function getValue(e) {
	for(var i = 0; i < 3; i++) {
		$("#photoCover" + i).html("").removeClass("label-success").attr("title", "");
	}
	var fileList = e.files;

	if(fileList.length > 3) {
		$("#photoCover0").html(fileList.length + "张图片已选择").addClass("label-success");
		var str = "";
		var flag = false;
		for(var i = 0; i < fileList.length; i++) {
			if(fileList[i].size > 1024 * 1024) {
				str += fileList[i].name + " 图片超过1M\n-----------\n";
			} else {
				str += fileList[i].name + "\n";
			}

		}
		$("#photoCover0").attr("title", str);

	} else {
		for(var i = 0; i < fileList.length; i++) {
			if(fileList[i].size > 1024 * 1024) {
				$("#photoCover" + i).addClass("label-important");
				$("#photoCover" + i).attr("title", "图片超过1M");
			} else {
				$("#photoCover" + i).addClass("label-success")
			}
			$("#photoCover" + i).html(fileList[i].name)
		}
	}

}

// 给img图片标签添加onClick=“bigImg（this）”事件
function bigImg(obj) {
	var image = new Image(); //创建一个image对象
	var path = obj.src;
	image.src = path; //新创建的image添加src
	var width = image.width; // 获取原始图片的宽
	var hight = image.height; // 获取原始图片高
	$("#bigImg").attr('src', path).css("cursor", "zoom-out");
	$(".show-bigImg").css({
		"margin-top": -hight / 2,
		"margin-left": -width / 2
	}); // 居中；css中使用了fixed定位top：50%；left：50%；
	$(".mengceng").css("display", "block");

}
// 点击放大图片关闭
function closeImg(obj) {
	$("#bigImg").attr('src', "");
	$(".mengceng").css("display", "none");
}

function enterImg(e) {
	$(e).prev().css("display", "block");

}

function leaveImg(e) {
	$(e).prev().css("display", "none");

}

function closeIn(e) {
	$(e).css("display", "block");
}

function closeOut(e) {
	$(e).css("display", "none");
}