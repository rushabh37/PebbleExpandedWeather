/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
// This is just used for tuple x,y/width/height specification
var vector2 = require('vector2');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();
var APPID = '5d03929aca48a14cb15264b52293cb8f';
var CITY = 'Seattle';
var URL = 'http://api.openweathermap.org/data/2.5/forecast?q=' +
           CITY + '&appid=' + APPID;

var text = new UI.Text({
  position: new vector2(0,0),
  size: new vector2(144,168),
  text: 'Downloading weather data...',
  font: 'GOTHIC_28_BOLD',
  color: 'black',
  textOverflow: 'wrap',
  textAlign: 'center',
  backgroundColor: 'white'
});

var parseFeed = function(data, quantity) {
  var items = [];
  for(var i = 0; i < quantity; i++) {
    // Always upper case the description string
    var title = data.list[i].weather[0].main;
    title = title.charAt(0).toUpperCase() + title.substring(1);

    // Get date/time substring
    var time = data.list[i].dt_txt;
    time = time.substring(time.indexOf('-') + 1, time.indexOf(':') + 3);

    // Add to menu items array
    items.push({
      title:title,
      subtitle:time
    });
  }

  // Finally return whole array
  return items;
};


// Make request to openweathermap.org
ajax(
  {
    url:URL,
    type:'json'
  },
  function(data) {
    // Create an array of Menu items
    var menuItems = parseFeed(data, 10);
    // Check the items are extracted OK
    for(var i = 0; i < menuItems.length; i++) {
      console.log(menuItems[i].title + ' | ' + menuItems[i].subtitle);
    }
    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Current Forecast',
        items: menuItems
      }]
    });
    
    // Show the Menu, hide the splash
    resultsMenu.show();
    // As the splash window is hidden that means it will not show up
    // when we press the back button
    // If not hidden back button should have result in 
    // splash window display.
    splashWindow.hide();
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);


// Add to slashWindow and show
splashWindow.add(text);
splashWindow.show();