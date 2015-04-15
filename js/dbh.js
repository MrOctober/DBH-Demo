/** Google Map Google Fusion Tables**/

// Enable the visual refresh
google.maps.visualRefresh = true;
var layer, myHtml;
var DBH_Lib = DBH_Lib || {};
var DBH_Lib = {

  //Global Definition

  //the encrypted Table ID of your Fusion Table
  googleApiKey:       "AIzaSyC26n992eoBAZfi2TcDFiXLiARVMDFRl-E",
  fusionTableId:      "1BBCdb5FnKfY2NRpiP_E0YxdKQCWdv5zfYdqjNaOb",
  locationColumn:     "Address",
  mapDefaultCenter:    new google.maps.LatLng(38.89, -77.02), //center that your map defaults to
  locationArea:      "washington dc",      //geographical area appended to all address searches
  recordName:         "result",       //for showing number of results
  recordNamePlural:   "results",

  resultsRadius:      16100, //default radius set within 30 mile radius
  mapZoom:        13, //map zoom
  addressMarker:    'images/blue-pushpin.png',
  currentPinpoint:    null,

  initialize: function() {
    geocoder = new google.maps.Geocoder();
    var myOptions = {
      zoom: DBH_Lib.mapZoom,
      center: DBH_Lib.mapDefaultCenter,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map($("#map_canvas")[0],myOptions);
	var transitLayer = new google.maps.TransitLayer();
	transitLayer.setMap(map);
	
	
    // maintains map centerpoint for responsive design
    google.maps.event.addDomListener(map, 'idle', function() {
        DBH_Lib.calculateCenter();
    });

    google.maps.event.addDomListener(window, 'resize', function() {
        map.setCenter(DBH_Lib.mapDefaultCenter);
    });
	
    DBH_Lib.searchrecords = null;

    //reset filters
    $("#search_address").val(DBH_Lib.convertToPlainString($.address.parameter('address')));
    var loadRadius = DBH_Lib.convertToPlainString($.address.parameter('radius'));
    if (loadRadius != "") {
		$("#search_radius").val(loadRadius);
	}
    else $("#search_radius").val(DBH_Lib.resultsRadius); {
		$(":checkbox").prop('checked', false);
	}
	$("#reset").click(function() {
		 	DBH_Lib.clearSearch();
			 $(":checkbox").prop('checked', false);
	 });
		
    //-----custom initializers-------
    
	
    //-----end of custom initializers-------

    //run the default search
    DBH_Lib.doSearch();
  },
  
  

  doSearch: function(location) {
    DBH_Lib.clearSearch();
    var address = $("#search_address").val();
    DBH_Lib.resultsRadius = $("#search_radius").val();
	var whereClause = DBH_Lib.locationColumn + " not equal to ''";	
	
	var tempWhereClause=[];
	
	 //--Services Filter--
	if ( $("#dbhType1").is(':checked')) {
		tempWhereClause.push("Behavioral Health")
	}
	if ( $("#dbhType2").is(':checked')) {
		tempWhereClause.push("Mental Health");
	}	
	if ( $("#dbhType3").is(':checked')) {
		tempWhereClause.push("Substance Abuse");
	}
	if ( $("#dbhType4").is(':checked')) {
		tempWhereClause.push("Addiction and Treatment");
	}
	if ( $("#dbhType5").is(':checked')) {
		tempWhereClause.push("Sexual Health/Pregnancy/Parenting");
	}
	if ( $("#dbhType6").is(':checked')) {
		tempWhereClause.push("Education/Mentoring");
	}
	if ( $("#dbhType7").is(':checked')) {
		tempWhereClause.push("Housing/Shelter");
	}
	if ( $("#dbhType8").is(':checked')) {
		tempWhereClause.push("Food");
	}
	if ( $("#dbhType9").is(':checked')) {
		tempWhereClause.push("GLBTQI-2");
	}
	if ( $("#dbhType10").is(':checked')) {
		tempWhereClause.push("Employment/Vocational");
	}
	if ( $("#dbhType11").is(':checked')) {
		tempWhereClause.push("Clothing");
	}
	if ( $("#dbhType12").is(':checked')) {
		tempWhereClause.push("Emergency Assistance/Hotline");
	}
	if ( $("#dbhType13").is(':checked')) {
		tempWhereClause.push("Legal");
	}
	if ( $("#dbhType14").is(':checked')) {
		tempWhereClause.push("Recreation/After-School Program");
	}
	if ( $("#dbhType15").is(':checked')) {
		tempWhereClause.push("Religious/Faith-based");
	}
	if ( $("#dbhType16").is(':checked')) {
		tempWhereClause.push("Medical");
	}
	if ( $("#dbhType17").is(':checked')) {
		tempWhereClause.push("Immigration");
	}
	if ( $("#dbhType18").is(':checked')) {
		tempWhereClause.push("Human Trafficking");
	}
	if ( $("#dbhType19").is(':checked')) {
		tempWhereClause.push("Advocacy");
	}
	if ( $("#dbhType20").is(':checked')) {
		tempWhereClause.push("Family Collaborative");
	}
	if ( $("#dbhType21").is(':checked')) {
		tempWhereClause.push("Government");
	}
	
	whereClause += " AND Services CONTAINS '" + tempWhereClause.join("'AND Services CONTAINS'") + "'";

	//alert(whereClause);
	
     

    //-----other filters-------
	
		
	//--Ward Filter--
	if ( $("#ward_number").val() != "")
      whereClause += " AND 'Ward' = '" + $("#ward_number").val() + "'";
	  
	  	
    //-------end of other filters--------

    if (address != "") {
      if (address.toLowerCase().indexOf(DBH_Lib.locationArea) == -1)
        address = address + " " + DBH_Lib.locationArea;

      geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          DBH_Lib.currentPinpoint = results[0].geometry.location;
          $.address.parameter('address', encodeURIComponent(address));
          $.address.parameter('radius', encodeURIComponent(DBH_Lib.resultsRadius));
          map.setCenter(DBH_Lib.currentPinpoint);
          map.setZoom(12);

          DBH_Lib.addrMarker = new google.maps.Marker({
            position: DBH_Lib.currentPinpoint,
            map: map,
			 zoom: 12,
            icon: DBH_Lib.addressMarker,
            animation: google.maps.Animation.DROP,
            title:address
          });

          whereClause += " AND ST_INTERSECTS(" + DBH_Lib.locationColumn + ", CIRCLE(LATLNG" + DBH_Lib.currentPinpoint.toString() + "," + DBH_Lib.resultsRadius + "))";

          DBH_Lib.drawresultsRadiusCircle(DBH_Lib.currentPinpoint);
          DBH_Lib.submitSearch(whereClause, map, DBH_Lib.currentPinpoint);
        }
        else {
          alert("We could not find your address: " + status);
        }
      });
    }
    else { //search without geocoding callback
      DBH_Lib.submitSearch(whereClause, map);
    }
  },
	//search by filters
  submitSearch: function(whereClause, map, location) {
    DBH_Lib.searchrecords = new google.maps.FusionTablesLayer({
      query: {
		 key: DBH_Lib.googleApiKey,
        from:   DBH_Lib.fusionTableId,
        select: DBH_Lib.locationColumn,
        where:  whereClause
      },
      styleId: 2,
      templateId: 1
    });
	
    DBH_Lib.searchrecords.setMap(map);
    DBH_Lib.getCount(whereClause);
	DBH_Lib.getList(whereClause);
	
	DBH_Lib.searchrecords.enableMapTips({
				key: DBH_Lib.googleApiKey,
				from:   DBH_Lib.fusionTableId,
				select: "Name, Contact, Address, Phone, Email, 'Web Address', Services, Description,  'Youth Service Provider', Hours, Ward",
				where:  whereClause,
                suppressMapTips: false, // optional, whether to show map tips. default false
				  geometryColumn: DBH_Lib.locationColumn, // geometry column name
                delay: 200, // milliseconds mouse pause before send a server query. default 300.
                tolerance: 8 // tolerance in pixel around mouse. default is 6.
              });
              //listen to events if desired.
              google.maps.event.addListener(DBH_Lib.searchrecords, 'mouseover', function(fEvent) {
                var row = fEvent.row;
                myHtml = 'mouseover:<br/>';
                for (var x in row) {
                  if (row.hasOwnProperty(x)) {
                    myHtml += '<b>' + x + "</b>:" + row[x].value + "<br/>";
                  }
                }
                document.getElementById('info').innerHTML = myHtml;
              });
              google.maps.event.addListener(DBH_Lib.searchrecords, 'mouseout', function(fevt) {
                document.getElementById('info').innerHTML = '';
                
              });
  },


  clearSearch: function() {
    if (DBH_Lib.searchrecords != null)
      DBH_Lib.searchrecords.setMap(null);
    if (DBH_Lib.addrMarker != null)
      DBH_Lib.addrMarker.setMap(null);
    if (DBH_Lib.resultsRadiusCircle != null)
      DBH_Lib.resultsRadiusCircle.setMap(null);
  },

  findMe: function() {
    // Try W3C Geolocation (Preferred)
    var myLocation;

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
      	function(position) {
	        myLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
	        DBH_Lib.addrFromLatLng(myLocation);
	         DBH_Lib.currentPinpoint = json.results[0].geometry.location.lat;
	          $.address.parameter('address', encodeURIComponent(address));
	          $.address.parameter('radius', encodeURIComponent(DBH_Lib.resultsRadius));
	        
	        DBH_Lib.drawresultsRadiusCircle(DBH_Lib.currentPinpoint);
	        DBH_Lib.findMe(whereClause, map, DBH_Lib.currentPinpoint);
	        map.setCenter(DBH_Lib.currentPinpoint);
	        map.setZoom(14);
      	},
	    function( error ){
	    	  alert("Please check your Location settings.")
	          console.log( "Find My Location Failed: ", error );
	    },
		{
	        timeout: (5 * 1000),
	        maximumAge: (1000 * 60 * 15),
	        enableHighAccuracy: true
		}
      );
      var positionTimer = navigator.geolocation.watchPosition(
                function( position ){
 
                    // Log that a newer, perhaps more accurate
                    // position has been found.
                    console.log( "Newer Position Found" );
 
                    // Set the new position of the existing marker.
                    DBH_Lib.currentPinpoint= position;
                }
            );
    }
    else {
      alert("Sorry, we could not find your location. Please type in location.");
    }
  },

  addrFromLatLng: function(latLngPoint) {
    geocoder.geocode({'latLng': latLngPoint}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          $('#search_address').val(results[1].formatted_address);
          $('.hint').focus();
          DBH_Lib.doSearch();
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  },

  drawresultsRadiusCircle: function(point) {
      var circleOptions = {
        strokeColor: "#4b58a6",
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: "#4b58a6",
        fillOpacity: 0.05,
        map: map,
		 zoom: 12, 
        center: point,
        clickable: false,
        zIndex: -1,
        radius: parseInt(DBH_Lib.resultsRadius)
      };
      DBH_Lib.resultsRadiusCircle = new google.maps.Circle(circleOptions);
  },

  query: function(selectColumns, whereClause, callback) {
    var queryStr = [];
    queryStr.push("SELECT " + selectColumns);
    queryStr.push(" FROM " + DBH_Lib.fusionTableId);
    queryStr.push(" WHERE " + whereClause);
	queryStr.push(" ORDER BY Name ASC ");

    var sql = encodeURIComponent(queryStr.join(" "));
    $.ajax({url: "https://www.googleapis.com/fusiontables/v1/query?sql="+sql+"&callback="+callback+"&key="+DBH_Lib.googleApiKey,
	proccessData: false,
	dataType: "jsonp"});
  },

  handleError: function(json) {
    if (json["error"] != undefined) {
      var error = json["error"]["errors"]
      console.log("Error in Fusion Table call!");
      for (var row in error) {
        console.log(" Domain: " + error[row]["domain"]);
        console.log(" Reason: " + error[row]["reason"]);
        console.log(" Message: " + error[row]["message"]);
      }
    }
  },

  getCount: function(whereClause) {
    var selectColumns = "Count()";
    DBH_Lib.query(selectColumns, whereClause,"DBH_Lib.displaySearchCount");
  },

  displaySearchCount: function(json) {
    DBH_Lib.handleError(json);
    var numRows = 0;
    if (json["rows"] != null)
      numRows = json["rows"];

    var name = DBH_Lib.recordNamePlural;
    if (numRows == 1)
    name = DBH_Lib.recordName;
    $( "#result_box" ).fadeOut(function() {
        $( "#result_count" ).html(DBH_Lib.addCommas(numRows) + " " + name + " found");
      });
    $( "#result_box" ).fadeIn();
  },
  getList: function(whereClause) {
	  var selectColumns = "Name, Contact, Address, Phone, Email, 'Web Address', Services, Description,  'Youth Service Provider', Hours, Ward";
	  DBH_Lib.query(selectColumns, whereClause, "DBH_Lib.displayList");
	},

	displayList: function(json) {
	  DBH_Lib.handleError(json);
	  var data = json["rows"];
	  var template = "";

	  var results = $("#results_list");
	  results.hide().empty(); //hide the existing list and empty it out first
	
	  if (data == null) {
		//clear results list
		results.append("<li><span class='lead'>No results found</span></li>");
	  }
	  else {
		for (row in data) {
		  template = "\
			<div class='row-fluid item-list'>\
			  <div class='span12'>\
			   <h4>"+ data[row][0] + "</a></h4>\
				" + data[row][2] + "\
				<br />\
				<strong>Ward:</strong> " + data[row][10] +"\
				<br />\
				<strong>Contact:</strong> " + data[row][1] +"\
				<br />\
				<strong>Phone:</strong> <a href='tel:" + data[row][3] + "'>" + data[row][3] + "</a>\
				<br />\
				<strong>Web:</strong> <a href='" + data[row][5] + "' target='_blank'>" + data[row][5] + "</a>\
				<br />\
				<strong>Email:</strong> <a href='mailto:" + data[row][4] + "'>" + data[row][4] + "</a>\
				<br />\
				<small><strong>Services Offered:</strong> " + data[row][6] + "</small>\
				<br />\
				<small><strong>Description:</strong> " + data[row][7] + "</small>\
				<br />\
				<small><strong>Child/Youth Provider:</strong> " + data[row][8] + "</small>\
				</div>\
			</div>"
		  results.append(template);
		}
		
	  }
	  results.fadeIn();
	},

  addCommas: function(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
  },

  // maintains map centerpoint for responsive design
  calculateCenter: function() {
    center = map.getCenter();
  },

  //sting to plain text function
  convertToPlainString: function(text) {
    if (text == undefined) return '';
  	return decodeURIComponent(text);
  }
  
  
  
  //-----custom functions-------

//Add hover over



  //-----end of custom functions-------
}

function resizeStuff() {

/* for default mobile size */
		if ($(window).width() < 800) {

	    }
		
		/* for default tablets and mobile */
		if ($(window).width() < 992) {
			$('.filterHead').removeClass('expanded');
		}

		/* for default desktop size */
		if ($(window).width() > 991) {
			$('.filterHead').toggleClass('expanded');
		}

        /* for default mobile size, corresponds with responsive.css */
        if (window.innerWidth < 800) {
			$('.dcFooterList ul').hide();
        }
        
}


/* window resize function */
var TO = false;
$(window).resize(function () {
	if (TO !== false) clearTimeout(TO);
	TO = setTimeout(resizeStuff, 100); //100 is time in miliseconds
}).resize();



$('#showMap').click(function() {
	$('#map_canvas').show();
	$(document).scrollTop($("#result_box").offset().top); 
	$('div.well.results').hide();
	return false;
});

$('#showList').click(function() {
	
	$('div.well.results').show();
	$(document).scrollTop($("#result_box").offset().top); 
	$('#map_canvas').hide();
	return false;
});

$('.filterHead').click(function() {
	$(this).toggleClass('expanded');
	$(this).siblings('.filterBody').slideToggle("fast");
});
