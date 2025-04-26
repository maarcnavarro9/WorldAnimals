const socketIA = io();
let detener = false;

const botonDetenerEscritura = document.getElementById('detenerEscritura');
const spinner = document.getElementsByClassName('spinner');

botonDetenerEscritura.addEventListener('click', () => {
    detener = true;
});

socketIA.on('message', function (msg) {
    const messageItem = document.createElement('div');
    messageItem.classList.add('mensajeRecibidoContainer');
    mensajesContainer3.appendChild(messageItem);
    mensajesContainer3.scrollTop = mensajesContainer3.scrollHeight;

    let texto = msg.response;
    let index = 0;
    detener = false;

    botonDetenerEscritura.style.display = "flex"; // Mostrar al comenzar

    function escribirLetra() {
        Array.from(spinner).forEach(sp => sp.remove());

        if (detener || index >= texto.length) {
            botonDetenerEscritura.style.display = "none"; // Ocultar al terminar
            return;
        }

        messageItem.textContent += texto.charAt(index);
        index++;
        setTimeout(escribirLetra, 30);
        mensajesContainer3.scrollTop = mensajesContainer3.scrollHeight;
    }

    escribirLetra();
});