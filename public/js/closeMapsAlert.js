let times = [100, 200, 300, 400, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];

times.forEach(function (time) {
    setTimeout(function () {
        let acceptButton = document.querySelector('.dismissButton');
        if (acceptButton) {
            acceptButton.click();
            console.log(`Botón clickeado después de ${time} ms.`);
        }
    }, time);
});