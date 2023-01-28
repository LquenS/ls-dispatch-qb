$(document).ready(() => {
	window.addEventListener('message', function (event) {
		let data = event.data;
		if (data.update == 'newCall') {
			addNewCall(data.callID, data.timer, data.data, data.isPolice);
		} else if (data.update == "openDispatch") {
			openDISPATCH()
		}
	});
});

const MONTH_NAMES = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

function getFormattedDate(date, prefomattedDate = false, hideYear = false) {
	const day = date.getDate();
	const month = MONTH_NAMES[date.getMonth()];
	const year = date.getFullYear();
	const hours = date.getHours();
	let minutes = date.getMinutes();

	if (minutes < 10) {
		minutes = `0${minutes}`;
	}

	if (prefomattedDate) {
		return `${prefomattedDate} at ${hours}:${minutes}`;
	}

	if (hideYear) {
		return `${day}. ${month} at ${hours}:${minutes}`;
	}

	return `${day}. ${month} ${year}. at ${hours}:${minutes}`;
}

function timeAgo(dateParam) {
	if (!dateParam) {
		return null;
	}

	const date =
		typeof dateParam === 'object' ? dateParam : new Date(dateParam);
	const DAY_IN_MS = 86400000;
	const today = new Date();
	const yesterday = new Date(today - DAY_IN_MS);
	const seconds = Math.round((today - date) / 1000);
	const minutes = Math.round(seconds / 60);
	const isToday = today.toDateString() === date.toDateString();
	const isYesterday = yesterday.toDateString() === date.toDateString();
	const isThisYear = today.getFullYear() === date.getFullYear();

	if (seconds < 5) {
		return 'Just Now';
	} else if (seconds < 60) {
		return `${seconds} Seconds ago`;
	} else if (seconds < 90) {
		return 'About a minute ago';
	} else if (minutes < 60) {
		return `${minutes} Minutes ago`;
	} else if (isToday) {
		return getFormattedDate(date, 'Today');
	} else if (isYesterday) {
		return getFormattedDate(date, 'Yesterday');
	} else if (isThisYear) {
		return getFormattedDate(date, false, true);
	}

	return getFormattedDate(date);
}

function openDISPATCH() {
	clearTimeout(timeOut);
	clearTimeout(timeOutLate);

	if ($(`.dispatch-holder`).css("display") != "block" || !ControlMenu) {
		$(`.dispatch-holder`).show().addClass('animate__backInLeft').css("cursor", "grab");

		$(`.dispatch-holder`).draggable({
			start: function(e) {
				if ( e.ctrlKey ) {
					$(this).css("cursor", "grabbing");
					isDragging = true;
				}
				else
					return false
				
			},
			stop: function(e) {
				$(this).css("cursor", "grab");
				var x = e.pageX,
					y = e.pageY;

				console.log(x)
				localStorage.setItem("dispatch_holder_x", x);
				localStorage.setItem("dispatch_holder_y", y);
				isDragging = false;

				if (!e.ctrlKey) {
					$(`.dispatch-item-header-control`).hide();
				}
			}
		});
		if (GetCurrentPage() != undefined)
			$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: GetCurrentPage().callId }));
		else
			$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: undefined }));
		clearTimeout(timeOut);
		clearTimeout(timeOutLate);
		ControlMenu = true;
	} else {
		if ($( ".dispatch-holder" ).data('ui-draggable')) {
			$( ".dispatch-holder" ).draggable( "destroy" ).css("cursor", "default");
		} else {
			$( ".dispatch-holder" ).css("cursor", "default");
		}

		$.post("https://ls-dispatch/disableDispatchMenu", JSON.stringify({ }));

		$(`.dispatch-holder`).addClass('animate__backOutLeft');
		setTimeout(() => {
			$(`.dispatch-holder`).removeClass('animate__backInLeft').removeClass('animate__backOutLeft').hide();
			ControlMenu = false;
			$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: undefined }));
		}, 1000);
	}
}

var ControlMenu = false
var start=0;
var isDragging = false;
$(document).keyup(function(e) {
    if(e.keyCode == 75) {
        elapsed = new Date().getTime();
        if(elapsed-start<=500){
			openDISPATCH()

			start = 0;
			elapsed = 0;
        }
        start=elapsed;
    }
});


$(document).keyup(function(e) {
    if(e.keyCode == 17) {
		if (!isDragging) {
			$(`.dispatch-item-header-control`).hide();
		}
    }
});

$(document).keydown(function(e) {
    if(e.keyCode == 17) {
		if (ControlMenu) {
			$(`.dispatch-item-header-control`).show();
		}
    }
});

function addNewCall(callID, timer, info, isPolice) {
	clearTimeout(timeOut);
	clearTimeout(timeOutLate);

	var prio = info['priority'];

	var DispatchItem;
	if (info['isDead']) {
		DispatchItem = `<div class="dispatch-item ${callID} page-id-${callID} dispatch-item-${info['isDead']}" id="page-id-${callID}"><div class="top-info-holder"><div class="call-id">#${callID}</div><div class="call-code priority-${prio}">${info.dispatchCode}</div><div class="call-name">${info.dispatchMessage}</div></div><div class="bottom-info-holder">`;
	} else {
		DispatchItem = `<div class="dispatch-item ${callID} page-id-${callID} dispatch-item-${isPolice}" id="page-id-${callID}"><div class="top-info-holder"><div class="call-id">#${callID}</div><div class="call-code priority-${prio}">${info.dispatchCode}</div><div class="call-name">${info.dispatchMessage}</div></div><div class="bottom-info-holder">`;
	}

	// Above we are defining a default dispatch item and then we will append the data we have been sent.

	if (info['time']) {
		DispatchItem += `<div class="call-bottom-info call-bottom-time-${callID}"><span class="fas fa-clock"></span>${timeAgo(info['time'])}</div>`;
	}

	if (info['firstStreet']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-map-pin"></span>${info['firstStreet']}</div>`;
	}

	if (info['heading']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-share"></span>${info['heading']}</div>`;
	}

	if (info['callsign']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-solid fa-eye"></span>${info['callsign']}</div>`;
	}

	if (info['doorCount']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-door-open"></span>${info['doorCount']}</div>`;
	}

	if (info['weapon']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-bullseye"></span>${info['weapon']}</div>`;
	}

	if (info['camId']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-camera">	</span>${info['camId']}</div>`;
	}

	if (info['gender']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-genderless"></span>${info['gender']}</div>`;
	}

	if (info['model'] && info['plate']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-car"></span>${info['model']}<span class="fas fa-digital-tachograph" style="margin-left: 2vh;"></span>${info['plate']}</div>`;
	} else if (info['plate']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-digital-tachograph"></span>${info['plate']}</div>`;
	} else if (info['model']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-car"></span>${info['model']}</div>`;
	}

	if (info['firstColor']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-spray-can"></span>${info['firstColor']}</div>`;
	}
	if (info['automaticGunfire'] == true) {
		DispatchItem += `<div class="call-bottom-info"><span class="fab fa-blackberry"></span>Automatic Gunfire</div>`;
	}

	if (info['name'] && info['number']) {
		DispatchItem += `<div class="call-bottom-info"><span class="far fa-id-badge"></span>${info['name']}<span class="fas fa-mobile-alt" style="margin-left: 2vh;"></span>${info['number']}</div>`;
	} else if (info['number']) {
		DispatchItem += `<div class="call-bottom-info"><span class="fas fa-mobile-alt"></span>${info['number']}</div>`;
	} else if (info['name']) {
		DispatchItem += `<div class="call-bottom-info"><span class="far fa-id-badge"></span>${info['name']}</div>`;
	}

	if (info['information']) {
		DispatchItem += `<div class="line"></div><div class="call-bottom-info call-bottom-information"><span class="far fa-question-circle"></span>${info['information']}</div>`;
	}

	DispatchItem += `<div class="line"></div><div class="call-bottom-info call-bottom-respond"><span class="response-button">G</span> Respond</div>`;

	DispatchItem += `</div></div>`;

	var VISIBLE = $(`.dispatch-holder`).css("display")
	$('.dispatch-holder').addClass("animate__animated").show().prepend(DispatchItem);

	var NEW_INFO = JSON.parse(JSON.stringify(info))
	$(`#page-id-${callID}`).data("DispatchData", NEW_INFO);

	var timer = 4000;

	if (prio == 1) {
		timer = 12000;
	} else if (prio == 2) {
		timer = 9000;
	}

	maxpage = $(`.dispatch-item`).length
	if (currentpage > 1)
		currentpage++;
	
	SetPage()
	$(`.page-number`).html(`${currentpage} / ${$(`.dispatch-item`).length}`)


	$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: GetCurrentPage().callId }));
	if (!ControlMenu) {
		if ($( ".dispatch-holder" ).data('ui-draggable')) {
			$( ".dispatch-holder" ).draggable( "destroy" ).css("cursor", "default");
		} else {
			$( ".dispatch-holder" ).css("cursor", "default");
		}

		if (VISIBLE == "none") {
			$(`.dispatch-holder`).addClass('animate__backInLeft');
		}
		timeOut = setTimeout(() => {
			$(`.dispatch-holder`).addClass('animate__backOutLeft');
			timeOutLate = setTimeout(() => {
				$(`.dispatch-holder`).removeClass('animate__backInLeft').removeClass('animate__backOutLeft').hide();
				$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: undefined }));
			}, 1000);
		}, timer || 4500);
	}
}

var timeOut = null;
var timeOutLate = null;

setInterval(function(){
	var page = GetCurrentPage()
	if (page != null)
		$(`.call-bottom-time-${page.callId}`).html(`<span class="fas fa-clock"></span>${timeAgo(page.time)}`)
}, 1000)

setInterval(function(){
	$(`.dispatch-item`).each(function(key, value) {
		var DispatchData =$(value).data("DispatchData")
		var MIN =  Math.round(Math.round((new Date() - new Date(DispatchData.time)) / 1000) / 60);
		console.log(MIN)
		if (MIN > 10)
			$(value).remove();
	})
}, 1 * 60 * 1000);

function SetPage() {
	$(`.dispatch-item`).each(function(key, value) {
		if (currentpage != key + 1) {
			$(value).hide()
		} else {
			var page = GetCurrentPage()

			$(value).show()
			$(`.call-bottom-time-${page.callId}`).html(`<span class="fas fa-clock"></span>${timeAgo(page.time)}`)
		}
	});
	$(`.page-number`).html(`${currentpage} / ${$(`.dispatch-item`).length}`);

	if (GetCurrentPage() != undefined)
		$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: GetCurrentPage().callId }));
	else
		$.post("https://ls-dispatch/enableRespond", JSON.stringify({ callId: undefined }));
}

function GetCurrentPage() {
	var page = null;
	$(`.dispatch-item`).each(function(key, value) {
		if (currentpage == key + 1) {
			var PAGE_ID = $(value).find('.top-info-holder').find('.call-id').html().replace(`#`, "")
			page = $(`.page-id-${PAGE_ID}`).data("DispatchData")
		}
	});
	return page;
}

setTimeout(function() {
	$(`.page-prev > span`).click(function() {
		if (currentpage < maxpage) {
			currentpage++;
			SetPage();
		}
	});
	$(`.page-next > span`).click(function() {
		if (currentpage > 1) {
			currentpage--;
			SetPage();
		}
	});

	if (localStorage.getItem("dispatch_holder_x") != undefined) {
		var DISPATCH_X = localStorage.getItem("dispatch_holder_x"),
			DISPATCH_Y = localStorage.getItem("dispatch_holder_y");


		$(`.dispatch-holder`).css({"left": DISPATCH_X+"px", "top": DISPATCH_Y+"px"})
	}
}, 5)


var currentpage = 1;
var maxpage = 0;