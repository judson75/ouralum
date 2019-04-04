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
		document.addEventListener("backbutton", this.onBackKeyDown, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
       // console.log('Received Device Ready Event');
       // console.log('calling setup push');
        app.setupPush();
		//app.onBackKeyDown();
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
    },
	onBackKeyDown: function(e) {
		//alert($.mobile.activePage[0].id );
		if ($.mobile.activePage[0].id == "home"
            || $.mobile.activePage[0].id == "invite-members") {
            e.preventDefault();
            //navigator.app.exitApp();
			if($.mobile.activePage[0].id != "home") {
				$.mobile.changePage( "index.html", { transition: "slide", changeHash: false, reverse: true });
			}
        }
		/*
		else if($.mobile.activePage[0].id == "inspection"){
            //e.preventDefault();
            //back();
            //return false;
			alert("other");
        }
		else if($.mobile.activePage[0].id == "noDetails"){
            //e.preventDefault();
            //$.mobile.changePage("home.html");
            //return false;
			alert("other2");
        }
		*/
		else {
			//alert("other3");
           navigator.app.backHistory();
        }
	}
};

function onContactSuccess(contacts) {
	//Must ajax back to site to compare contacts
	var user_id = getStorage('oa_user_id');
	//alert(user_id);
	$.mobile.loading( "show", { theme: "a", text: "Fetching your contacts list. Please be patient.", textVisible: true} );
	//alert(contacts);
	var c = JSON.stringify(contacts);
	//{ user_id : user_id, contacts: JSON.stringify(contacts) }
	//alert("DATA: " + data);
	var request = $.ajax({
		url: serviceURL + 'invite_list',
	  	method: "POST",
	  	data: { user_id : user_id, contacts: c },
	  	dataType: "html",
	});
	request.done(function( data ) {
		//alert(data );
		var contacts_html = '';
		var obj = $.parseJSON( data );
		if(obj.msg === 'success') {
			if(obj.data !== '' && obj.data !== null && obj.data !== undefined) {
				contacts_html += '<div id="clist"><p>Choose Who To Send An Invite To:</p><form id="clistFrm"><ul>';
				$.each( obj.data, function( key, contact ) {
					contacts_html += '<li>';
					
					contacts_html += '<span class="clist-select">';
					/*
					contacts_html += '<select name="import_' + i + '" id="import-' + i + '" data-role="flipswitch" data-mini="true" data-theme="b">';
					contacts_html += '<option value="off">No</option>';
					contacts_html += '<option value="on">Yes</option>';
					contacts_html += '</select>';
					*/
					contacts_html += '<label class="toggle">';
					contacts_html += '<input type="hidden" name="member_phone[' + key + ']" value="' + contact.phone + '">';
					contacts_html += '<input type="hidden" name="member_email[' + key + ']" value="' + contact.email + '">';
					contacts_html += '<input class="toggle-checkbox" type="checkbox" name="send_invite[' + key + ']" value="' + key + '">';
					contacts_html += '<div class="toggle-switch"></div>';
					contacts_html += '<span class="toggle-label"></span>';
					contacts_html += '</label>';
					contacts_html += '</span>';
					
					contacts_html += '<span class="clist-data">';
					contacts_html += '<span class="clist-name">' + contact.name + '</span>';
					contacts_html += '<span class="clist-contact">';
					if(contact.email !== null) {
						contacts_html += contact.email + "<br>\n";	
					}
					if(contact.phone !== null) {
						contacts_html += contact.phone + "<br>\n";	
					}
					contacts_html += '</span>';
					contacts_html += '</span>';
					contacts_html += '</li>';
				});
				contacts_html += '</ul></form></div>';
				$('#save-button').show();
			}
			else {
				contacts_html += '<div id="no-found-contacts"><p>No Alum Members Found in Your Contacts.</p><p>You can go to an Alum page and send invitations from the Members List.</p></div>';
			}
			$.mobile.loading( "hide" );
		}
		else {
			contacts_html += '<div id="no-found-contacts">No Contact Found</div>';
		}
		$('#contact-list').html(contacts_html);
		$.mobile.loading( "hide" );
	});
	 
	request.fail(function( jqXHR, textStatus, errorThrown ) {
	  	alert( "Request failed Line 162: " + textStatus + " - " + jqXHR.responseText);
	  	//var err = eval("(" + jqXHR.responseText + ")");
	  	var err = $.parseJSON(jqXHR.responseText)
  		alert(err.Message);
	  	$.mobile.loading( "hide" );
	});
	/*
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
	*/
	//var parentElement = document.getElementById('registration');
	//var receivedElement = parentElement.querySelector('.received');
	//document.getElementById('registration').innerHTML = contacts_html;
	//$("#lnkDialog").click();
	//$('#invite-members').find('[data-role="content"]').html(contacts_html);
	/*$('#invite-members').find('[data-role="content"]').html(contacts_html);
	$('#invite-members').find('.app').html(contacts_html);*/
	
}

// onError: Failed to get the contacts
//
function onError(contactError) {
	alert('onError!');
}


	$(document).on('click', '#dlink', function() {
		//Show dialog
		//$("#access-contacts-dialog").dialog();
		var cperm = getStorage('oa_contact_perms');
		//alert(cperm);
		if(cperm == 1) {
			$.mobile.changePage( "invite-members.html", { transition: "slide", changeHash: false });
		}
		else {
			showModal('access-contacts-dialog');
		}
		
	});
	
	$(document).on('click', '#sendInviteList', function() {
		var formData = $('#clistFrm').serializeArray();
		var user_id = getStorage('oa_user_id');
		formData.push({name: 'user_id', value: user_id});
		//alert(formData);
		$.mobile.loading( "show", { theme: "a", text: "Sending Invitations, please be patient", textVisible: true} );
		var request = $.ajax({
			url: serviceURL + 'send_invite_list',
		  	method: "POST",
		  	data: formData,
		  	dataType: "html"
		});
		request.done(function( data ) {
			//alert(data );
			obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				$('body').prepend('<div class="alert-popup alert-info">Your invitations have been sent!</div>');
				setTimeout(function(){
					$('.alert-popup').fadeOut('slow', function() { $(this).remove(); });
				}, 2000);
	
			}
			else {
				//show error
				
			}
			$.mobile.loading( "hide" );
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 239: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	});
	
	$(document).on( "click", ".loginBtn", function() {
		$.mobile.loading( "show", { theme: "a", text: "", textVisible: true} );
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
		  		alert( "Request failed Line 277: " + textStatus + " - " + jqXHR.responseText);
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
			getmemberCountHome();
	    }
	});  
	        
	$(document).on( "pageshow", "#alumns-page", function(event) {
		//Get Alumns
		//$.mobile.loading( "show" );
		$.mobile.loading( "show", { theme: "a", text: "Loading", textVisible: true} );
		var user_id = getStorage('oa_user_id');
		deleteStorage('oa_init_year');
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
						html += '<a href="alumn.html?id=' + value.group_id + '" data-role="none" data-transition="slide"><img src="https://ouralum.com/images/alum_group_images/' + value.group_logo + '"></a>';
					}
					else {
						//get initials from name
						var words = value.group_name.split(" ", 3),
							i;
						var init = '';
						for (i = 0; i < words.length; i++) {
							init += words[i].charAt(0);
						}
						html += '<a href="alumn.html?id=' + value.group_id + '" data-role="none" data-transition="slide"><span class="alumn-init">' + init + '</span></a>';
						
					}
					html += '</span>';
					html += '<span class="alumn-title"><a href="alumn.html?id=' + value.group_id + '" data-role="none" data-transition="slide">' + value.group_name + '</a></span>';
					html += '<span class="alumn-count">' + value.member_count + ' members</span>';
					html += '</li>';
				});
				html += '</ul>';
				setTimeout(function(){
					$('#alum-list').html(html);
					$.mobile.loading( "hide" );
					
				}, 200);
	            
			}
			else {
				//show error
				alert("Alumns page error");
				$.mobile.loading( "hide" );
			}
			
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 354: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
		
	});
	
	//event.preventDefault();
	//$(document).on('pageinit', '#alumn-page', function(){
	$(document).on( "pageshow", "#alumn-page", function(event) {
		$.mobile.loading( "show", { theme: "a", text: "Getting Alumn Info", textVisible: true} );
		//$('#alumn').html('');
		var id = getUrlParameter('id');
		var user_id = getStorage('oa_user_id');
		//get and set users alum year...
		var user_data = getUserData(user_id);
		var init_year = '';
		//alert("DATA: " + user_data.data);
		if(user_data != '' && user_data != undefined) {
			//alert("DAT2: " + user_data.data.initiation_year);
			var initiation_year = user_data.data.initiation_year;
			//alert("INIT YEAR: " + initiation_year);
			//set it...
			init_year = getStorage('oa_init_year');
			//alert("INIT YEAR: " + init_year);
			if(init_year == '' || init_year == null || init_year == undefined || init_year == false) {
				setStorage('oa_init_year', initiation_year);
				init_year = getStorage('oa_init_year');
			}
		}
		//alert("UD: " + user_data);
		//alert("SHOW ID: " + id);
		var url = serviceURL + 'alumn';
		if(init_year != '' && init_year != null && init_year != undefined && init_year != false) {
			url += '?init_year=' + init_year;
		}
		var request = $.ajax({
			url: url,
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
				var title_css = 'alum-title';
				if(obj.data.logo_src !== null && obj.data.logo_src !== undefined) {
					html += '<div id="alum-logo"><img src="' + obj.data.logo_src + '"></div>';
					title_css = 'alum-title-logo';
				}
				
				html += '<div id="alum-title" class="' + title_css + '">' + obj.data.group_name + '</div>';
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
					}
					else {
						html += '<h5 class="no-results">No Photos</h5>';
					}
					//Upload photo button
					html += '<a href="upload-photo.html?id=' + id + '&user=' + user_id + '&name=' + obj.data.group_name + '" class="btn" data-role="none" data-transition="slidedown">Upload Photo</a>';
					//html += '<a href="javascript:void(0);" class="btn uploadPhotoBtn" data-id="' + id + '" data-user="' + user_id + '" data-name="' + obj.data.group_name + '">Upload Photo</a>';
					html += '</div>';
				
				
				//html += '<div id="alum-map">';
				//html += '<h2 class="section-title">Alum Member Map</h2>';
				//html += '</div>';
				
	//alert("MEMBERS: " + obj.data.members);
				
				if(obj.data.members !== undefined) {
					html += '<div id="alum-members">';
					html += '<h2 class="section-title">Alum Members</h2>';
					html += '<div class="table-filter"><b>Filter By Initiation Year:</b>';
					html += '<select id="member_tableFilter_init" name="init_year">';
					html += '<option value="">Choose Year</option>';
					var y = (new Date()).getFullYear();
					//alert(init_year);
					var min_year = parseInt(y) - 100;
					for (var i = y; i >= min_year; i--){
						html += '<option value="' + i + '"';
						if(i == init_year) {
							html += ' selected';	
						}
						html += '>' + i + '</option>';
					}
					html += '</select>';
					html += '</div>';
					html += '<div class="table-search"><b>Search:</b> <input type="text" name="member_search"></div>';
					html += '<small>(D) = Deceased</small>';
					html += '<div class="responsive-table" id="members-table-container">'; //members-table-container
					html += '<div class="table-results-count">' + obj.data.members.total_members + ' Members Found</div>';
					html += '<table class="table" id="membersTable"><thead><tr><th>Member</th><th>Claimed Prof.</th></tr></thead><tbody>';
					var t = '';
					$.each( obj.data.members.data , function( key, member ) {
						t += buildMembersTable(id, user_id, member);
						/*
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
						html += '<div class="member-table-init">Initiation Date: ' + member.init_date_format + '</div></div></td>';
						html += '<td nowrap>' + claimed_profile + '</td></tr>';
						*/
					});
					html += t;
					html += '</tbody></table>';
					html += '<div class="table-results-pagination">';
					html += '<span class="pagination-left">';
					if(obj.data.members.current_page !== 1) {
						html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.data.members.prev_page + '"><i class="fa fa-chevron-left"></i></button>';
					}
					else {
						html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-left"></i></button>';
					}
					
					html += '</span>';
					html += '<span class="pagination-text">Page ' + obj.data.members.current_page + ' of ' + obj.data.members.total_pages + '</span>';
					html += '<span class="pagination-right">';
					//alert(obj.data.members.current_page  + ' - ' +  obj.data.members.total_pages);
					if(obj.data.members.current_page !== obj.data.members.total_pages) {
						html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.data.members.next_page + '"><i class="fa fa-chevron-right"></i></button></div>';
					}
					else {
						html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-right"></i></button></div>';
					}
					html += '</span>';
					html += '</div>';
					
					
					html += '</div>';
					
					
					html += '</div>';
					
				}
				if(obj.data.ads !== undefined) {
					html += '<div id="alum-ads">';
					html += '<h2 class="section-title">Support Your Alum Businesses</h2>';
					$.each( obj.data.ads , function( key, ad ) {
						html += '<div class="alum-page-ad" id="group-ad-' + ad.id + '">';
						html += '<a href="member.html?id=' + ad.member_id + '" data-role="none" data-transition="slide"><img src="' + ad.img_url + '" alt=""></a><div class="alum-ad-meta">Added by ' + ad.user_name + '</div>';
						//if(ad.user_id === user_id) {
						//	html += '<br><button type="button" class="btn btn-primary btn-xs deleteAd" data-id="' + ad.id + '">Delete Ad</button>';
						//}
						html += '</div>';
					});
					html += '</div>';
				}
				
				if(obj.data.jobs !== undefined) {	
					html += '<div id="alum-jobs">';
					html += '<h2 class="section-title">Alum Professions and Job Listings</h2>';
					$.each( obj.data.jobs , function( key, job ) {
						html += '<div class="alum-page-job-post">';
						//html += '<h3><a href="job.html?id=' + job.id + '" data-role="none" data-transition="slide">' + job.job_title + '</a></h3>';
						html += '<h3>' + job.job_title + '</h3>';
						if(job.short_desc !== undefined) {				
							html += '<p>' + job.short_desc + '...</p>';
						}
						html += '<div class="ap-job-meta">' + job.city + ', ' + job.state + '</div>';
						html += '</div>';
					});
					html += '<div class="section-link"><a href="jobs.html?id=' + id + '" data-role="none" data-transition="slide">View All Jobs</a></center>';
					html += '</div>';
				
				}
				
				/*
				if(obj.data.links !== undefined) {
					html += '<div id="alum-links">';
					html += '<h2 class="section-title">Alum Links</h2>';
					html += '<ul id="group-links">';
					$.each( obj.data.links , function( key, link ) {
						//alert(link.caption);
						html += '<li><a href="' + link.url + '">';
						if(link.caption !== undefined && link.caption !== '') {
							html += link.caption;
						}
						else {
							html += link.url;
						}
						html += '</a></li>';
					});
					html += '</ul>';
					html += '</div>';
				}
				*/
				
				html += '<div id="alum-contact">';
				html += '<h2 class="section-title">Contact Us</h2>';
				html +='<form id="alum-contact-frm" method="post">';
				html +='<input type="hidden" name="group_id" value="' + id + '">';		
				html +='<div class="form-group">';
				html +='<input type="text" name="sender_name" class="form-input" value="" placeholder="Your Name">';
				html +='</div>';
				html +='<div class="form-group">';
				html +='<input type="text" name="sender_email"  class="form-input" value="" placeholder="Your Email">';
				html +='</div>';
				html +='<div class="form-group">';
				html +='<textarea name="sender_comments"  class="form-input"></textarea>';
				html +='</div>';
				html +='<button type="button" class="btn btn-primary sendAlumContact">Send Comments</button>';
				html +='</form>';
				html += '</div>';
				
				
	//alert(html);
				//$('#alumn_content').show();
	            //$('#alumn').html(html);
				setTimeout(function(){
					$('#alumn_content').hide().html(html).fadeIn();
					//if($('#alumn_content').html() == '') {
	
					//}
		//alert("HERE");
	
					//Do the carosel
					if($('#comp-carosel').length) {
						applyCarosel('comp-carosel');
					}
					if($('#photo-carosel').length) {
						applyCarosel('photo-carosel');
					}
					$.mobile.loading( "hide" );
				}, 200);
				
			}
			else {
				//show error
				alert("Alumn page error");
				$.mobile.loading( "hide" );
			}
			
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 616: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	});
	
	
	$(document).on( "pageshow", "#member-page", function(event) {
		//$.mobile.loading( "show" );
		$.mobile.loading( "show", { theme: "a", text: "Loading Member Profile", textVisible: true} );
		//$('#member-profile').html('');
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
				var html = '';
				//
				var full_name = '';
				if(obj.data.salutation !== null && obj.data.salutation !== undefined) {
					full_name += obj.data.salutation + ' ';
				}
				full_name += obj.data.first_name + ' ';
				if(obj.data.middle_name !== null && obj.data.middle_name !== undefined) {
					full_name += obj.data.middle_name + ' ';
				}
				full_name += obj.data.last_name;
				if(obj.data.suffix !== null && obj.data.suffix !== undefined) {
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
				if(obj.data.city !== null && obj.data.city !== undefined &&
					obj.data.state !== null && obj.data.state !== undefined &&
					obj.data.zipcode !== null && obj.data.zipcode !== undefined
				) {
					html += obj.data.city + ', ' + obj.data.state + ' ' + obj.data.zipcode;
					html += '</div>';
				}
				
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
				//alert(html);
				//$( element ).empty().html( text );
				//$('#member-profile').html(html);
				//$('#member-profile').hide().html(html).fadeIn();
				setTimeout(function(){
					$('#member-profile').hide().empty().html(html).fadeIn();
					$.mobile.loading( "hide" );
				}, 200);
				
			}
			else {
				alert("Member page error");
				$.mobile.loading( "hide" );
			}
			
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 752: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	});
	
	$(document).on( "pageshow", "#jobs-page", function(event) {
		$.mobile.loading( "show", { theme: "a", text: "Loading Jobs", textVisible: true} );
		var id = getUrlParameter('id');
		var request = $.ajax({
			url: serviceURL + 'jobs',
		  	method: "GET",
		  	data: { id : id },
		  	dataType: "html"
		});
		request.done(function( data ) {
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				var html = '';
				if(obj.data !== undefined) {
					html += '<div id="jobs-container">';
					html += '<h2 class="section-title">Alum Jobs</h2>';
					html += '<ul id="jobs-list">';
					$.each( obj.data , function( key, job ) {
						//alert(link.caption);
						html += '<li><div class="jobs-job-title">' + job.job_title + '</div>';
						if(job.job_desc !== undefined) {
							html += '<div class="jobs-job-desc">' + job.job_desc + '</div>';
						}
						html += '<div class="jobs-job-contact">' + job.contact_info + '</div></li>';
					});
					html += '</ul>';
					html += '</div>';
					$('#jobs-content').html(html);
				}
			}
			else {
			
			}
			
			$.mobile.loading( "hide" );
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 752: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	
	});
	
	$(document).on( "pageshow", "#job-page", function(event) {
		$.mobile.loading( "show", { theme: "a", text: "Loading Job", textVisible: true} );
		var id = getUrlParameter('id');
		
		
		$.mobile.loading( "hide" );
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
		//$.mobile.loading( "show" );
		$.mobile.loading( "show", { theme: "a", text: "Loading Posts", textVisible: true} );
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
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				var html = '';
				html += '<h2 class="section-title">Alum Posts</h2>';
				$.each( obj.data, function( key, value ) {
					html += '<div id="post-div=' + value.ID + '" class="post-page-post">';
					html += '<div class="post-page-title">' + value.post_title + '</div>';
					html += '<div class="post-page-avatar">' + value.avatar_img + '</div>';
					html += '<div class="post-page-author">' + value.author + '</div>';
					html += '<div class="post-page-meta">Posted ' + value.post_date_formatted + '</div>';
					
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
		  	alert( "Request failed Line 804: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	});
	
	$(document).on( "pagecreate", "#photos-page", function(event) {
		//$.mobile.loading( "show" );
		$.mobile.loading( "show", { theme: "a", text: "Loading Photos", textVisible: true} );
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
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				var html = '';
				html += '<h2 class="section-title">Alum Photos</h2>';
				$.each( obj.data, function( key, value ) {
					html += '<div id="photo-div=' + value.ID + '" class="photo-page-photo">';
					html += '<div class="photo-page-img"><img src="' + value.photo_url + '"></div>';
					html += '<div class="photo-page-caption">' + value.caption + '</div>';
					html += '</div>';
				});
				$('#photos').html(html);
			}
			else {
			
			}
	
			$.mobile.loading( "hide" );
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 843: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	});
	
	$(document).on( "pageshow", "#upload-photo-page", function(event) {
	//	$.mobile.loading( "show", { theme: "a", text: "Loading Member Profile", textVisible: true} );
		var id = getUrlParameter('id');
		var user = getUrlParameter('user');
		var name = getUrlParameter('name');
		
		$('#upload-photo-frm input[name="group_id"]').val(id);
		$('#upload-photo-frm input[name="user_id"]').val(user);
		
		var y = (new Date()).getFullYear();
		var min_year = parseInt(y) - 100;
		for (var i = y; i >= min_year; i--){
			$('select[name="photo_year"]').append(
	        $('<option></option>').val(i).html(i));
		}
		//header....
		$('#upload-photo-page h2').html('Upload Photo to ' + group_name);
	});
	
	$(document).on( "pageshow", "#send-invite-page", function(event) {
	//	$.mobile.loading( "show", { theme: "a", text: "Loading Member Profile", textVisible: true} );
		var id = getUrlParameter('id');
		var user = getUrlParameter('user');
		var group = getUrlParameter('group');
		var name = getUrlParameter('name');
		var member_name = getUrlParameter('name');
		var email = getUrlParameter('email');
		var phone = getUrlParameter('phone');
		//id=' + member.id + '&user="' + user_id + '&group=' + id + '&name=' + member.first_name + ' ' + member.last_name +'
		$('#invite-member-frm input[name="group_id"]').val(group);
		$('#invite-member-frm input[name="member_id"]').val(id);
		$('#invite-member-frm input[name="user_id"]').val(user);
		$('#invite-member-frm input[name="email_address"]').val(email);
		$('#invite-member-frm input[name="phone"]').val(phone);
		$("#invite-welcome").html('Use the form below to send an invitation to ' + member_name);
	});
	
	/*
	$(document).on('click touchstart', '#inviteMembersBtn', function () {
		showModal('invite-members');
	});

	$(document).on('click touchstart', '.alert .closebtn', function () {
		$(this).parent('div').remove();
	});
	
	$(document).on('click touchstart', '[data-role="close"]', function () {
		hideModal($(this).parent('div').parent('div').attr('id'));
	});
	
	
	$(document).on('click touchstart', '.uploadPhotoBtn', function () {
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
	*/
	/*
	$(document).on('click touchstart', '.sendInviteBtn', function () {
	
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
	*/
	
	$(document).on('click touchstart', '.submitPhoto', function () {
		//Ajax...
		//$.mobile.loading( "show" );
		$('div').removeClass('hasError');
		$('.helper.error').remove();
		
		var form = document.getElementById('upload-photo-frm');
		formData = new FormData(form);
		//Validation
		var err_count = 0;
		if($('select[name="photo_year"]').val() === '') {
			$('select[name="photo_year"]').parent().addClass('hasError');
			$('select[name="photo_year"]').after('<div class="helper error">Please select photo year</div>');
			err_count++;
		}
		if($('input[name="photo_caption"]').val() === '') {
			$('input[name="photo_caption"]').parent().addClass('hasError');
			$('input[name="photo_caption"]').after('<div class="helper error">Please enter a caption</div>');
			err_count++;
		}
		if($('input[name="photo"]').val() === '') {
			$('input[name="photo"]').parent().addClass('hasError');
			$('input[name="photo"]').after('<div class="helper error">Please upload a photo</div>');
			err_count++;
		}
		if(err_count > 0) {
			//$('#upload-photo-frm').prepend('<div class="alert alert-error">Please fix errors and resubmit</div>');
			//$.mobile.loading( "hide" );
			return false;
		}
		$.mobile.loading( "show", { theme: "a", text: "Submitting Photo", textVisible: true} );
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
			//alert(data);
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
//hideModal('photo-upload');
				$.mobile.changePage('alumn.html', { transition: "slide", changeHash: false, reverse: true } );
				//Alert popup
				$('body').prepend('<div class="alert-popup alert-info">Your photo has been submitted!</div>');
				setTimeout(function(){
					$('.alert-popup').fadeOut('slow', function() { $(this).remove(); });
				}, 2000);
			}
			else {
				//show error
				$('#upload-photo-frm').prepend('<div class="alert alert-error"><span class="closebtn"><i class="fa fa-close"></i></span>' + obj.data + '</div>');
			}
			//$.mobile.loading( "hide" );
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 960: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
		
	});
	
	$(document).on('click touchstart', '.selectPhotoBtn', function () {
		$('input[name="photo"]').click();
	});
	
	$(document).on('change', 'input[name="photo"]', function () {
		readURLPhoto(this);
	    var filename = $('input[name="photo"]').val();
		$('input[name="photo"]').parent().find('.error').remove();
		$('input[name="photo"]').parent().removeClass('hasError');
	});
	
	$(document).on('click touchstart', '.submitInvite', function () {
		//$.mobile.loading( "show" );
		//alert("G");
		$('div').removeClass('hasError');
		$('.helper.error').remove();
		$('#form-error').remove();
		var member_id = $('#invite-member-frm input[name="member_id"]').val();
		var user_id = $('#invite-member-frm input[name="user_id"]').val();
		var group_id = $('#invite-member-frm input[name="group_id"]').val();
		var email_address = $('#invite-member-frm input[name="email_address"]').val();
		var phone = $('#invite-member-frm input[name="phone"]').val();
		var err_count = 0;
		if($('#invite-member-frm input[name="email_address"]').val() === '') {
			$('#invite-member-frm input[name="email_address"]').parent().addClass('hasError');
			$('#invite-member-frm input[name="email_address"]').after('<div class="helper error">Please enter an email address</div>');
			err_count++;
		}
		if($('#invite-member-frm input[name="phone"]').val() === '') {
			$('#invite-member-frm input[name="phone"]').parent().addClass('hasError');
			$('#invite-member-frm input[name="phone"]').after('<div class="helper error">Please enter a phone number</div>');
			err_count++;
		}
		if(err_count > 0) {
			$('#invite-member-frm').prepend('<div id="form-error" class="alert alert-error">Please fix errors and resubmit</div>');
			//$.mobile.loading( "hide" );
			return false;
		}
		$.mobile.loading( "show", { theme: "a", text: "Sending Invitation", textVisible: true} );
		//Ajax...
		var request = $.ajax({
			url: serviceURL + 'member_invite',
		  	method: "POST",
		  	data: { member_id: member_id, user_id: user_id, group_id: group_id, email: email_address, phone: phone },
		  	dataType: "html"
		});
		 
		request.done(function( data ) {
			//alert(data);
			obj = $.parseJSON( data );
			if(obj.code === 1) {
				//
				$('#invite-member-frm input["member_id"]').val();
				var user_id = $('#invite-member-frm input["user_id"]').val();
				var group_id = $('#invite-member-frm input["group_id"]').val();
				var email_address = $('#invite-member-frm input["email_address"]').val();
				var phone = $('#invite-member-frm input["phone"]').val();
			//	hideModal('invite-member');
				$.mobile.changePage('alumn.html', { transition: "slide", changeHash: false, reverse: true } );
			}
			else {
				//show error
				
			}
			$.mobile.changePage('alumn.html', { transition: "slide", changeHash: false, reverse: true } );
		});
		
	});
	
	$(document).on('change', 'select[name="photo_year"]', function() {
		$(this).parent().find('.error').remove();
		$(this).parent().removeClass('hasError');
	});
	
	$(document).on('blur', 'input[name="photo_caption"]', function() {
		$(this).parent().find('.error').remove();
		$(this).parent().removeClass('hasError');
	});
	
	$(document).on('change', '#member_tableFilter_init', function() {
		//search using new filter...
		//$.mobile.loading( "show" );
		$.mobile.loading( "show", { theme: "a", text: "Searching", textVisible: true} );
		var user_id = getStorage('oa_user_id');
		var id = getUrlParameter('id');
		var init_year = $(this).val();
		setStorage('oa_init_year', init_year);
		var search_str = $('input[name="member-search"]').val();
		//alert(id);
		var request = $.ajax({
			url: serviceURL + 'members',
		  	method: "GET",
		  	data: { id : id, init_year: init_year, search_str: search_str },
		  	dataType: "html"
		});
		request.done(function( data ) {
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				var html = '';
				//alert(obj.data);
				if(obj.data !== '' && obj.data !== null && obj.data !== undefined && obj.data !== 'null') {
					html += '<div class="table-results-count">' + obj.total_members + ' Members Found</div>';
					html += '<table class="table" id="membersTable"><thead><tr><th>Member</th><th>Claimed Prof.</th></tr></thead><tbody>';
					var t = '';
					$.each( obj.data, function( key, member ) { 
						//alert(member.id);
						t += buildMembersTable(id, user_id, member);		
					});
					html += t; 
					html += '</tbody><table>';
	
					html += '<div class="table-results-pagination">';
					html += '<span class="pagination-left">';
					if(obj.current_page !== 1) {
						html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.prev_page + '"><i class="fa fa-chevron-left"></i></button>';
					}
					else {
						html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-left"></i></button>';
					}
					
					html += '</span>';
					html += '<span class="pagination-text">Page ' + obj.current_page + ' of ' + obj.total_pages + '</span>';
					html += '<span class="pagination-right">';
					if(obj.current_page !== obj.total_pages) {
						html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.next_page + '"><i class="fa fa-chevron-right"></i></button></div>';
					}
					else {
						html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-right"></i></button></div>';
					}
					html += '</span>';
					html += '</div>';
					
					//alert(html);
					$('#members-table-container').html(html);
					$.mobile.loading( "hide" );
				}
				else {
					alert("No Results");
					$.mobile.loading( "hide" );
				}
	
			}
			else {
			
			}
	
			$.mobile.loading( "hide" );
		});
		 
		request.fail(function( jqXHR, textStatus, errorThrown ) {
		  	alert( "Request failed Line 1097: " + textStatus + " - " + jqXHR.responseText);
		  	$.mobile.loading( "hide" );
		});
	});
	
	$(document).on('keyup', 'input[name="member_search"]', function() {
		//search using new filter...
		var user_id = getStorage('oa_user_id');
		var id = getUrlParameter('id');
		var init_year = $('#member_tableFilter_init').val();
		var search_str = $(this).val();
		//if(search_str.length > 3) {
			$.mobile.loading( "show", { theme: "a", text: "Searching", textVisible: true} );
			//alert(id);
			var request = $.ajax({
				url: serviceURL + 'members',
			  	method: "GET",
			  	data: { id : id, init_year: init_year, search_str: search_str },
			  	dataType: "html"
			});
			request.done(function( data ) {
				//alert(data );
				var obj = $.parseJSON( data );
				if(obj.msg === 'success') {
					var html = '';
					html += '<div class="table-results-count">' + obj.total_members + ' Members Found</div>';
					html += '<table class="table" id="membersTable"><thead><tr><th>Member</th><th>Claimed Prof.</th></tr></thead><tbody>';
					if(obj.data !== '' && obj.data !== null && obj.data !== undefined) {
						var t = '';
						$.each( obj.data, function( key, member ) { 
							//alert(member.id);
							t += buildMembersTable(id, user_id, member);			
						});
						html += t; 
						html += '</tbody><table>';
						html += '<div class="table-results-pagination">';
						html += '<span class="pagination-left">';
						if(obj.current_page !== 1) {
							html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.prev_page + '"><i class="fa fa-chevron-left"></i></button>';
						}
						else {
							html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-left"></i></button>';
						}
	
						html += '</span>';
						html += '<span class="pagination-text">Page ' + obj.current_page + ' of ' + obj.total_pages + '</span>';
						html += '<span class="pagination-right">';
						if(obj.current_page !== obj.total_pages) {
							html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.next_page + '"><i class="fa fa-chevron-right"></i></button></div>';
						}
						else {
							html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-right"></i></button></div>';
						}
						html += '</span>';
						html += '</div>';
	
						//alert(html);
						$('#members-table-container').html(html);
					}
					else {
						alert("No Results");
					}
					$.mobile.loading( "hide" );
				}
				else {
				
				}
		
				$.mobile.loading( "hide" );
			});
			 
			request.fail(function( jqXHR, textStatus, errorThrown ) {
			  	alert( "Request failed Line 1169: " + textStatus + " - " + jqXHR.responseText);
			  	$.mobile.loading( "hide" );
			});
	//	}
	});
	
	
	$(document).on('click', '.goToMPage', function() {
		//search using new filter...
		var user_id = getStorage('oa_user_id');
		var id = getUrlParameter('id');
		var page = $(this).data('page');
		var init_year = $('#member_tableFilter_init').val();
		var search_str = $('input[name="member-search"]').val();
		$.mobile.loading( "show", { theme: "a", text: "Loading", textVisible: true} );
		//alert(id);
		var request = $.ajax({
			url: serviceURL + 'members',
			method: "GET",
			data: { id : id, init_year: init_year, search_str: search_str, page: page },
			dataType: "html"
		});
		request.done(function( data ) {
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				var html = '';
				html += '<div class="table-results-count">' + obj.total_members + ' Members Found</div>';
				html += '<table class="table" id="membersTable"><thead><tr><th>Member</th><th>Claimed Prof.</th></tr></thead><tbody>';
				if(obj.data !== '' && obj.data !== null && obj.data !== undefined) {
					var t = '';
					$.each( obj.data, function( key, member ) { 
						//alert(member.id);
						t += buildMembersTable(id, user_id, member);			
					});
					html += t; 
					html += '</tbody><table>';
					html += '<div class="table-results-pagination">';
					html += '<span class="pagination-left">';
					if(obj.current_page !== 1) {
						html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.prev_page + '"><i class="fa fa-chevron-left"></i></button>';
					}
					else {
						html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-left"></i></button>';
					}
	
					html += '</span>';
					html += '<span class="pagination-text">Page ' + obj.current_page + ' of ' + obj.total_pages + '</span>';
					//alert(obj.current_page  + ' - ' +  obj.total_pages);
					html += '<span class="pagination-right">';
					if(obj.current_page != obj.total_pages) {
						html += '<button type="button" class="btn btn-sm goToMPage" data-page="' + obj.next_page + '"><i class="fa fa-chevron-right"></i></button></div>';
					}
					else {
						html += '<button type="button" class="btn btn-sm" disabled><i class="fa fa-chevron-right"></i></button></div>';
					}
					html += '</span>';
					html += '</div>';
	
					//alert(html);
					$('html,body').animate({
					  scrollTop: $('#alum-members').offset().top
					}, 1000);
					
					$('#members-table-container').html(html);
				}
				else {
					alert("No Results");
				}
				$.mobile.loading( "hide" );
			}
			else {
	
			}
	
			$.mobile.loading( "hide" );
		});
	
		request.fail(function( jqXHR, textStatus, errorThrown ) {
			alert( "Request failed Line 1243: " + textStatus + " - " + jqXHR.responseText);
			$.mobile.loading( "hide" );
		});
	});
	
	
	$(document).on('click', '.sendAlumContact', function () {
		var group_id = $('input[name="group_id"]').val();
		var sender_name = $('input[name="sender_name"]').val();
		var sender_email = $('input[name="sender_email"]').val();
		var sender_comments = $('textarea[name="sender_comments"]').val();
		//Validation
		$('div').removeClass('hasError');
		$('.helper.error').remove();
		var err_count = 0;
		
		$.mobile.loading( "show", { theme: "a", text: "Sending your contact", textVisible: true} );
		if($('input[name="sender_name"]').val() === '') {
			$('input[name="sender_name"]').parent().addClass('hasError');
			$('input[name="sender_name"]').after('<div class="helper error">Please enter your name</div>');
			err_count++;
		}
		if($('input[name="sender_email"]').val() === '') {
			$('input[name="sender_email"]').parent().addClass('hasError');
			$('input[name="sender_email"]').after('<div class="helper error">Please enter your email address</div>');
			err_count++;
		}
		if($('textarea[name="sender_comments"]').val() === '') {
			$('textarea[name="sender_comments"]').parent().addClass('hasError');
			$('textarea[name="sender_comments"]').after('<div class="helper error">Please enter your comments</div>');
			err_count++;
		}
		if(err_count > 0) {
			//$('#upload-photo-frm').prepend('<div class="alert alert-error">Please fix errors and resubmit</div>');
			$.mobile.loading( "hide" );
			return false;
		}
		var request = $.ajax({
			url: serviceURL + 'group_contact',
			method: "POST",
			data: { group_id: group_id, sender_name: sender_name, sender_email: sender_email, sender_comments: sender_comments },
			dataType: "html"
		});
		request.done(function( data ) {
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				$('#alum-contact-frm').prepend('<div class="alert alert-success">Your message has been sent!</div>');
				$.mobile.loading( "hide" );
			}
			else {
	
			}
	
			$.mobile.loading( "hide" );
		});
	
		request.fail(function( jqXHR, textStatus, errorThrown ) {
			alert( "Request failed Line 1342: " + textStatus + " - " + jqXHR.responseText);
			$.mobile.loading( "hide" );
		});
	});
	
	$(document).on('click', '.SubmitSearchBtn', function () {
		$.mobile.loading( "show", { theme: "a", text: "Searching", textVisible: true} );
		var search_term = $('input[name="search_term"]').val();
		if(search_term == '') {
			return false;
		}
		var request = $.ajax({
			url: serviceURL + 'search_site',
			method: "GET",
			data: { search_term: search_term },
			dataType: "html"
		});
		request.done(function( data ) {
			//alert(data );
			var obj = $.parseJSON( data );
			if(obj.msg === 'success') {
				var html = '';
				if(obj.data != undefined) {
					html += '<h3>Search Results</h3>';
					html += '<ul>';
					$.each( obj.data, function( key, data ) {
						var link = '';
						var meta = '';
						if(data.type == 'member') {
							link = 'member.html?id=' + data.id;
							meta = 'Member Profile';
						}
						else {
							link = 'alumn.html?id=' + data.id;
							meta = 'Alum Group';
						} 
						
						html += '<li>';
						html += '<a href="' + link + '" data-role="none" data-transition="slide">';
						html += '<span class="sr-img">' + data.img + '</span>';
						html += '<span class="sr-body">';
						html += '<span class="sr-title">' + data.title + '</span>';
						html += '<span class="sr-meta">' + meta + '</span>';
						html += '</span>';
						html += '</a>';
						html += '</li>';
					});
					html += '</ul>';
				}
				else {
					
				}
				$('#search_results_preview').html(html);
				$.mobile.loading( "hide" );
			}
			else {
	
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
			//alert(data);
			obj = $.parseJSON( data );
			if(obj.code === 1) {
				//
			}
			else {
				//show error
				
			}
		});
	}
	
	function getUserData(oa_user_id, token) {
		//alert("USER: " + oa_user_id + " - TOKEN: " + token);
		var obj = '';
		var request = $.ajax({
			url: serviceURL + 'user',
		  	method: "GET",
		  	data: { user_id : oa_user_id , token: token },
		  	dataType: "html",
		  	async: false
		});
		request.done(function( data ) {
			//alert("GetUser Data: " + data);
			obj = $.parseJSON( data );
			if(obj.code === 1) {
				//
			}
			else {
				//show error
				
			}
		});
		return obj;
	}

	
	function showModal(id) {
		alert(id);
		setTimeout(function(){
			$('#' + id).show();
			$('#' + id).css('display', 'block');
		}, 200);
		
		//$('body').append('<div class="page-overlay"></div>');
	}
	
	function hideModal(id) {
		//$('#' + id).hide();
		setTimeout(function(){
			$('#' + id).hide();
		}, 200);
		//$('.page-overlay').remove();
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
		$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').addClass('disabled');
		
		
	//console.log("CW: " + cw);
		$('#' + id + " li").css('width', cw);
		//set width
		var ulw = cw * lic;
		$('#' + id).width(ulw);
		//right nav trigger
		$(document).off('click', '#' + id + '-carosel-nav-right').on('click', '#' + id + '-carosel-nav-right',function(e) {
			e.preventDefault();
			//alert('t');
			if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').hasClass('disabled')) {
				cl = cl - cw;
				lc++;
				caroselSlide(id, cl, lc, lic);
				return false;
			}
		});
		//Right swipe
		$(document).on('swiperight', '.carosel-wrapper #' + id, function(e) {	
			e.preventDefault();
			if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').hasClass('disabled')) {
				//cl = cl - cw;
				//lc++;
				//caroselSlide(id, cl, lc, lic);
				$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').click();
			}
		});
	
		
		//Left nav trigger
		$(document).off('click', '#' + id + '-carosel-nav-left').on('click', '#' + id + '-carosel-nav-left',function(e) {
			e.preventDefault();
			if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').hasClass('disabled')) {
				cl = cl + cw;
				lc--;
				caroselSlide(id, cl, lc, lic);
				return false;
			}
		});
		//Left Swipe
		$(document).on('swipeleft', '.carosel-wrapper #' + id, function(e) {
			e.preventDefault();
			if(!$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').hasClass('disabled')) {
				/*
				cl = cl + cw;
				lc--;
				caroselSlide(id, cl, lc, lic);
				*/
				$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').click();
			}
		});
	
		
	}
	
	function caroselSlide(id, cl, lc, lic) {
		//alert(id + ", " + cl + ", " +lc + ", " + lic);
		if(lc > 0) {
			$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').removeClass('disabled');
		}
		else {
			$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-left').addClass('disabled');
		}
	
		if(lc == lic - 1) {
			$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').addClass('disabled');
		}
		else {
			$('#' + id).parent('.carosel-wrapper').find('.carosel-nav-right').removeClass('disabled');
		}
		$('#' + id + " li:first").animate({
			'margin-left': cl,
		});
	}
	
	function readURLPhoto(input) {
		//console.log(input);
		//alert(input);
		$.mobile.loading( "show", { theme: "a", text: "Please Wait", textVisible: true} );
		if (input.files && input.files[0]) {
			var reader = new FileReader();
			reader.onloadend = function (e) {
				var data = reader.result;
				//alert(data);
				$('input[name="photo_data"]').val(data);
				//console.log(e.target.result);
				$('#photoPreview').attr('src', e.target.result);
				//alert(e.target.result);				
				EXIF.getData(input.files[0], function() {
					var allMetaData = EXIF.getAllTags(this);
					exifOrientation = allMetaData.Orientation;
					$('input[name="exif_data"]').val(JSON.stringify(allMetaData));
					$('input[name="orientation"]').val(exifOrientation);
					// Fetch image tag
		   			var img = $("#photoPreview").get(0);
		           	// Fetch canvas
					var canvas = $("#photoCanvas").get(0);
					$("#photoCanvas").css('height', '150px');
					// run orientation on img in canvas
					orientation(img, canvas);
				});
				$.mobile.loading( "hide" );
			};
			
			reader.readAsDataURL(input.files[0]);
		}
	}
	
	function buildMembersTable(id, user_id, member) {
		var td = '';
		var location = (member.city !== '' && member.city !== null) ? member.city + ', ' + member.state : '';
		//alert("ID: " + id + " - USER: " + user_id);
		//alert(JSON.stringify(member));
		//exit;
		//var claimed_profile = (member.claimed_profile !== '' && member.claimed_profile !== null && member.claimed_profile !== undefined) ? member.claimed_profile : '<a href="javascript:void(0);" class="btn btn-sm sendInviteBtn" data-id="' + member.id + '" data-user="' + user_id + '" data-group="' + id + '" data-name="' + member.first_name + ' ' + member.last_name +'" style="margin-top: 12px;">Send Invite</a>';
		var claimed_profile = (member.claimed_profile !== '' && member.claimed_profile !== null && member.claimed_profile !== undefined) ? member.claimed_profile : '<a href="send-invite.html?id=' + member.id + '&user=' + user_id + '&group=' + id + '&name=' + member.first_name + ' ' + member.last_name +'&email=' + member.email + '&phone=' + member.phone + '" class="btn btn-sm" style="margin-top: 12px;" data-transition="slidedown">Send Invite</a>';
		td += '<tr><td nowrap><a href="member.html?id=' + member.id + '" data-role="none" data-transition="slide">';
		if(member.avatar !== '' && member.avatar !== undefined && member.avatar !== null) {
			td += '<div class="member-table-avatar">' + member.avatar + '</div>';
		}
		td += '<div class="member-table-meta"><div class="member-table-name">' + member.first_name + ' ' + member.last_name + '</a>';
		if(member.deceased === true) {
			td += ' <small>(D)</small>';
		}
		td += '</div>';
		td += '<div class="member-table-location">' + location + '</div>';
		td += '<div class="member-table-init">Init. Date: ' + member.init_date_format + '</div></div></td>';
		td += '<td nowrap>' + claimed_profile + '</td></tr>';
		return td;
	}
	
	function getmemberCountHome() {
		var request = $.ajax({
			url: serviceURL + 'member_count_home',
		  	method: "GET",
		  	data: '',
		  	dataType: "html"
		});
		 
		request.done(function( data ) {
			//alert(data);
			obj = $.parseJSON( data );
			if(obj.code === 1) {
				var html = '';
				html += '<i class="fa fa-users" aria-hidden="true"></i>';
				html += '<h3>' + obj.data + '</h3>';
				html += '<p>Alumni Members</p>';
				$('#members-count-home').html(html);
			}
			else {
				//show error
				
			}
		});
	}
	
	function setContactPerm(v) {
		setStorage('oa_contact_perms', v);
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
