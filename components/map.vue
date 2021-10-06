<script>

const {Loader} = require('google-maps');

export default {
    // calculateDistance: function(origin, destinations) {

    //     if (typeof origin == "string") {
    //         origin = this.parseСoordinates(origin)
    //     }

    //     if (typeof destinations == "string") {
    //         destinations = this.parseСoordinates(destinations)
    //     }

    //     const loader = new Loader('AIzaSyARqEL__oB6pdnUAbLBjRgPgNSpu5PPpgQ');

    //     return loader.load().then(function (google) {

    //         const service = new google.maps.DistanceMatrixService()
    //         return service.getDistanceMatrix(
    //         {
    //             origins: [origin],
    //             destinations: [destinations],
    //             travelMode: google.maps.TravelMode.DRIVING,
    //             unitSystem: google.maps.UnitSystem.IMPERIAL,
    //             avoidHighways: false,
    //             avoidTolls: false,
    //             avoidFerries: true
    //         },
    //         (response, status) => {
    //             if (status !== "OK") {
    //                 alert("Error was: " + status)
    //             } else {
    //                 console.log("==========");
    //                 console.log(response);
    //                 console.log("==========");
    //                 return response
    //             }
    //         });
    //     });
    // },
    parseСoordinates: function(coordinates) {
        let a = coordinates.split(',');
        return { lat: parseFloat(a[0]), lng: parseFloat(a[1]) };
    }
}
</script>