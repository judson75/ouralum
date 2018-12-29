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
        alert("USER: " + oa_user_id);
        if(oa_user_id == '' || oa_user_id == null) {
        	var html = $('#login-section-template').html();
        	alert("HTML: " + html);
        	$('#registration').html(html);
        	$('#home-buttons').hide();
        }
        else {
        	alert("HERE TOO!");
        	$('#home-buttons').show();
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
	var username = $('#user_name').val();
	var password = $('#user_password').val();
	//ajax for login...
	var request = $.ajax({
		url: serviceURL + 'login',
	  	method: "POST",
	  	data: { username : username, password : password },
	  	dataType: "html"
	});
	 
	request.done(function( data ) {
		alert(data );
		obj = $.parseJSON( data );
		if(obj.code === 1) {
			//login, save user...forward to home...
			setStorage('oa_user_id', obj.data.user_id);
			$('#registration').html('');
        	$('#home-buttons').show();
			var token = getStorage('registrationId');
            setUserToken(oa_user_id, token);
		}
		else {
			//show error
			
		}
	});
	 
	request.fail(function( jqXHR, textStatus ) {
	  alert( "Request failed: " + textStatus );
	});
});

$(document).on( "click", ".logoutBtn", function() {
	deleteStorage('oa_user_id');
	var html = $('#login-section-template').html();
	$('#registration').html(html);
    $('#home-buttons').hide();

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

$(document).on('click', '[data-role="close"]', function () {
	hideModal($(this).parent('div').parent('div').attr('id'));
});

function setUserToken(oa_user_id, token) {
	var request = $.ajax({
		url: serviceURL + 'token',
	  	method: "POST",
	  	data: { user_id : oa_user_id , token: token },
	  	dataType: "html"
	});
	 
	request.done(function( data ) {
		alert(data );
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
	var value = localStorage.getItem(name);
	return value;
}

function deleteStorage(name) {
	localStorage.removeItem(name);
}

