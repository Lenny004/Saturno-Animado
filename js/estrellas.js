/**
 * Estrellas decorativas — esparce copias grandes de estrella.gif por la pantalla.
 */
(function () {
    'use strict';

    var contenedor = document.getElementById('estrellas-decorativas');
    if (!contenedor) return;

    var CANTIDAD = 10;
    var TAMANO_MIN = 90;
    var TAMANO_MAX = 250;

    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    function crearEstrella() {
        var img = document.createElement('img');
        img.src = 'img/estrella.gif';
        img.alt = '';
        img.className = 'estrella-gif';
        img.style.left = rand(1, 99) + '%';
        img.style.top = rand(1, 99) + '%';
        img.style.zIndex = 2;
        img.style.width = rand(TAMANO_MIN, TAMANO_MAX) + 'px';
        img.style.animationDelay = rand(0, 4) + 's';
        img.style.animationDuration = rand(2, 4.5) + 's';
        return img;
    }

    for (var i = 0; i < CANTIDAD; i++) {
        contenedor.appendChild(crearEstrella());
    }
})();
