
'use strict';

var contacts = window.contacts || {};

if (!contacts.AlphaScroll) {

  (function(doc) {

    var alphaScrollBar = doc.querySelector('.vw-jmp-inner');
    var lContacts = doc.querySelector('.vw-bdy-inner');
    var tap = 'mousedown', move = 'mousemove';
    var letterElemType = 'ABBR', prefixGroup = '#group-';

    var cas = contacts.AlphaScroll = {
      state: {
        letter: undefined
      },

      start: function th_start() {
        alphaScrollBar.addEventListener(tap, this);
        alphaScrollBar.addEventListener(move, this);
      },

      onMove: function th_touchStart(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        var state = this.state;

        var currentLetter = evt.target.textContent;

        if (evt.target.nodeName === letterElemType &&
            currentLetter && currentLetter !== state.letter) {
          state.letter = currentLetter;
          var groupContainer = doc.querySelector(prefixGroup + currentLetter);
          if (groupContainer) {
            lContacts.scrollTop = groupContainer.previousSibling.offsetTop;
          }
        }
      },

      handleEvent: function th_handleEvent(evt) {
        var type = evt.type;
        if (type === tap || type === move) {
          this.onMove(evt);
        }
      }
    }

    cas.start();

  })(document);
}