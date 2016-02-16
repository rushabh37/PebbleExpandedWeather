/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');
// This is just used for tuple x,y/width/height specification
var vector2 = require('vector2');
// Accelerometer utilities
var Accel = require('ui/accel');
// Vibrate the watch
var Vibe = require('ui/vibe');

// Show splash screen while waiting for data
var splashWindow = new UI.Window();
var APPID = '5d03929aca48a14cb15264b52293cb8f';
var CITY = 'Boston';
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
    // for(var i = 0; i < menuItems.length; i++) {
    //   console.log(menuItems[i].title + ' | ' + menuItems[i].subtitle);
    // }
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
    
    resultsMenu.on('select', function (e) {
      // Get the forecast. Menu is indexed as returned data
      var forecast = data.list[e.itemIndex];
      
      // Assemble body string
      var content = data.list[e.itemIndex].weather[0].description;
      
      // Capitalize first letter
      content = content.charAt(0).toUpperCase() + 
                content.substring(1);
      
      // Add temperature, pressure etc. 
      // Add temperature, pressure etc
      content += '\nTemperature: ' + 
                 Math.round(forecast.main.temp - 273.15) + '°C' +
                 '\nPressure: ' + 
                 Math.round(forecast.main.pressure) + ' mbar' +
                 '\nWind: ' + 
                 Math.round(forecast.wind.speed) + ' mph, ' + 
                 Math.round(forecast.wind.deg) + '°';
      
      // Create the Card for detailed view
      var detailCard = new UI.Card({
        title:'Details',
        subtitle:e.item.subtitle,
        body: content
      });
      
      // Register for 'tap' events
      resultsMenu.on('accelTap', function(e) {
        console.log('TAP!');
        console.log('axis: ' + e.axis + ', direction:' + e.direction);
        // Create an array of Menu items
        var newItems = parseFeed(data, 10);
      
        // Update the Menu's first section
        resultsMenu.items(0, newItems);
        // Notify the user
        Vibe.vibrate('short');
      });
      detailCard.show();
    });
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);

// Prepare the accelerometer
Accel.init();


// Add to slashWindow and show
splashWindow.add(text);
splashWindow.show();