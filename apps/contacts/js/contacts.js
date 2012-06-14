'use strict';

var contacts = {};
contacts.api = navigator.mozContacts;

var navigationStack = (function(currentView) {
  var stack = new Array();
  var _currentView;
  var transitions = { 'left-right': { from: 'vw-left', to: 'vw-right'},
                      'top-bottom': { from: 'vw-bottom', to: 'vw-top'},
                      'right-left': { from: 'vw-right', to: 'vw-left'},
                      'bottom-top': { from: 'vw-top', to: 'vw-bottom'},
                    };

  _currentView = currentView;
  stack.push({ view: currentView, transition: ''});
  
  this.go = function(nextView, transition) {
    var current = document.getElementById(_currentView);
    var next = document.getElementById(nextView);
    console.log("GO CURRENT "+ _currentView +  " TO "+ nextView);
    current.classList.add(transitions[transition].to);
    next.classList.remove(transitions[transition].from);

    stack.push({ view: _currentView, transition: transition});
    _currentView = nextView;
  };
  
  this.back = function() {
    if (stack.length < 2)
      return;

    var current = document.getElementById(_currentView);
    var nextView = stack.pop();
    var next = document.getElementById(nextView.view);
    console.log("BACK CURRENT "+ _currentView +  " TO "+ nextView.view);
    current.classList.add(transitions[nextView.transition].from);
    next.classList.remove(transitions[nextView.transition].to);

    _currentView = nextView.view;
  };

});

if (!contacts.app) {

  contacts.app = (function() {
    var contactsListView,
        contactDetailsView,
        contactsList,
        contactName,
        coverImg,
        editButton,
        editView,
        navigation;
        
    var currentContact = {};

    var init = function contacts_init() {
      contactsListView = 'view-contacts-list';
      contactsList = document.getElementById('contacts-list');
      contactDetailsView = 'view-contact-details';
      contactName = document.getElementById('contact-name-title');
      coverImg = document.getElementById('cover-img');
      editButton = document.getElementById('edit-contact-button');
      editView = 'view-contact-form';
      
      navigation = new navigationStack('view-contacts-list');

      var backButtons = document.getElementsByClassName('back-button');
      for(var i = 0; i < backButtons.length; i++) {
        backButtons[i].onclick = function() {
          navigation.back();
        };
      }

      editButton.addEventListener('click', function() {
        showEdit();
      });

      loadContacts();
    };

    var loadContacts = function loadContacts(mode) {
      getContactsByGroup(function(contacts) {
        for (var group in contacts) {
          iterateOverGroup(group, contacts[group], mode);
        }
      }, function() {
        console.log('ERROR Retrieving contacts');
      });
    };

    var iterateOverGroup = function iterateOverGroup(group, contacts, mode) {
      // Group header
      var groupEntry = buildGroupHeader(group);
      contactsList.appendChild(groupEntry);
      var currentGroup = document.getElementById('group-' + group);
      // Group of contacts
      for (var i = 0; i < contacts.length; i++) {
        currentGroup.appendChild(buildContact(contacts[i], group));
      }
    };

    var getContactsByGroup = function(successCb, errorCb) {
      var options = {
        sortBy: 'familyName',
        sortOrder: 'ascending'
      };
      var request = contacts.api.find(options);
      request.onsuccess = function findCallback() {
        var result = {};
        var contacts = request.result;
        for (var i = 0; i < contacts.length; i++) {
          var letter = contacts[i].familyName[0].charAt(0).toUpperCase();
          if (!result.hasOwnProperty(letter)) {
            result[letter] = [];
          }
          result[letter].push(contacts[i]);
        }
        successCb(result);
       };
       
       request.onerror = errorCb;
      // // Mocking contacts retrievement so far
      //        var result = {A: [ {name:"Alberto Pastor", familyName: "Aastor", givenName: "Alberto", org: "Telefónica Digital", tel: ['12312123','44543']},
      //                           {name:"Test", familyName: "Aaa", givenName: "aaa"}],
      //                      D: [{name:"Alberto Pastor", familyName: "Bastor", givenName: "Alberto"},
      //                          {name:"Test", familyName: "Baa", givenName: "aaa"}],
      //                      E: [{name:"Alberto Pastor", familyName: "Bastor", givenName: "Alberto"},
      //                          {name:"Test", familyName: "Baa", givenName: "aaa"}],
      //                      F: [{name:"Alberto Pastor", familyName: "Bastor", givenName: "Alberto"},
      //                          {name:"Test", familyName: "Baa", givenName: "aaa"}],
      //                      H: [{name:"Alberto Pastor", familyName: "Bastor", givenName: "Alberto"},
      //                          {name:"Test", familyName: "Baa", givenName: "aaa"}],
      //                      };
      //        successCb(result);
    };

    //
    // Method that generates HTML markup for the contact
    //

    var buildContact = function(contact, group) {
      // TODO: Split en several methods (photo, info)
      var contactElement = document.createElement('li');
      contactElement.className = 'blck-item';
      contactElement.dataset.group = group;

      var linkElem = document.createElement('a');
      linkElem.className = 'item';
      contactElement.appendChild(linkElem);
      contactElement.addEventListener('click', function() {
        currentContact = contact;
        showContactDetails(contact);
      });

      if (contact.hasOwnProperty('photo')) {
        var figureElem = document.createElement('figure');
        figureElem.className = 'itm-media pull-right blck-media';
        // alt="' + contact.name + '" 
        figureElem.innerHTML = '<img src="' + contact.photo + '">';
        linkElem.appendChild(figureElem);
      }

      var infoContainer = document.createElement('p');
      infoContainer.className = 'itm-body';
      var name = document.createElement('strong');
      name.className = 'blck-name';
      name.innerHTML = contact.givenName + ' <b>' + contact.familyName + '</b>';
      var cat = document.createElement('em');
      cat.className = 'blck-category';

      infoContainer.appendChild(name);
      infoContainer.appendChild(cat);
      linkElem.appendChild(infoContainer);

      return contactElement;
    };

    var buildGroupHeader = function(content) {
      var headerElem = document.createElement('li');
      headerElem.innerHTML = '<h2 class="blck-title"><abbr>' + content + '</abbr></h2>';
      var groupContainer = document.createElement('ol');
      groupContainer.id = 'group-' + content;
      headerElem.appendChild(groupContainer);
      return headerElem;
    };

    var buildFavourites = function() {

    };

    var showContactDetails = function(contact) {
      contactName.innerHTML = contact.name;
      //Default Img so far
      coverImg.innerHTML = '<img alt="' + contact.name + '" src="templates/dummy/320x75.jpg">';
      navigation.go(contactDetailsView, 'right-left');
    };
    
    var showEdit = function() {
      buildContactForm(currentContact);
      navigation.go(editView, 'right-left');
    };
    
    //********** Contact Form **************//
    
    var buildContactForm = function(contact) {
      buildMainInfo(contact);
      buildWorkInfo(contact);
      buildPhones(contact);
      
    };
    
    // Contact Form: main info
    var buildMainInfo = function(contact) {
      var editMainInfo = document.getElementById('contact-form-main-info');
      var container = document.createElement('div');
      container.className = 'itm-body-exp';
      container.appendChild(buildFormRow('Name:', 'givenName', 'text', contact.givenName));
      container.appendChild(buildFormRow('Lastname:', 'familyName', 'text', contact.familyName));
      editMainInfo.appendChild(container);
    };
    
    // Contact Form: work
    var buildWorkInfo = function(contact) {
      var workInfo = document.getElementById('contact-form-work');
      var container = document.createElement('dl');
      container.className = 'setbox';
      var dtElem = document.createElement('dt');
      dtElem.className = 'sbox-title';
      // dtElem.innerHTML = '<select><option value="Company">Company</option></select>';
      container.appendChild(dtElem);
      var ddElem = document.createElement('dd');
      ddElem.className = 'sbox-body';
      ddElem.appendChild(buildFormRow('Company name:', 'org', 'text', contact.org));
      container.appendChild(ddElem);
      workInfo.appendChild(container);
      workInfo.appendChild(removeFieldIcon());
    };
    
    // Contact Form: phones
    var buildPhones = function(contact) {
      var phoneContainer = document.getElementById('contact-form-phones');
      
      if (contact.tel) {
        for(var index in contact.tel) {
          phoneContainer.appendChild(buildPhoneForm(contact.tel[index]));
        }
      }
      phoneContainer.appendChild(removeFieldIcon());
    };

    var buildPhoneForm = function(tel) {
      var container = document.createElement('dl');
      container.className = 'setbox expanded';
      var dtElem = document.createElement('dt');
      dtElem.className = 'sbox-title';
      // dtElem.innerHTML = '<select><option value="Company">Company</option></select>';
      container.appendChild(dtElem);
      var ddElem = document.createElement('dd');
      ddElem.className = 'sbox-body';
      ddElem.appendChild(buildFormRow('Phone:', 'tel', 'text', tel));
      ddElem.appendChild(buildFormRow('Notes:', 'notes', 'text'));
      container.appendChild(ddElem);
      return container;
    };
    
    var removeFieldIcon = function() {
      var delButton = document.createElement('button');
      delButton.className = 'ff-row-action';
      var delIcon = document.createElement('i');
      delIcon.className = 'i-delete';
      delButton.appendChild(delIcon);
      return delButton;
    };
    
    var buildFormRow = function(label, id, type, value) {
      var row = document.createElement('p');
      row.className = 'ff-row';
      
      var labelElem = document.createElement('label');
      labelElem.className = 'hide';
      labelElem.for = id;
      labelElem.innerHTML = label;
      row.appendChild(labelElem);
      
      var input = document.createElement('input');
      input.className = 'textfield';
      input.type = type;
      if (value)
        input.value = value;
      input.id = id;
      row.appendChild(input);
      
      return row;
    };
    
    
    return {
      'init': init,
      'build': buildGroupHeader
    };
          //
          //     const LIST_CARD_ID = 'listCard';
          //     const DETAILS_CARD_ID = 'detailsCard';
          //
          //     var cPicture = document.querySelector('#cPicture');
          //     var cName = document.querySelector('#cName');
          //     var editContact = document.querySelector('#editContact');
          //     var cDetails = document.querySelector('.cDetails');
          //     var listCard = document.querySelector('#' + LIST_CARD_ID);
          //     var detailsCard = document.querySelector('#' + DETAILS_CARD_ID);
          //
          //     var contactsList = document.querySelector('#contactsList');
          //     var lcontacts = document.querySelector('.lcontacts');
          //     var alphaScrollBar = document.querySelector('.alphaScrollBar');
          //     var template = document.querySelector('.template');
          //     var updateListContacts = false;
          //     var fromNewContactIntent = false;
          //     var photoFileName = undefined;
          //
          //     const touchstart = 'mousedown';
          //     const touchmove = 'mousemove';
          //     const dataStateAttr = 'data-state';
          //     const hiddenAttr = 'hidden';
          //     const dataStateActiveVal = 'active';
          //     const seletorPrefix = '.entry_';
          //     var readonly = 'readonly';
          //     var firstLetter =  alphaScrollBar.getElementsByTagName('li')[0];
          //
          //     var scrollHandler = {
          //       touchState: { currentLetter: undefined, currentButton: firstLetter },
          //       start: function th_start() {
          //         alphaScrollBar.addEventListener(touchstart, this);
          //         alphaScrollBar.addEventListener(touchmove, this);
          //       },
          //       onTouchStart: function th_touchStart(evt) {
          //         evt.preventDefault();
          //         evt.stopPropagation();
          //         var touchState = this.touchState;
          //         touchState.currentButton.removeAttribute (dataStateAttr);
          //         touchState.currentButton = evt.target;
          //         touchState.currentButton.setAttribute (dataStateAttr, dataStateActiveVal);
          //         touchState.currentLetter = touchState.currentButton.textContent;
          //         lcontacts.scrollToSelector (seletorPrefix + touchState.currentLetter);
          //       },
          //       onTouchMove: function th_touchMove(evt) {
          //         evt.preventDefault();
          //         evt.stopPropagation();
          //         var touchState = this.touchState;
          //         var letter = evt.target.textContent;
          //         if (touchState.currentLetter != letter) {
          //           touchState.currentButton.removeAttribute (dataStateAttr);
          //           touchState.currentButton = evt.target;
          //           touchState.currentButton.setAttribute (dataStateAttr, dataStateActiveVal);
          //           touchState.currentLetter = letter;
          //           lcontacts.scrollToSelector (seletorPrefix + letter);
          //         }
          //       },
          //       handleEvent: function th_handleEvent(evt) {
          //         switch (evt.type) {
          //           case touchstart:
          //             this.onTouchStart(evt);
          //             break;
          //           case touchmove:
          //             this.onTouchMove(evt);
          //             break;
          //         }
          //       }
          //     }
          //
          //     function doTemplate(data, mode) {
          //       data.photo = PHOTO_PATH + data.photo;
          //       var newElem = owd.templates.addTemplate(contactsList,data);
          //       newElem.addEventListener ('click', function () {
          //         if (mode) {
          //           owd.contacts.api.getContactById(data.id, function (contact) {
          //            parent.postMessage(JSON.stringify({ contacts : [contact] }), '*');
          //           } , function() {
          //               window.console.error("Error while getting a contact by id: " + data.id);
          //               parent.postMessage(JSON.stringify({ contacts : [{}] }), '*');
          //             }
          //           );
          //         } else {
          //           owd.contacts.app.showDetailsContact (data.id);
          //         }
          //       });
          //     }
          //
          //
          //
          //     function open (card) {
          //       if (card === LIST_CARD_ID) {
          //         updateListContacts = false;
          //         photoFileName = undefined;
          //       }
          //       owd.multiCard.go(card);
          //     }
          //
          //     var nameField = document.querySelector('#name');
          //
          //     var fields = {
          //       'name': nameField,
          //       'familyName': document.querySelector('#familyName'),
          //       'org': document.querySelector('#org'),
          //       'tel': document.querySelector('#tel'),
          //       'email': document.querySelector('#email')
          //     }
          //
          //     var currentContact = {};
          //
          //     function fillDetailsContact(contact) {
          //       currentContact = contact;
          //       for ( var field in fields) {
          //         if (fields.hasOwnProperty(field)) {
          //           var value = contact[field];
          //           var fieldElem = fields[field];
          //           if (value) {
          //             fieldElem.removeAttribute(hiddenAttr);
          //             fieldElem.value = value;
          //           } else {
          //             fieldElem.setAttribute(hiddenAttr, true);
          //             fieldElem.value = '';
          //           }
          //           fieldElem.removeAttribute (dataStateAttr);
          //         }
          //       }
          //       cName.textContent = contact.name;
          //       var img = (contact.photo) ? contact.photo : UNKNOWN_CONTACT_FILE_NAME;
          //       cPicture.src = PHOTO_PATH + img;
          //       currentContact.photo = img;
          //     }
          //
          //     function updateDetailsContact (id) {
          //       owd.contacts.api.getContactById(id, fillDetailsContact , function() { window.console.error("Error while getting a contact by id: " + id)});
          //     }
          //
          //     var editing = false;
          //
          //     function doToggleEditContact () {
          //       if (editing) {
          //         document.body.dataset.state = '';
          //         editing = false;
          //         editContact.className = '';
          //         editContact.textContent = 'Edit';
          //         for ( var field in fields) {
          //           if (fields.hasOwnProperty(field)) fields[field].setAttribute('readonly', 'readonly');
          //         }
          //       } else {
          //         document.body.dataset.state = 'edition';
          //         editing = true;
          //         editContact.className = 'accept';
          //         editContact.textContent = 'Save';
          //         for ( var field in fields) {
          //           if (fields.hasOwnProperty(field)) fields[field].removeAttribute(readonly);
          //         }
          //         nameField.focus();
          //       }
          //     }
          //
          //     function discardChanges (success) {
          //       var dialog = new owd.messaging.DialogCard('appMain');
          //       var onBackCallback = function() {
          //         dialog.hide();
          //         success(true);
          //       };
          //       dialog.setContents(owd.messaging.DialogCard.createConfirmDialogContents(onBackCallback, function() {
          //           dialog.hide();
          //           success(false);
          //         }, { successButtonTitle : 'Discard changes', cancelButtonTitle : 'Cancel'}
          //       ));
          //       dialog.show();
          //     }
          //
          //     function save (contact, doneCB, errorCB) {
          //       if (contact.name && contact.name.length > 0) {
          //         owd.contacts.api.saveContact(contact, function (contact) {
          //           doneCB(contact);
          //         }, function () {
          //           errorCB({message: 'Problems saving contact'});
          //         });
          //       } else {
          //         errorCB({emptyFields: ['name']});
          //       }
          //     }
          //
          //     function checkUpdateListCard (origin, target) {
          //       if (origin.name !== target.name || origin.photo !== target.photo) updateListContacts = true;
          //     }
          //
          //     function getContactObject() {
          //       var ret = currentContact;
          //       for ( var field in fields) {
          //         if (fields.hasOwnProperty(field)) {
          //           ret[field] = fields[field].value;
          //         }
          //       }
          //
          //       if (photoFileName) ret.photo = photoFileName;
          //
          //       return ret;
          //     }
          //
          //     return {
          //       init: function () {
          //         var mode = owd.common.getParameter('state');
          //         if (mode === 'new') {
          //           updateListContacts = true;
          //           fromNewContactIntent = true;
          //           owd.contacts.app.showNewContact(owd.common.getParameter('tel'));
          //         } else {
          //           loadContacts(mode);
          //         }
          //         scrollHandler.start();
          //         window.addEventListener('message', function (e) {
          //           var imageFileName = e.data;
          //           if (imageFileName) {
          //             cPicture.src = PHOTO_PATH + imageFileName;
          //             photoFileName = imageFileName;
          //           }
          //         }, false);
          //       },
          //
          //       showNewContact: function (number) {
          //         var elem = {photo: UNKNOWN_CONTACT_FILE_NAME};
          //         if (number && fromNewContactIntent) elem.tel = number;
          //         fillDetailsContact(owd.contacts.api.create(elem));
          //         if (!editing) doToggleEditContact();
          //         open (DETAILS_CARD_ID);
          //       },
          //
          //       showDetailsContact: function (id) {
          //         if (editing) doToggleEditContact ();
          //         updateDetailsContact(id);
          //         open (DETAILS_CARD_ID);
          //       },
          //
          //       searchContact: function () {
          //         //TODO
          //       },
          //
          //       editPhoto: function () {
          //         if (editing) {
          //           var intent = owd.intents.intent('Contacts', owd.intents.action.GET_CONTENT, owd.intents.data.IMAGE);
          //           parent.postMessage(intent, '*');
          //         }
          //       },
          //
          //       call: function (evt) {
          //         if (!editing) {
          //           var phoneNumber = evt.target.value;
          //           var intent = owd.intents.intent('Contacts', owd.intents.action.DIAL, owd.intents.data.TEL + phoneNumber, { animation: 'opacity' });
          //           parent.postMessage(intent, '*');
          //         }
          //       },
          //
          //       onFocus: function (evt) {
          //         if (evt.target.getAttribute('readonly')) {
          //           evt.preventDefault();
          //           evt.stopPropagation();
          //           evt.target.blur();
          //         } else {
          //           setTimeout(function() {
          //             cDetails.scrollToElement (evt.target);
          //           }, 200); // 100 ms for displaying keyboard
          //         }
          //       },
          //
          //       onnameChange: function (evt) {
          //         var target = evt.target;
          //         var name = target.value;
          //         if (name && name.length > 0) {
          //           cName.textContent = name;
          //           target.removeAttribute (dataStateAttr);
          //         } else {
          //           target.setAttribute (dataStateAttr, 'error');
          //         }
          //       },
          //
          //       toggleEditContact: function () {
          //         if (editing) {
          //           // Saving changes
          //           save (getContactObject(), function (contact) {
          //             checkUpdateListCard (contact, currentContact);
          //      console.log(JSON.stringify(contact));
          //             fillDetailsContact (contact);
          //             doToggleEditContact();
          //           }, function (er) {
          //             var emptyFields = er.emptyFields;
          //             if (emptyFields) {
          //               // Void fields are not allowed -> Put red border
          //               emptyFields.forEach(function(fieldName) {
          //                 fields[fieldName].setAttribute (dataStateAttr, 'error');
          //               });
          //             } else {
          //               // Reset fields
          //               owd.messaging.error(er.message);
          //               fillDetailsContact (currentContact);
          //               doToggleEditContact();
          //             }
          //           });
          //         } else {
          //           doToggleEditContact();
          //         }
          //       },
          //
          //       prev : function (success) {
          //         if (owd.multiCard.current().id !== LIST_CARD_ID) {
          //           if (updateListContacts) loadContacts();
          //           owd.multiCard.back();
          //           success(false);
          //         } else {
          //           success(true);
          //         }
          //       }
          //     } // return
  })();
}

window.addEventListener('load', function initIMEManager(evt) {
  window.removeEventListener('load', initIMEManager);
  contacts.app.init();
});
