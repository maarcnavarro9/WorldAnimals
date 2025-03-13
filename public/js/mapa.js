let marcador;
let mapa;

async function initMap() {

    // Ubicación inicial (Madrid como ejemplo)
    const ubicacion = { lat: 40.416775, lng: -3.703790 };

    // Creamos el mapa y lo centramos en la ubicación indicada
    mapa = new google.maps.Map(document.getElementById('map'), {
        zoom: 3,
        center: ubicacion
    });

    // Agregamos un marcador inicial
    marcador = new google.maps.Marker({
        position: ubicacion,
        map: mapa,
        title: "Mi Ubicación"
    });
}

window.initMap = initMap;