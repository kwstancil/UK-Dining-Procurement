document.addEventListener('DOMContentLoaded', function() {
    var gData
    var URL = "11aWWSHARNjsun4psp05vNBvVw8h_vRTf3ozPF0J9Vgc"
    Tabletop.init({ 
        key: URL, 
        callback: showInfo, 
        simpleSheet: true 
    })
})

function showInfo(gData) {
    var map = Sheetsee.loadMap("map");
    var basemap = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    var optionsJSON = ["rowNumber","vendor", "type", "items", "ingredients", "distributor", "address", "city", "state", "zip", "typeingredients"]
    var geoJSON = Sheetsee.createGeoJSON(gData, optionsJSON)
    console.log(geoJSON);

    function iconSelect (type, ingredients) {
        return type == 'A' && ingredients == '1' ? 'img/blueCircle.svg':
            type == 'A' && ingredients == '2' ? 'img/blueTriangle.svg':
            type == 'A' && ingredients == '3' ? 'img/blueSquare.svg':
            type == 'B' && ingredients == '1' ? 'img/greenCircle.svg':
            type == 'B' && ingredients == '2' ? 'img/greenTriangle.svg':
            type == 'B' && ingredients == '3' ? 'img/greenSquare.svg':
            type == 'C' && ingredients == '2' ? 'img/yellowTriangle.svg':
            type == 'C' && ingredients == '3' ? 'img/yellowSquare.svg':
            '../img/1x1.png';
    }

    markerLayer = L.geoJson(geoJSON,{
        pointToLayer: function(feature,latlng) {
            var infotype = feature.opts.infotype;
            var type = feature.opts.type;
            var ingredients = feature.opts.ingredients;
            var featureIcon = L.icon({
                iconUrl: iconSelect(type, ingredients),
                iconSize: [9,9]
            })
            var marker = L.marker(latlng,{
                icon: featureIcon
            });
            return marker
        }
    }).addTo(map);
// markerLayer = L.geoJson(geoJSON).addTo(map);
    map.fitBounds(markerLayer.getBounds())

    tableOptions = {
        "data": gData, 
        "tableDiv": "#beerTable", 
        "filterDiv": "#tableFilter"
    }

    Sheetsee.makeTable(tableOptions)
    Sheetsee.initiateTableFilter(tableOptions)
     
    // TABLE CLICK
    $('.beerRow').live("click", function(event) {
        //TABLE
        $('.beerRow').removeClass("selectedRow")
        var rowNumber = $(this).closest("tr").attr("id")
        $('#' + rowNumber).addClass("selectedRow")
        
        var dataElement = Sheetsee.getMatches(gData, rowNumber, "rowNumber")
        
        //MAP
        var selectedCoords = [dataElement[0].lat, dataElement[0].long]
        map.setView(selectedCoords, 14)

        // INFOPANE
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

    // MAP MARKER CLICK
    markerLayer.on('click', function(e) {
        // TABLE
        $('.beerRow').removeClass("selectedRow")
        var rowNumber = e.layer.feature.opts.rowNumber
        $('#' + rowNumber).addClass("selectedRow")

        var dataElement = Sheetsee.getMatches(gData, rowNumber.toString(), "rowNumber")
        var selectedBeer = Sheetsee.ich.selectedBeer({
            rows: dataElement
        })
        
        // MAP
        selectedMarkerLocation = [dataElement[0].lat, dataElement[0].long]
        map.setView(selectedMarkerLocation, 14)
        
        // INFOPANE
        $('#selectedBeer').html(selectedBeer).css("display", "inline")
    })

    // resets the map to the extent of the feature layer when you click the reset map button
    $('.resetMap').click(function() {
        // TABLE
        // Clear whatever row is selected of the .selectedRow style
        $('.beerRow').removeClass("selectedRow")
        
        // INFOPANE
        // Clear the infopane of the info about the most recently selected beer place
        $('#selectedBeer').css("display", "none")

        // MAP
        // Center map and set zoom to include all the markers
        map.fitBounds(markerLayer.getBounds())
    })
}