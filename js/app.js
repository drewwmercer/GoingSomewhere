var mapInitialized = false;

// Initialize Firebase
var config = {
  apiKey: "AIzaSyD1wYOxE3hqoAV9F3FBNXaQGXLWtDG3MMU",
  authDomain: "project-1-175917.firebaseapp.com",
  databaseURL: "https://project-1-175917.firebaseio.com",
  projectId: "project-1-175917",
  storageBucket: "project-1-175917.appspot.com",
  messagingSenderId: "784499710582"
};
firebase.initializeApp(config);

var database = firebase.database();

$(document).ready(function() {
  // Populate random quote into footer (content courtesy of http://theplanetd.com/the-ultimate-travel-quotes-as-chosen-by-you/)
  var quotes = new Array('“Travel is  fatal to prejudice, bigotry, and narrow mindedness, and many of our people need it sorely on these accounts.” ~ Mark Twain','"The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.” ~ Marcel Proust','“If you think adventure is dangerous, try routine, it is lethal.”','“Great things never came from comfort zones.”','“If you are always trying to be normal, you will never know how amazing you can be.”','“Stop worrying about the potholes in the road and enjoy the journey.”','“Fear is only temporary. Regrets last forever.”','“Life begins at the end of your comfort zone.”','“Travel does not become adventure until you leave yourself behind.”','“Climb the mountain so you can see the world, not so the world can see you."','“Man cannot discover new oceans unless he has the courage to lose sight of the shore.” ~ Andre Gide','“It is not the destination where you end up, but the mishaps and memories you create along the way.”','“I would rather own a little and see the world, than own the world and see a little of it.”','“It is better to see something once than to hear about it a thousand times.”','“The real voyage of discovery consists not in seeking new landscapes, but having new eyes.”','“I travel not to go anywhere, but to go. I travel for travel\'s sake.”','“Live with no excuses and travel with no regrets.”','“We travel not to escape life but for life not to escape us.”','“People don\'t take trips, trips take people.”','“Travel makes one modest, you see what a tiny place you occupy in the world.”','“Like all great travellers, I have seen more than I remember and remember more than I have seen.”','“Don\'t listen to what they say, go see.” ~ Chinese Proverb','“Whenever you find yourself on the side of majority, it\'s time to pause and reflect.”','“Those who follow the crowd usually get lost in it.”','“The world is changed by your example, not your opinion.”','“To travel is to discover that everyone is wrong about other countries.”','“You must be the change you wish to see in the world.”','“Don\'t quit your day dream.”','“There\'s a sunrise and sunset every single day, and they\'re absolutely free. Don\'t miss so many of them.”','“Life isn\'t about finding yourself. Life is about creating yourself.”','“If your ship doesn\'t come in, swim out to it.”','“Because when you stop and look around, this life is pretty amazing.”','“Without new experiences something inside us sleeps. The sleeper must awaken.”','“Doing what you like is freedom, liking what you do is happiness.”','“You only live once, but if you do it right, once is enough.” ~ Mae West','“This heart of mine was made to travel this world”','“I don\'t know where I\'m going, but I\'m on my way."','"The impulse to travel is one of the hopeful symptoms of life.”','“Let\'s find some beautiful place to get lost.”','“I\'m in love with cities I\'ve never been to and people I\'ve never met.”','“It\'s a big world out there, it would be a shame not to experience it.”','“You can shake the sand from your shoes, but not from your soul.”','“I want to make memories all over the world.”','“Someday I\'m going to be free and I\'m going to travel the world.”','“We wander for distraction, but we travel for fulfillment.”','“It doesn\'t matter where you\'re going, it\'s who you have beside you.”','“Traveling is not something you\'re good at. It\'s something you do, like breathing.” ~ Gayle Foreman','“All we have to decide is what to do with the time that is given us.”','“Let your memory be your travel bag.”','“It feels good to be lost in the right direction.”','“Traveling allows you to become so many different versions of yourself.”','“Travel…the best way to be lost and found at the same time.” ~ Brenna Smith','“Travel has a way of stretching the mind.”','“Oh, the places you\'ll go!" ~ Dr. Seuss','“Wandering re-establishes the original harmony which once existed between man and the universe.”','“All journeys have secret destinations of which the traveler is unaware.”','“A journey is best measured in friends rather than miles.”','“The journey is my home.”','“Just go. Go see all the beauty in the world.”','“Where to next?”');
  randNo = quotes[Math.floor( Math.random() * quotes.length )];
  $('.inspirationalQuote').text( randNo );
  
  // Slick responsive carousel
  $("#carousel").slick({
    dots: true,
    infinite: true,
    speed: 500,
    fade: true,
    cssEase: "linear",
    autoplay: true,
    autoplaySpeed: 3000
  });
  
  // Materialize full-width carousel
  $('.carousel.carousel-slider').carousel({fullWidth: true});

  // Search Button
  $(".searchBtn").on("click", function() {
    handleClick($("input").val());
  });
  $("#locationText").keydown(function(e) {
    if (e.keyCode === 13) {
      handleClick($("input").val());
    }
  });
  database.ref().limitToLast(5).on("child_added", function(childSnapshot) {
    var recent = childSnapshot.val();
    $("#recentSearches").prepend(childSnapshot.val().searched + "</br>");
  });
});

function handleClick(location) {
  $("#locationText").removeClass("invalid");
  $("#locationLabel").hide();
  var isValid = checkInput(location);
  if (isValid) {
    getImages(location);
    getGeoLocation(location);
    getWeatherData(location);
    saveToFirebase(location);
  } else {
    $("#locationText").addClass("invalid");
    $("#locationLabel").text("Please enter a valid location");
    $("#locationLabel").show();
  }
}

function checkInput(input) {
  return /^([a-zA-Z,. ]{2,})$/.test(input);
}

// Google Maps API

// Google GeoLocation API
function getGeoLocation(location) {
  $("#output").html("");
  var geoCodeUrl = "https://maps.googleapis.com/maps/api/geocode/json";
  geoCodeUrl +=
    "?" +
    $.param({
      address: location
    });

  // call places API when geocode request completes pass long/lat to getPlaces results.geometry.location.lng/ results.geometry.location.lat
  $.getJSON(geoCodeUrl).done(function(response) {
    console.log(geoCodeUrl);

    console.log(response);

    var lng = response.results[0].geometry.location.lng;
    var lat = response.results[0].geometry.location.lat;

    getPlacesData(lng, lat);

    console.log();
  });
}

// Google Places API
function getPlacesData(lng, lat) {
  $("#mapRow").append(
    '<input id="pac-input" class="controls" type="text" placeholder="Search Box">'
  );
  $("#map").height("600");

  // call places api
  var map = new google.maps.Map($("#map")[0], {
    center: { lng: lng, lat: lat },
    zoom: 13,
    mapTypeId: "roadmap"
  });

  var input = $("#pac-input");

  var searchBox = new google.maps.places.SearchBox(input[0]);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input[0]);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener("bounds_changed", function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];

  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener("places_changed", function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(
        new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        })
      );

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
}

//  Pixabay API
function getImages(location) {
  $("#output").html("");
  var pixabayUrl = "https://pixabay.com/api/";
  pixabayUrl +=
    "?" +
    $.param({
      key: "6114248-3201904a0454e01f4e0f4344f",
      q: location,
      image_type: "photo",
      safesearch: true,
      per_page: 9,
      category: "travel"
    });

  $.getJSON(pixabayUrl).done(function(response) {
    console.log(pixabayUrl);

    console.log(response);

    for (var i = 0; i < response.hits.length; i++) {
      //makeTags = JSON.stringify(response.hits[i].tags);
      //makeTagsParsed = JSON.parse(makeTags);
      $("#output").append('<a  target="_blank" href="' + response.hits[i].pageURL + '">' + '<img class="z-depth-1 hoverable" src="' + response.hits[i].webformatURL + '" />' + '</a>');
      //console.log(makeTags,response.hits[i].tags, makeTagsParsed);
      //$("#output").addClass("card-title", makeTags[0]);
      //$(".card").append('<span class="card-title">' + makeTags[0] + '</span>');
    }

    console.log();
  });
}

// Weather API

function getWeatherData(location) {
  var query =
    'select * from weather.forecast where woeid in (select woeid from geo.places(1) where text="' +
    location +
    '")';

  var weatherURL = "https://query.yahooapis.com/v1/public/yql";
  weatherURL +=
    "?" +
    $.param({
      q: query,
      format: "json",
      env: "store"
    });

  $.getJSON(weatherURL).done(function(response) {
    console.log(response);
    $("#weather").html("");
    $("#weather").append('<div class="card-panel teal col m1"> Date </br> Day </br> High (F) </br> Low (F) </br> Condition </br></div>');
    //query.results/channel.item.forcast
    for (
      var i = 0;
      i < response.query.results.channel.item.forecast.length - 5;
      i++
    ) {
      var result = response.query.results.channel.item.forecast[i];
      // $('#weather').append('<li>' + result.date + ': ' + result.text + '</li>');
      var html = '<div class="dayBlock">';
      html += '<div class="dateStyle">' + result.date + "</div>";
      html += '<div class="dayStyle">' + result.day + "</div>";
      html += '<div class="highStyle">' + result.high + "</div>";
      html += '<div class="lowStyle">' + result.low + "</div>";
      html += '<div class="textStyle">' + result.text + "</div>";
      html += "</div>";
      //$("#weather").append(html);
      $("#weather").append('<div class="card-panel teal col m2">' + result.date + ' </br>' + result.day +  ' </br>' + result.high + ' </br>' + result.low + ' </br>' + result.text + '</div>');
    }
  });
}

// Firebase API
function saveToFirebase(location) {
  console.log("city searched: " + location);

  database.ref().push({
    searched: location
  });

  $("#recentSearches").empty();
  database.ref().limitToLast(5).on("child_added", function(childSnapshot) {
  recent = childSnapshot.val();
    $("#recentSearches").prepend(recent.searched + "</br>");
  });
}
