var serviceURL = 'https://ouralum.com/api/v1/';

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        console.log('Received Device Ready Event');
        console.log('calling setup push');
        app.setupPush();
        //Check Login
        var oa_user_id = getStorage('oa_user_id');
        alert("USER1: " + oa_user_id);        
        if(oa_user_id !== null && oa_user_id !== false && oa_user_id !== '' && oa_user_id !== undefined) {
        	//alert("HERE THREE!");
        	$('#home-buttons').show();
        }
        else {
       	 	//alert("HERE FOUR!");
        	var html = '';
        	html = $('#login-section-template').html();
        	//alert("HTML: " + html);
        	$('#registration').html(html);
        	$('#home-buttons').hide();
        }
     

		
		
		
		//var myContact = navigator.contacts.create({"displayName": "Test User"});
        //myContact.note = "This contact has a note.";
        //alert("The contact, " + myContact.displayName + ", note: " + myContact.note);
//		var options = new ContactFindOptions();
	//	options.multiple = true;
       // options.filter = "";
        //var filter = ["displayName", "addresses", "emails", "phoneNumbers"];
      //  navigator.contacts.find(filter, onContactSuccess, onError, options);

    },
    setupPush: function() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "1020842847290"
            },
            "browser": {},
            "ios": {
                "sound": true,
                "vibration": true,
                "badge": true
            },
            "windows": {}
        });
        console.log('after init');

        push.on('registration', function(data) {
            console.log('registration event: ' + data.registrationId);

            var oldRegId = getStorage('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                setStorage('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
                var oa_user_id = getStorage('oa_user_id');
                if(oa_user_id == '' || oa_user_id == null) {
                	setUserToken(oa_user_id, data.registrationId);
                }
            }
        });

        push.on('error', function(e) {
            console.log("push error = " + e.message);
        });

        push.on('notification', function(data) {
            console.log('notification event');
            navigator.notification.alert(
                data.message,         // message
                null,                 // callback
                data.title,           // title
                'Ok'                  // buttonName
            );
       });
    }
};

function onContactSuccess(contacts) {
	//Must ajax back to site to compare contacts
/*
		$.ajax({
			type: "GET",
			url: "https://ouralum.com/api/v1/",
			success: function (data) {
				alert("YES");
			},
			error: 
		}) 
*/		
	var contacts_html = '<div id="clist"><p>Choose Who To Send An Invite To:</p><form><ul>';
	for (var i = 0; i < contacts.length; i++) {
		contacts_html += '<li>';
		contacts_html += '<span class="clist-select">';
		contacts_html += '<select name="import_' + i + '" id="import-' + i + '" data-role="flipswitch" data-mini="true" data-theme="b">';
		contacts_html += '<option value="off">No</option>';
		contacts_html += '<option value="on">Yes</option>';
		contacts_html += '</select>';
		contacts_html += '</span>';
		contacts_html += '<span class="clist-data">';
		contacts_html += '<span class="clist-name">' + contacts[i].displayName + '</span>';
		contacts_html += '<span class="clist-contact">';
		if(contacts[i].emails !== null) {
			contacts_html += contacts[i].emails[0].value + "<br>\n";	
		}
		if(contacts[i].phoneNumbers !== null) {
			contacts_html += contacts[i].phoneNumbers[0].value + "<br>\n";	
		}
		contacts_html += '</span>';
		contacts_html += '</span>';
		contacts_html += '</li>';
	}
	contacts_html += '</ul></form></div>';
	//var parentElement = document.getElementById('registration');
	//var receivedElement = parentElement.querySelector('.received');
	//document.getElementById('registration').innerHTML = contacts_html;
	//$("#lnkDialog").click();
	//$('#invite-members').find('[data-role="content"]').html(contacts_html);
	/*$('#invite-members').find('[data-role="content"]').html(contacts_html);
	$('#invite-members').find('.app').html(contacts_html);*/
	$('#contact-list').html(contacts_html);
}

// onError: Failed to get the contacts
//
function onError(contactError) {
	alert('onError!');
}

$(document).on( "click", ".loginBtn", function() {
	$.mobile.loading( "show" );
	var username = $('#user_name').val();
	var password = $('#user_password').val();
	//ajax for login...
	var request = $.ajax({
		url: serviceURL + 'login',
	  	method: "POST",
	  	data: { username : username, password : password },
	  	dataType: "html"
	});
	/* 
	request.complete(function( jqXHR, textStatus) {
		alert( "Request failed: " + textStatus + " - " + jqXHR.responseText);
		
	
	});
	*/
	request.done(function( data ) {
		//alert(data );
		obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			$.mobile.loading( "hide" );
			//login, save user...forward to home...
			setStorage('oa_user_id', obj.data.user_id);
			setStorage('oa_display_name', obj.data.display_name);
			$('#registration').html('');
        	$('#home-buttons').show();
			var token = getStorage('registrationId');
            setUserToken(obj.data.user_id, token);
            $.mobile.loading( "hide" );
		}
		else {
			//show error
			$('#login-form').prepend('<div class="alert alert-error"><span class="closebtn"><i class="fa fa-close"></i></span>' + obj.data + '</div>');
		}
		$.mobile.loading( "hide" );
	});
	 
	request.fail(function( jqXHR, textStatus, errorThrown ) {
	  	alert( "Request failed: " + textStatus + " - " + jqXHR.responseText);
	  	$.mobile.loading( "hide" );
	});
	
});

$(document).on( "click", ".logoutBtn", function() {
	$.mobile.loading( "show" );
	deleteStorage('oa_user_id');
	var html = $('#login-section-template').html();
	$('#registration').html(html);
    $('#home-buttons').hide();
    $.mobile.loading( "hide" );

});

$(document).on( "pagecreate", "#home", function(event) {
	var oa_user_id = getStorage('oa_user_id');
    alert("USER2: " + oa_user_id);        
    if(oa_user_id !== null && oa_user_id !== false && oa_user_id !== '' && oa_user_id !== undefined) {
    	//alert("HERE THREE!");
    	$('#home-buttons').show();
    }
});  
        
$(document).on( "pageshow", "#alumns-page", function(event) {
	//Get Alumns
	$.mobile.loading( "show" );
	var user_id = getStorage('oa_user_id');
	var request = $.ajax({
		url: serviceURL + 'alumns',
	  	method: "GET",
	  	data: { user_id : user_id },
	  	dataType: "html"
	});
	request.done(function( data ) {
		//alert(data );
		obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			$.mobile.loading( "hide" );
			var html = '<ul>';
			$.each( obj.data, function( key, value ) {
				//alert( key + ": " + value.group_id );
				html += '<li id="li-' + value.group_id + '">';
				html += '<span class="alumn-logo"><img src="https://ouralum.com/images/alum_group_images/' + value.group_logo + '"></span>';
				html += '<span class="alumn-title"><a href="alumn.html?id=' + value.group_id + '" data-role="none" data-transition="slide">' + value.group_name + '</a></span>';
				html += '<span class="alumn-count">' + value.member_count + ' members</span>';
				html += '</li>';
			});
			html += '</ul>';
            $('#alum-list').html(html);
		}
		else {
			//show error
			
		}
		$.mobile.loading( "hide" );
	});
	 
	request.fail(function( jqXHR, textStatus, errorThrown ) {
	  	alert( "Request failed: " + textStatus + " - " + jqXHR.responseText);
	  	$.mobile.loading( "hide" );
	});
	
});

/*
$(document).on( "pagecreate", "#alumn-page", function(event) {
	$.mobile.loading( "show" );
	var pathname = window.location.pathname;
	var id = getUrlParameter('id');
	alert(pathname);
	alert(id);
	//$('#alumn').html('YO');

});
*/

/*
$(document).on( "pagecreate", "#alumn-page", function(event) {

});
*/

$(document).on( "pageshow", "#alumn-page", function(event) {
	$.mobile.loading( "show" );
	$('#alumn').html('');
	var id = getUrlParameter('id');
	//alert("SHOW ID: " + id);
	var request = $.ajax({
		url: serviceURL + 'alumn',
	  	method: "GET",
	  	data: { id : id },
	  	dataType: "html"
	});
	request.done(function( data ) {
		alert(data );
		obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			$.mobile.loading( "hide" );
			var html = '';
			//
			html += '<div id="alum-title">' + obj.data.group_name + '</div>';
			if(obj.data.group_description != null && obj.data.group_description != '' && obj.data.group_description != 'null') {
				html += '<div id="alum-desc">' + obj.data.group_description + '</div>';
			}
			
			if(obj.data.posts != undefined) {
				html += '<div id="alum-posts">';
				html += '<h2>Alum Blog Posts</h2>';
				//alert(obj.data.posts);
				$.each( obj.data.posts, function( key, post ) {
					html += '<div class="alum-post">';
					html += '<div class="alum-post-title">' + post.title + '</div>';
					html += '<div class="alum-post-body">' + post.post_excerpt + '</div>';
					html += '<div class="alum-post-meta">Posted ' + post.post_date + ' by ' + post.display_name + '</div>';
					html += '</div>';
				});
				
				html += '</div>';
			}
			
			//alert(obj.data.composites);
			
			if(obj.data.composites != undefined) {
				html += '<div id="alum-comps">';
				html += '<h2>Alum Composites</h2>';
				$.each( obj.data.composites , function( key, composite ) {
					html += '<div class="alum-comp">';
					html += '<div class="alum-comp-img"><img src="' + composite.img_url + '"></div>';
					html += '<div class="alum-comp-meta">' + composite.title + '</div>';
					html += '</div>';
				});

				html += '</div>';
			}
			
			//alert(obj.data.photos);
			
			if(obj.data.photos != undefined) {
				html += '<div id="alum-photos">';
				html += '<h2>Alum Photos</h2>';
				$.each( obj.data.photos , function( key, photo ) {
					html += '<div class="alum-photo">';
					html += '<div class="alum-photo-img"><img src="' + photo.img_url + '"></div>';
					html += '<div class="alum-photo-meta">' + photo.caption + '</div>';
					html += '</div>';
				});

				html += '</div>';
			}
			
			html += '<div id="alum-map">';
			html += '<h2>Alum Member Map</h2>';
			html += '</div>';
			
			//alert(obj.data.members); 
			
			if(obj.data.members != undefined) {
				html += '<div id="alum-members">';
				html += '<h2>Alum Members</h2>';
				html += '<table><thead><tr><th>Member Name</th></tr></thead></tbody>';

				$.each( obj.data.members , function( key, member ) {
					//html += '<div class="alum-members">';
					//html += '<div class="alum-photo-img"><img src="' + photo.img_url + '"></div>';
					//html += '<div class="alum-photo-meta">' + photo.caption + '</div>';
					//html += '</div>';
					html += '<tr><td>' + member.first_name + ' ' + member.last_name + '</td></tr>';
				});
				html += '</tbody></table>';

				html += '</div>';
			}
			
			//alert(html);
			
            $('#alumn').html(html);
		}
		else {
			//show error
			
		}
		$.mobile.loading( "hide" );
	});
	 
	request.fail(function( jqXHR, textStatus, errorThrown ) {
	  	alert( "Request failed: " + textStatus + " - " + jqXHR.responseText);
	  	$.mobile.loading( "hide" );
	});
});

$(document).on( "pagecreate", "#invite-members", function(event) {
	//Get contact....
	var options = new ContactFindOptions();
	options.multiple = true;
	options.filter = "";
	var filter = ["displayName", "addresses", "emails", "phoneNumbers"];
	navigator.contacts.find(filter, onContactSuccess, onError, options);
});


$(document).on('click', '#inviteMembersBtn', function () {
	showModal('invite-members');
});

$(document).on('click', '.alert .closebtn', function () {
	$(this).parent('div').remove();
});




$(document).on('click', '[data-role="close"]', function () {
	hideModal($(this).parent('div').parent('div').attr('id'));
});

function setUserToken(oa_user_id, token) {
	//alert("USER: " + oa_user_id + " - TOKEN: " + token);
	var request = $.ajax({
		url: serviceURL + 'token',
	  	method: "POST",
	  	data: { user_id : oa_user_id , token: token },
	  	dataType: "html"
	});
	 
	request.done(function( data ) {
		alert(data);
		obj = $.parseJSON( data );
		if(obj.code === 1) {
			//
		}
		else {
			//show error
			
		}
	});
}

function showModal(id) {
	$('#' + id).show();
	$('body').append('<div class="page-overlay"></div>');
}

function hideModal(id) {
	$('#' + id).hide();
	$('.page-overlay').remove();
}

function setStorage(name, value){ 
	localStorage.setItem(name, value);
}

function getStorage(name) {

	if (localStorage.getItem(name) === 'null' || localStorage.getItem(name) === null || localStorage.getItem(name) === '') {
		//alert("NO VALUE");
		return false;
	}
	else {
		//alert("VALUE");
		return localStorage.getItem(name);
	}

	//var value = localStorage.getItem(name);
	//alert("VAL: " + value);
	        


	//return value;
}

function deleteStorage(name) {
	localStorage.removeItem(name);
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}

