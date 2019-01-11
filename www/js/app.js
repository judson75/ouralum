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
       // alert("USER1: " + oa_user_id);        
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
    //alert("USER2: " + oa_user_id);        
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
		var obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			$.mobile.loading( "hide" );
			var html = '<ul>';
			$.each( obj.data, function( key, value ) {
				//alert( key + ": " + value.group_id );
				//alert(value.group_logo);
				html += '<li id="li-' + value.group_id + '">';
				html += '<span class="alumn-logo">';
				if(value.group_logo !== '' && value.group_logo !== null) {
					html += '<img src="https://ouralum.com/images/alum_group_images/' + value.group_logo + '">';
				}
				else {
					//get initials from name
					var words = value.group_name.split(" ", 3),
						i;
					var init = '';
					for (i = 0; i < words.length; i++) {
						init += words[i].charAt(0);
					}
					html += '<span class="alumn-init">' + init + '</span>';
					
				}
				html += '</span>';
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

$(document).on( "pageshow", "#alumn-page", function(event) {
	$.mobile.loading( "show" );
	$('#alumn').html('');
	var id = getUrlParameter('id');
	var user_id = getStorage('oa_user_id');
	//alert("SHOW ID: " + id);
	var request = $.ajax({
		url: serviceURL + 'alumn',
	  	method: "GET",
	  	data: { id : id },
	  	dataType: "html"
	});
	request.done(function( data ) {
		//alert(data );
		var obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			var html = '';
			//
			html += '<div id="alum-title">' + obj.data.group_name + '</div>';
//alert("DESC: " + obj.data.group_description);
			if(obj.data.group_description !== null && obj.data.group_description !== '' && obj.data.group_description !== 'null') {
				html += '<div id="alum-desc">' + obj.data.group_description + '</div>';
			}
//alert("POSTS: " + obj.data.posts);
			
			if(obj.data.posts !== undefined) {
				html += '<div id="alum-posts">';
				html += '<h2 class="section-title">Alum Blog Posts</h2>';
				//alert(obj.data.posts);
				$.each( obj.data.posts, function( key, post ) {
					html += '<div class="alum-post">';
					html += '<div class="alum-post-avatar">' + post.avatar_img + '</div>';
					html += '<div class="alum-post-title">' + post.title + '</div>';
					html += '<div class="alum-post-body">' + post.post_excerpt + '</div>';
					html += '<div class="alum-post-meta">Posted ' + post.post_date + ' by ' + post.display_name + '</div>';
					html += '</div>';
				});
				html += '<div class="section-link"><a href="posts.html?id=' + id + '" data-role="none" data-transition="slide">View All Posts</a></center>';
				html += '</div>';
			}
			
//alert("COMP: " + obj.data.composites);
			
			if(obj.data.composites !== undefined) {
				html += '<div id="alum-comps">';
				html += '<h2 class="section-title">Alum Composites</h2>';
				html += '<ul class="carosel" id="comp-carosel">';
				$.each( obj.data.composites , function( key, composite ) {
					html += '<li>';
					html += '<div class="alum-comp">';
					html += '<div class="alum-comp-img"><img src="' + composite.img_url + '"></div>';
					html += '<div class="alum-comp-meta">' + composite.title + '</div>';
					html += '</div>';
					html += '</li>';
				});
				html += '</ul>';
				applyCarosel('comp-carosel');
			}
			
//alert("PHOTOS: " + obj.data.photos);
			
			
				html += '<div id="alum-photos">';
				html += '<h2 class="section-title">Alum Photos</h2>';
				if(obj.data.photos !== undefined) {
					html += '<ul class="carosel" id="photo-carosel">';
					$.each( obj.data.photos , function( key, photo ) {
						html += '<li>';
						html += '<div class="alum-photo">';
						html += '<div class="alum-photo-img"><img src="' + photo.img_url + '"></div>';
						html += '<div class="alum-photo-meta">' + photo.caption + '</div>';
						html += '</div>';
						html += '</li>';
					});
					html += '</ul>';
					html += '<div class="section-link"><a href="photos.html?id=' + id + '" data-role="none" data-transition="slide">View All Photos</a></center>';
					applyCarosel('photo-carosel');
				}
				else {
					html += '<h5 class="no-results">No Photos</h5>';
				}
				//Upload photo button
				html += '<button type="button" class="btn uploadPhotoBtn" data-id="' + id + '" data-user="' + user_id + '" data-name="' + obj.data.group_name + '">Upload Photo</button>';
				html += '</div>';
			
			
			html += '<div id="alum-map">';
			html += '<h2 class="section-title">Alum Member Map</h2>';
			html += '</div>';
			
//alert("MEMBERS: " + obj.data.members);
			
			if(obj.data.members !== undefined) {
				html += '<div id="alum-members">';
				html += '<h2 class="section-title">Alum Members</h2>';
				html += '<div class="table-filter"><b>Filter By Initiation Year:</b>';
				html += '<select name="init_year">';
				html += '<option value="">Choose Year</option>';
				var y = (new Date()).getFullYear();
				var min_year = parseInt(y) - 100;
				for (var i = y; i >= min_year; i--){
					html += '<option value="' + i + '">' + i + '</option>';
				}
				html += '</select>';
				html += '</div>';
				html += '<div class="table-search"><b>Search:</b> <input type="text" name="member-search"></div>';
				html += '<small>(D) = Deceased</small>';
				html += '<div class="responsive-table">';
				html += '<table class="table"><thead><tr><th>Member</th><th>Claimed Prof.</th></tr></thead></tbody>';

				$.each( obj.data.members , function( key, member ) {
					var location = (member.city !== '' && member.city !== null) ? member.city + ', ' + member.state : '';
					var claimed_profile = (member.claimed_profile !== '' && member.claimed_profile !== null && member.claimed_profile !== undefined) ? member.claimed_profile : '<button type="button" class="btn btn-sm sendInviteBtn" data-id="' + member.id + '" data-user="' + user_id + '" data-group="' + id + '" data-name="' + member.first_name + ' ' + member.last_name +'" style="margin-top: 12px;">Send Invite</button>';
					html += '<tr><td nowrap><a href="member.html?id=' + member.id + '" data-role="none" data-transition="slide">';
					if(member.avatar !== '' && member.avatar !== undefined && member.avatar !== null) {
						html += '<div class="member-table-avatar">' + member.avatar + '</div>';
					}
					html += '<div class="member-table-meta"><div class="member-table-name">' + member.first_name + ' ' + member.last_name + '</a>';
					if(member.deceased === true) {
						html += ' <small>(D)</small>';
					}
					html += '</div>';
					html += '<div class="member-table-location">' + location + '</div>';
					html += '<div class="member-table-init">Initiation Date: ' + member.init_date_format + '</div></div>';
					html += '<td nowrap>' + claimed_profile + '</td></tr>';
				});
				html += '</tbody></table>';
				html += '</div>';
				html += '</div>';
			}
//alert(html);
			$('#alumn').show();
            $('#alumn').html(html);
			//Do the carosel
			applyCarosel('comp-carosel');
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


$(document).on( "pageshow", "#member-page", function(event) {
	$.mobile.loading( "show" );
	
	$('#member-profile').html('');
	
	var id = getUrlParameter('id');
	//alert(id);
	var request = $.ajax({
		url: serviceURL + 'member_profile',
	  	method: "GET",
	  	data: { id : id },
	  	dataType: "html"
	});
	request.done(function( data ) {
		//alert(data );
		var obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			$.mobile.loading( "hide" );
			var html = '';
			//
			var full_name = '';
			if(obj.data.salutation !== null) {
				full_name += obj.data.salutation + ' ';
			}
			full_name += obj.data.first_name + ' ';
			if(obj.data.middle_name !== null) {
				full_name += obj.data.middle_name + ' ';
			}
			full_name += obj.data.last_name;
			if(obj.data.suffix !== null) {
				full_name += ', ' + obj.data.suffix;
			}
			
			html += '<div class="member-avatar">' + obj.data.avatar + '</div>';
			html += '<div class="member-name">' + full_name + '</div>';
			if(obj.data.email !== null && obj.data.email !== undefined) {
				html += '<div class="member-email">' + obj.data.email + '</div>';
			}
			
			html += '<div class="member-address">';
			if(obj.data.address !== null && obj.data.address !== undefined) {
				html += obj.data.address + '<br>';
			}
			html += obj.data.city + ', ' + obj.data.state + ' ' + obj.data.zipcode;
			html += '</div>';
			
			if(obj.data.phone !== null && obj.data.phone !== undefined) {
				html += '<div class="member-phone">' + obj.data.phone + '</div>';
			}
			if(obj.data.birthdate !== null && obj.data.birthdate !== undefined) {
				html += '<div class="member-dob">Bithdate: ' + obj.data.birthdate + '</div>';
			}
			if(obj.data.spouse_name !== null && obj.data.spouse_name !== undefined) {
				html += '<div class="member-spouse">Married to ' + obj.data.spouse_name + '</div>';
			}
			//Business Info
			var show_bi = false;
			var bi = '<h2 class="section-title">Business Info</h2>';
			
			if(obj.data.employer_name !== null && obj.data.employer_name !== undefined) {
				show_bi = true;
				bi += '<div class="member-business-name">' + obj.data.employer_name + '</div>';
			}
			if(obj.data.occupation !== null && obj.data.occupation !== undefined) {
				show_bi = true;
				bi += '<div class="member-prof-title">' + obj.data.occupation + '</div>';
			}
			
			if(obj.data.occupation_description !== null && obj.data.occupation_description !== undefined) {
				show_bi = true;
				bi += '<div class="member-business-desc">' + obj.data.occupation_description + '</div>';
			}
			
			if(obj.data.employer_address !== null && obj.data.employer_address !== undefined) {
				show_bi = true;
				bi += '<div class="member-business-location">' + obj.data.employer_address + '</div>';
			}
			
			if(obj.data.work_phone !== null && obj.data.work_phone !== undefined) {
				show_bi = true;
				bi += '<div class="member-business-phone">' + obj.data.work_phone + '</div>';
			}
			if(show_bi === true) {
				html += bi;
			}
			
			//Business Promo
			var show_bp = false;
			var bp = '<h2 class="section-title">Business Promotion</h2>';
			
			if(obj.data.hiring_position !== null && obj.data.hiring_position !== undefined) {
				show_bp = true;
				bp += '<div>I am hiring:</div>';
				bp += '<ul>';
				bp += '<li>' + obj.data.hiring_position + '</li>';
				bp += '</ul>';
			}
			
			if(obj.data.type_employment_seeking !== null && obj.data.type_employment_seeking !== undefined) {
				show_bp = true;
				bp += '<div>I am seeking employment:</div>';
				bp += '<ul>';
				bp += '<li>' + obj.data.type_employment_seeking + '</li>';
				bp += '</ul>';
			}
			
			if(show_bp === true) {
				html += bp;
			}	
			
			if(obj.data.groups !== null && obj.data.groups !== undefined) {
				html += '<h2 class="section-title">My Alumni Connections</h2>';
				html += '<ul class="member-profile-connections">';
				$.each(obj.data.groups, function( index, group ) {
				  	//alert( index + ": " + group.group_name );
					html += '<li><div class="member-profile-connection-title">' + group.group_name  + '</div>';
					html += '<div class="member-profile-connection-meta">Initiation Date: ' + group.init_date_format +  '</div></li>';
				});
				html += '</ul>';
			}
			
			if(obj.data.timeline !== null && obj.data.timeline !== undefined) {
				html += obj.data.timeline;
			}
			$('#member-profile').html(html);
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

$(document).on( "pageshow", "#posts-page", function(event) {
	$.mobile.loading( "show" );
	$('#posts').html('');
	
	var id = getUrlParameter('id');
	//alert(id);
	var request = $.ajax({
		url: serviceURL + 'posts',
	  	method: "GET",
	  	data: { id : id },
	  	dataType: "html"
	});
	request.done(function( data ) {
		alert(data );
		var obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			var html = '';
			$.each( obj.data, function( key, value ) {
				html += '<div id="post-div=' + value.ID + '" class="post-page-post">';
				html += '<div class="post-page-avatar">' + value.avatar_img + '</div>';
				html += '<div class="post-page-author">' + value.author + '</div>';
				html += '<div class="post-page-meta">' + value.post_title + '</div>';
				html += '<div class="post-page-title">' + value.post_title + '</div>';
				html += '<div class="post-page-content">' + value.post_content + '</div>';
				html += '</div>';
			});
			$('#posts').html(html);

		}
		else {
		
		}
		$.mobile.loading( "hide" );
	});
	 
	request.fail(function( jqXHR, textStatus, errorThrown ) {
	  	alert( "Request failed: " + textStatus + " - " + jqXHR.responseText);
	  	$.mobile.loading( "hide" );
	});
});

$(document).on( "pagecreate", "#photos-page", function(event) {
	$.mobile.loading( "show" );
	$('#photos').html('');
	
	var id = getUrlParameter('id');
	//alert(id);
	var request = $.ajax({
		url: serviceURL + 'photos',
	  	method: "GET",
	  	data: { id : id },
	  	dataType: "html"
	});
	request.done(function( data ) {
		alert(data );
		var obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			
		}
		else {
		
		}
		$.mobile.loading( "hide" );
	});
	 
	request.fail(function( jqXHR, textStatus, errorThrown ) {
	  	alert( "Request failed: " + textStatus + " - " + jqXHR.responseText);
	  	$.mobile.loading( "hide" );
	});
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

$(document).on('click', '.uploadPhotoBtn', function () {
	var group_id = $(this).data('id');
	var group_name = $(this).data('name');
	var user_id = $(this).data('user');
	
	$('#upload-photo-frm input[name="user_id"]').val(user_id);
	$('#upload-photo-frm input[name="group_id"]').val(group_id);

	var y = (new Date()).getFullYear();
	var min_year = parseInt(y) - 100;
	for (var i = y; i >= min_year; i--){
		$('select[name="photo_year"]').append(
        $('<option></option>').val(i).html(i));
	}
	//header....
	$('#photo-upload h2').html('Upload Photo to ' + group_name);
	//show modal....
	showModal('photo-upload');
});

$(document).on('click', '.sendInviteBtn', function () {
	var member_id = $(this).data('id');
	var member_name = $(this).data('name');
	var user_id = $(this).data('user');
	var group_id = $(this).data('group');
	//show modal....
	
	$('#invite-member-frm input[name="group_id"]').val(group_id);
	$('#invite-member-frm input[name="member_id"]').val(member_id);
	$('#invite-member-frm input[name="user_id"]').val(user_id);
	$("#invite-welcome").html('Use the form below to send an invitation to ' + member_name); 
	showModal('invite-member');
});

$(document).on('click', '.submitPhoto', function () {
	//Ajax...
	$.mobile.loading( "show" );
	var form = document.getElementById('upload-photo-frm');
	formData = new FormData(form); 
	var request = $.ajax({
		url: serviceURL + 'submit_photo',
	  	method: "POST",
	  	data: formData,
	  	dataType: "html",
		cache: false,
		contentType: false,
        processData: false,
	});
	request.done(function( data ) {
		alert(data );
		obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			$('#upload-photo-frm input[name="user_id"]').val('');
			$('#upload-photo-frm input[name="group_id"]').val('');
			$('#upload-photo-frm input[name="photo_caption"]').val('');
			$('#upload-photo-frm select[name="photo_year"]').val('');
			$("#photoCanvas").css('height', '0px');
			$('#photoPreview').attr('src', '');
			$('#upload-photo-frm input[name="photo"]').val('');
			//hide overlay....
			hideModal('photo-upload');
			//Alert popup
			$('body').prepend('<div class="alert-popup alert-info">Your photo has been submitted!</div>');
			setTimeout(function(){
				$('.alert-popup').fadeOut().remove();
			}, 2000);
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

$(document).on('click', '.selectPhotoBtn', function () {
	$('input[name="photo"]').click();
});

$(document).on('change', 'input[name="photo"]', function () {
	readURLPhoto(this);
    var filename = $j('input[name="photo"]').val();
});

$(document).on('click', '.submitInvite', function () {
	$.mobile.loading( "show" );
	var member_id = $('#invite-member-frm input["member_id"]').val();
	var user_id = $('#invite-member-frm input["user_id"]').val();
	var group_id = $('#invite-member-frm input["group_id"]').val();
	var email_address = $('#invite-member-frm input["email_address"]').val();
	var phone = $('#invite-member-frm input["phone"]').val();
	//Ajax...
	var request = $.ajax({
		url: serviceURL + 'member_invite',
	  	method: "POST",
	  	data: { member_id: member_id, user_id: user_id, group_id: group_id, email: email_address, phone: phone },
	  	dataType: "html"
	});
	 
	request.done(function( data ) {
		alert(data);
		obj = $.parseJSON( data );
		if(obj.code === 1) {
			//
			$('#invite-member-frm input["member_id"]').val();
			var user_id = $('#invite-member-frm input["user_id"]').val();
			var group_id = $('#invite-member-frm input["group_id"]').val();
			var email_address = $('#invite-member-frm input["email_address"]').val();
			var phone = $('#invite-member-frm input["phone"]').val();
			hideModal('invite-member');

		}
		else {
			//show error
			
		}
		$.mobile.loading( "hide" );
	});
	
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

function applyCarosel(id) {
	//alert(id);
	//alert($('#' + id + ' li').length);

	//Get number of li items
	var lic = $('#' + id + ' li').length;
	var cl = 0;
	var lc = 0;
	
	//Wrap in class div
	$('#' + id).wrap('<div class="carosel-wrapper"></div>');
	//Add left/right nav
	$('#' + id).before('<div class="carosel-nav-left" id="' + id + '-carosel-nav-left"><i class="fa fa-chevron-left" aria-hidden="true"></i></div><div class="carosel-nav-right" id="' + id + '-carosel-nav-right"><i class="fa fa-chevron-right" aria-hidden="true"></i></div>');
	//size li
	var cw = $('#' + id).parent('.carosel-wrapper').width();
	var ch = $('#' + id).parent('.carosel-wrapper').height();

	//Disable right nav on start
	$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').addClass('disabled');
	
	
//console.log("CW: " + cw);
	$('#' + id + " li").css('width', cw);
	//set width
	var ulw = cw * lic;
	$('#' + id).width(ulw);
	//Left nav trigger
	$(document).on('click', '#' + id + '-carosel-nav-left', function() {			
		if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').hasClass('disabled')) {
			cl = cl - cw;
			lc++;
			caroselSlide(id, cl, lc, lic);
		}
	});
	//Left swipe
	/*
	$(document).on('swipeleft', '#' + id, function() {			
		if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').hasClass('disabled')) {
			cl = cl - cw;
			lc++;
			caroselSlide(id, cl, lc, lic);
		}
	});
	*/
	//Right nav trigger
	$(document).on('click', '#' + id + '-carosel-nav-right', function() {
		if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').hasClass('disabled')) {
			cl = cl + cw;
			lc--;
			caroselSlide(id, cl, lc, lic);
		}
	});
	//Right Swipe
	/*
	$(document).on('swiperight', '#' + id, function() {
		if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').hasClass('disabled')) {
			cl = cl + cw;
			lc--;
			caroselSlide(id, cl, lc, lic);
		}
	});
	*/
}

function caroselSlide(id, cl, lc, lic) {
	if(lc > 0) {
		$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').removeClass('disabled');
	}
	else {
		$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').addClass('disabled');
	}

	if(lc == lic - 1) {
		$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').addClass('disabled');
	}
	else {
		$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').removeClass('disabled');
	}
	$('#' + id + " li:first").animate({
		'margin-left': cl,
	});
}

function readURLPhoto(input) {
	//console.log(input);
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		reader.onloadend = function (e) {
			var data = reader.result;
			//alert(data);
			$('input[name="photo_data"]').val(data);
			//console.log(e.target.result);
			$('#photoPreview').attr('src', e.target.result);
			EXIF.getData(input.files[0], function() {
				// Fetch image tag
	   			var img = $("#photoPreview").get(0);
	           	// Fetch canvas
				var canvas = $("#photoCanvas").get(0);
				$("#photoCanvas").css('height', '150px');
				// run orientation on img in canvas
				orientation(img, canvas);
			});
		};

		reader.readAsDataURL(input.files[0]);
	}
}

function orientation(img, canvas) {
	// Set variables
	var ctx = canvas.getContext("2d");
	var exifOrientation = '';
	var width = img.width,
		height = img.height;

		console.log(width);
		console.log(height);
	
		//alert(width);
		//alert(height);

	// Check orientation in EXIF metadatas
	EXIF.getData(img, function() {
		var allMetaData = EXIF.getAllTags(this);
		exifOrientation = allMetaData.Orientation;
		console.log('Exif orientation: ' + exifOrientation);
	});

	// set proper canvas dimensions before transform & export
	if (jQuery.inArray(exifOrientation, [5, 6, 7, 8]) > -1) {
		canvas.width = height;
		canvas.height = width;
	} else {
		canvas.width = width;
		canvas.height = height;
	}
	//alert(exifOrientation);
	// transform context before drawing image
	switch (exifOrientation) {
		case 2:
			ctx.transform(-1, 0, 0, 1, width, 0);
			break;
		case 3:
			ctx.transform(-1, 0, 0, -1, width, height);
			break;
		case 4:
			ctx.transform(1, 0, 0, -1, 0, height);
			break;
		case 5:
			ctx.transform(0, 1, 1, 0, 0, 0);
			break;
		case 6:
			ctx.transform(0, 1, -1, 0, height, 0);
			break;
		case 7:
			ctx.transform(0, -1, -1, 0, height, width);
			break;
		case 8:
			ctx.transform(0, -1, 1, 0, 0, width);
			break;
		default:
			ctx.transform(1, 0, 0, 1, 0, 0);
	}

	// Draw img into canvas
	ctx.drawImage(img, 0, 0, width, height);
	
}