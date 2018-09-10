/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
		//var myContact = navigator.contacts.create({"displayName": "Test User"});
        //myContact.note = "This contact has a note.";
        //alert("The contact, " + myContact.displayName + ", note: " + myContact.note);
		var options = new ContactFindOptions();
		options.multiple = true;
        options.filter = "";
        var filter = ["displayName", "addresses", "emails", "phoneNumbers"];
        navigator.contacts.find(filter, onSuccess, onError, options);

    },
    setupPush: function() {
        console.log('calling push init');
        var push = PushNotification.init({
            "android": {
                "senderID": "XXXXXXXX"
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

            var oldRegId = localStorage.getItem('registrationId');
            if (oldRegId !== data.registrationId) {
                // Save new registration ID
                localStorage.setItem('registrationId', data.registrationId);
                // Post registrationId to your app server as the value has changed
            }

            var parentElement = document.getElementById('registration');
            var listeningElement = parentElement.querySelector('.waiting');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');
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

function onSuccess(contacts) {
	var contacts_html = '<div id="clist"><p>Choose Who To Send An Invite To:</p><form><ul>';
	for (var i = 0; i < contacts.length; i++) {
		contacts_html += '<li>';
		contacts_html += '<span class="clist-select">';
		contacts_html += '<select name="flip-3" id="flip-3" data-role="flipswitch" data-mini="true">';
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
	$('#invite-members').find('[data-role="content"]').html(contacts_html);
}

// onError: Failed to get the contacts
//
function onError(contactError) {
	alert('onError!');
}

$(document).on('click', '#inviteMembersBtn', function () {
	showModal('invite-members');
});

$(document).on('click', '[data-role="close"]', function () {
	hideModal($(this).parent('div').parent('div').attr('id'));
});

function showModal(id) {
	$('#' + id).show();
	$('body').append('<div class="page-overlay"></div>');
}

function hideModal(id) {
	$('#' + id).hide();
	$('.page-overlay').remove();
}