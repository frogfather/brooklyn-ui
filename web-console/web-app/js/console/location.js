Brooklyn.location = (function() {
    // Config
    var tableId = '#location-data';
    var aoColumns = [ { "mDataProp": "name", "sTitle": "Location", "sWidth":"100%"  }];
    var appLocations;
    //= [
      //  {"name": "London, UK", "resources": "60", "location":"somewhere"},
        //{"name": "Edinburgh, UK" ,"resources": "25"},
        //{"name": "Tokyo, Japan", "resources": "500"},
        //{"name": "New York, USA", "resources": "400"},
        //{"name": "California, USA", "resources": "600"},
        //{"name": "Hertfordshire, UK", "resources": "25"},
       // {"name": "Silicon Valley, USA", "resources": "25"},
        //{"name": "Hong Kong, China" , "resources": "25"},
        //{"name": "Shanghai, China" , "resources": "25"},
        //{"name": "Brooklyn, USA", "resources": "25"},
        //{"name": "Berlin, Germany", "resources": "25"}
    //];

    // Status
    var map;
    var loc;
    var locationNumber = 0;

    function updateLocation(event) {
        var result = Brooklyn.tabs.getDataTableSelectedRowData(tableId, event);

        // TODO why is this necessary? (location, etc should be in result!)
        for(i in appLocations) {
            if (appLocations[i].name === result.name) {
                locationNumber = i;
                moveToLoc();
                break;
            }
        }
 		$(event.target.parentNode).addClass('row_selected');
    }

    function moveToLoc() {
        var settings = Brooklyn.tabs.getDataTable(tableId).fnSettings().aoData;
        for(row in settings) {
       		$(settings[row].nTr).removeClass('row_selected');
   		}

        for(i in appLocations) {
             appLocations[i].infowindow.close(map , appLocations[i].marker);
        }

        map.setCenter(appLocations[locationNumber].location);
        appLocations[locationNumber].infowindow.open(map , appLocations[locationNumber].marker);
    }

    function addLocationToMap(address , i){
        new google.maps.Geocoder().geocode( { 'address': address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                loctext = results[0].formatted_address;
                loc = results[0].geometry.location;
                appLocations[i].location = loc;
                var contentString = '<div id="content" style="height:80px">'+
                '<h1>'+address+'</h1>'+
                '<table border="1">'+
                    '<tr>'+
                        '<td>Address</td>'+
                        '<td>Active</td>'+
                        '<td>Resources</td>'+
                    '</tr>'+
                    '<tr>'+
                        '<td>'+loctext+'</td>'+
                        '<td>True</td>'+
                        '<td>'+'resources'+'</td>'+
                    '</tr>'+
                '</table>'+
                '</div>';
                var marker = new google.maps.Marker({
                    map: map,
                    position: loc ,
                    title: loctext
                });
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                google.maps.event.addListener(marker, 'click' , function(){
                    infowindow.open(map , marker);
                });
                appLocations[i].marker = marker;
                appLocations[i].infowindow = infowindow;
                appLocations[i].locationNumber = i;
                locationNumber = locationNumber + 1;
            } else {
                alert("Geocode was not successful for the following reason: " + status);
            }
        });
    }

    function toggleLocation(e){
        if(appLocations.length <= ++locationNumber) {
            locationNumber = 0;
        }
        moveToLoc();
    }

    // TODO call when set of locations changes?
    function updateLocations() {
        var myOptions = {
            width:400,
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        }

        map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
        //if(update){
        for(i in appLocations) {
           // alert(appLocations[i].name);
            addLocationToMap(appLocations[i].name, i);
           // alert(appLocations[i].name+' added to map');
            }
        //}

        Brooklyn.tabs.getDataTable(tableId, '.', aoColumns, updateLocation, appLocations);
    }

    function resize(e, id) {
        if (id === 'location') {
            $('#map-canvas').width('98%');
            $('#map-canvas').height('500px');
            google.maps.event.trigger(map, 'resize');
            if(appLocations.length <= locationNumber) {
                locationNumber = 0;
            }
            map.setCenter(appLocations[locationNumber].location);
        }
    }
    function getLocations(e,id){
        if (typeof id !== 'undefined') {
            $.getJSON("info?id=" + id, handleLocations).error(
                function() {$(Brooklyn.eventBus).trigger('update_failed', "Could not get entity info to show in summary.");});
        }
    }

    function handleLocations(json){
        appLocations = new Array();
        if (json.locations.length > 0) {
            //alert('There are some locations');
            for(i in json.locations){
                var location = json.locations[i];
                //alert(location);
                var jsonLoc = {name:json.locations[i],resources:'500'};
                //alert(JSON.stringify(jsonLoc));
                appLocations.push(jsonLoc);
            }
            updateLocations();
        } else {
            //alert('there are no locations');
            updateLocations();
        }
    }
    

    function init() {
        $('#toggle-location').click(toggleLocation);
        $(Brooklyn.eventBus).bind("tab_selected", resize);
        $(Brooklyn.eventBus).bind("entity_selected", getLocations);
    }

    return { init : init, resize : resize, locationNumber: locationNumber, appLocations: appLocations }
})();

$(document).ready(Brooklyn.location.init);




