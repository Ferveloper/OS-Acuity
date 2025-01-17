/* jshint undef: true, strict: true, esversion: 6 */
/* globals $, document, jQuery, alert, console, window, setTimeout */


// Global Variables with default values
var fullScreen = false;    // Track if window is in full screen mode
var qMenu = false;         // Track if the menu is open
var optoMirror = false;    // Track if optotype is mirrored
var optoIndex = 3;         // Track currently displayed optotype size. Defaults to 20/20. Corresponds with "index" in optoRatios
var optoSize = 8.7500;     // Height of 20/20 font in mm at 20 feet. Calculation by Dr. Christopher Carver, O.D.
var pxSize = 0.2740;       // Dimensions of a single pixel on the screen in mm
var losDft = 20.0;         // Line-of-sight in whole feet.
var losDin = 0.0;          // Line-of-sight inches that extend beyond last whole foot.


// Functions to simplify cookies. (Source: https://www.quirksmode.org/js/cookies.html)
function setCookie(name, value, days) {
   'use strict';

   var expires = "";
   if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
   }
   document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
   'use strict';

   var nameEQ = name + "=";
   var ca = document.cookie.split(';');
   for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
   }
   return null;
}

function eraseCookie(name) {
   'use strict';

   document.cookie = name + '=; Max-Age=-99999999;';
}


// Checks for existing cookies. Replace default values if cookies exist.
if (getCookie('losDft')) {
   losDft = parseFloat(getCookie('losDft'));
}

if (getCookie('losDin')) {
   losDin = parseFloat(getCookie('losDin'));
}

if (getCookie('pxSize')) {
   pxSize = parseFloat(getCookie('pxSize'));
}

if (getCookie('optoMirror') === 'true') {
   optoMirror = true;
}


// Calculate line of sight distance by adding losDft + losDin
var losD = losDft + (losDin / 12);


// List of all available optotype sizes and their corresponding ratio
var optoRatios = [{
   index: 1,
   display: `${20 / 10} (20/10)`,            // E.g. 20/10 vision
   ratio: 0.5,             // Ratio when compared with 20/20 optotype
   letters: 5              // How many letters to display at this size
}, {
   index: 2,
   display: `${20 / 15} (20/15)`,
   ratio: 0.75,
   letters: 5
}, {
   index: 3,
   display: `${20 / 20} (20/20)`,
   ratio: 1.0,
   letters: 5
}, {
   index: 4,
   display: `0.9 (20/${Math.round(20 / 0.9 * 100) / 100})`,
   ratio: 1 / 0.9,
   letters: 5
}, {
   index: 5,
   display: `${20 / 25} (20/25)`,
   ratio: 1.25,
   letters: 5
}, {
   index: 6,
   display: `0.7 (20/${Math.round(20 / 0.7 * 100) / 100})`,
   ratio: 1 / 0.7,
   letters: 5
}, {
   index: 7,
   display: `${Math.round(20 / 30 * 100) / 100} (20/30)`,
   ratio: 1.5,
   letters: 5
}, {
   index: 8,
   display: `0.6 (20/${Math.round(20 / 0.6 * 100) / 100})`,
   ratio: 1 / 0.6,
   letters: 5
}, {
   index: 9,
   display: `${20 / 40} (20/40)`,
   ratio: 2.0,
   letters: 5
}, {
   index: 10,
   display: `${20 / 50} (20/50)`,
   ratio: 2.5,
   letters: 5
}, {
   index: 11,
   display: `${Math.round(20 / 60 * 100) / 100} (20/60)`,
   ratio: 3.0,
   letters: 5
}, {
   index: 12,
   display: `${Math.round(20 / 70 * 100) / 100} (20/70)`,
   ratio: 3.5,
   letters: 5
}, {
   index: 13,
   display: `${20 / 80} (20/80)`,
   ratio: 4.0,
   letters: 5
}, {
   index: 14,
   display: `${20 / 100} (20/100)`,
   ratio: 5.0,
   letters: 3
}, {
   index: 15,
   display: `${20 / 200} (20/200)`,
   ratio: 10.0,
   letters: 2
}, {
   index: 16,
   display: `${20 / 400} (20/400)`,
   ratio: 20.0,
   letters: 1
}];


// Generate random letters
function optoType() {
   'use strict';

   let optoLength, optoChars, optoString = '';
   let resizeObj = optoRatios.find(o => o.index == optoIndex);
   optoLength = resizeObj.letters;
   optoChars = 'CDEFHKNPRUVZ';   // These are the standard letters used for optotype.


   // Loops until characters are found
   while (optoString.length < 1) {
      let optoText = '', rlast = '', rnow = '';

      for (var i = 0; i < optoLength; i++) {
         let rnum = Math.floor(Math.random() * optoChars.length);

         rnow = optoChars.substring(rnum, rnum + 1);

         // Prevent two of the same letter appearing side by side
         if (rnow != rlast) {

            // Add a space between letters
            if (optoText.length > 0) {
               optoText += '     ';
            }

            rlast = rnow;
            optoText += rnow;

         } else {
            i--;
         }

      }

      // Blacklist Filter
      if (optoText.search('F U C') == -1 && optoText.search('F U K') == -1 && optoText.search('N U D E') == -1 && optoText.search('F E C K') == -1 && optoText.search('D R U N K') == -1 && optoText.search('P E C K') == -1 && optoText.search('C U C K') && optoText != 'F U') {
         optoString = optoText;
      }
   }

   return optoString;
}

// Toggles a notice that the window is not in full screen mode
function f11Toggle() {
   'use strict';

   if (((window.innerWidth / window.screen.width) >= 0.95) && ((window.innerHeight / window.screen.height) >= 0.95)) {
      $('#goFullScreen').hide();
      fullScreen = true;
   } else {
      $('#goFullScreen').show();
      fullScreen = false;
   }

   return true;
}

// Changes the size of the optotype on arrow key presses and also on configuration changes
function changeSize(newIndex) {
   'use strict';

   if ((newIndex <= 16) && (newIndex >= 1)) {
      let resizeObj = optoRatios.find(o => o.index == newIndex);
      $('#displayType').css('font-size', (((optoSize * resizeObj.ratio) / pxSize) * 2 * (losD / 20)));
      $('#acuitySize').text(resizeObj.display + Math.round((optoSize * resizeObj.ratio) * (losD / 20) * 100) / 100 + 'mm, '
         + Math.round(((optoSize * resizeObj.ratio) / pxSize) * 2 * (losD / 20) * 100) / 100 + 'px');
      $('#displayType').text(optoType());
   }
}


// These functions run automatically when the page loads
$(function () {
   'use strict';

   // Hide/show certain pop ups
   f11Toggle();
   $('#q').hide();

   // Set initial text and size
   changeSize(optoIndex);
   $('#displayType').text(optoType());

   // Mirror text
   if (optoMirror == true) {
      $('#displayType').addClass('mirror');
   }

   // Full screen detection (and reaction)
   $(window).resize(function () {
      setTimeout(() => {
         f11Toggle();
         // Add additional functions here
      }, 100);
   });

   // Do things when keys are pressed
   $(document).keydown(function (e) {
      console.log(e.keyCode)

      // Key press: ← or → (left or right)
      // Randomizes optotype.
      if (e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 53) {
         $('#displayType').text(optoType());
      }

      // Key press: ↑ (up)
      // Increases size
      if (e.keyCode == 38 || e.keyCode == 50) {

         if (optoIndex < 16) {
            optoIndex++;
            changeSize(optoIndex);
         }

      }

      // Key press: ↓ (down)
      // Decreases size
      if (e.keyCode == 40 || e.keyCode == 56) {

         if (optoIndex > 1) {
            optoIndex--;
            changeSize(optoIndex);
         }

      }

      // Key press: q
      // Opens menu
      if (e.keyCode == 81) {

         if (qMenu == false) {
            // Show the menu
            $('#q').show();
            qMenu = true;

            // Get values from memory
            $('#losDft').val(losDft);
            $('#losDin').val(losDin);
            $('#pxSize').val(pxSize);
            $('#optoMirror').prop('checked', optoMirror);

         } else {
            // Hide the menu
            $('#q').hide();
            qMenu = false;

            // Commit changes to memory
            losDft = parseFloat($('#losDft').val());
            losDin = parseFloat($('#losDin').val());
            losD = losDft + (losDin / 12);
            pxSize = parseFloat($('#pxSize').val());

            // Mirror text if checked
            if ($('#optoMirror').is(':checked')) {
               optoMirror = true;
               $('#displayType').addClass('mirror');
            } else {
               optoMirror = false;
               $('#displayType').removeClass('mirror');
            }

            // Commit changes to cookies
            setCookie('losDft', losDft, 3650);
            setCookie('losDin', losDin, 3650);
            setCookie('pxSize', pxSize, 3650);
            setCookie('optoMirror', optoMirror, 3650);

            // Adjust on screen size accordingly
            changeSize(optoIndex);

         }

      }

   });

   // Reset cookies and configuration values to default
   $('#qReset').click(function () {
      // Reset values
      optoMirror = false;
      pxSize = 0.2740;
      losDft = 20.0;
      losDin = 0.0;

      // Re-calculate distance
      losD = losDft + (losDin / 12);

      // Fix values displayed on screen
      $('#losDft').val(losDft);
      $('#losDin').val(losDin);
      $('#pxSize').val(pxSize);
      $('#optoMirror').prop('checked', optoMirror);

   });

});
