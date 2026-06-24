/**
 * Sistema de partículas — fondo estelar animado
 *
 * Dibuja puntos blancos de distintos tamaños sobre un canvas a pantalla
 * completa. Una parte se concentra en una banda horizontal (como polvo
 * orbital) y cada punto parpadea y se desplaza muy lentamente.
 */
(function () {
    'use strict';

    // ── Referencias y estado ──────────────────────────────────────────────

    var canvas = document.getElementById('particulas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var particulas = [];          // lista de objetos { x, y, radio, ... }
    var animando = true;          // false cuando la pestaña está oculta
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ── Utilidades ────────────────────────────────────────────────────────

    /** Número aleatorio entre min y max (inclusive en el rango). */
    function rand(min, max) {
        return min + Math.random() * (max - min);
    }

    // ── Creación de partículas ────────────────────────────────────────────

    /**
     * Genera una partícula con posición y propiedades visuales aleatorias.
     *
     * @param {number} w - ancho del canvas en píxeles lógicos
     * @param {number} h - alto del canvas en píxeles lógicos
     */
    function crearParticula(w, h) {
        // ~35 % de las partículas se agrupan cerca del centro vertical
        // (simula el campo de polvo alrededor del plano de los anillos)
        var enBandaOrbital = Math.random() < 0.35;
        var posY;

        if (enBandaOrbital) {
            // Distribución triangular: más densa en el centro de la banda
            posY = h * 0.5 + (Math.random() + Math.random() - 1) * h * 0.12;
        } else {
            posY = Math.random() * h;
        }

        // Tres tamaños: mayoría diminuta, algunas medianas, pocas grandes
        var sorteo = Math.random();
        var radio;
        if (sorteo < 0.72) {
            radio = rand(0.4, 1.1);   // puntos casi de 1 px
        } else if (sorteo < 0.94) {
            radio = rand(1.2, 2.2);   // estrellas medianas
        } else {
            radio = rand(2.4, 3.8);   // estrellas más visibles
        }

        return {
            x: Math.random() * w,
            y: posY,
            radio: radio,
            baseOpacity: rand(0.50, 0.95),
            twinkleSpeed: rand(0.4, 1.8),       // velocidad del parpadeo
            twinklePhase: rand(0, Math.PI * 2), // desfase inicial del seno
            driftX: reduceMotion ? 0 : rand(-0.08, 0.08),
            driftY: reduceMotion ? 0 : rand(-0.04, 0.04)
        };
    }

    /** Regenera todas las partículas según el tamaño actual del canvas. */
    function initParticulas() {
        var w = canvas.width;
        var h = canvas.height;
        var area = w * h;

        // Más pantalla → más partículas, con límites para no saturar la GPU
        var cantidad = Math.min(900, Math.max(280, Math.floor(area / 4200)));

        particulas = [];
        for (var i = 0; i < cantidad; i++) {
            particulas.push(crearParticula(w, h));
        }
    }

    // ── Canvas y redimensionado ───────────────────────────────────────────

    /** Ajusta el canvas al viewport y regenera las partículas. */
    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);

        // Resolución interna (alta) vs tamaño visual en pantalla
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';

        // Escala el contexto para dibujar en coordenadas CSS (no en píxeles físicos)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        initParticulas();
    }

    // ── Dibujo y animación ────────────────────────────────────────────────

    /**
     * Dibuja un círculo con opacidad variable (efecto twinkle).
     * Tono sepia suave para que se vea sobre el fondo blanco.
     *
     * @param {object} p - partícula
     * @param {number} tiempoSeg - tiempo transcurrido en segundos
     */
    function dibujarParticula(p, tiempoSeg) {
        var opacity = p.baseOpacity;

        if (!reduceMotion) {
            // Oscila entre ~55 % y 100 % de la opacidad base
            opacity *= 0.75 + 0.45 * Math.sin(tiempoSeg * p.twinkleSpeed + p.twinklePhase);
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(110, 95, 85, ' + opacity + ')';
        ctx.fill();
    }

    /**
     * Bucle principal: limpia el canvas, mueve y dibuja cada partícula.
     *
     * @param {number} timestamp - milisegundos desde que cargó la página (rAF)
     */
    function tick(timestamp) {
        if (!animando) return;

        var ancho = window.innerWidth;
        var alto = window.innerHeight;
        var tiempoSeg = timestamp * 0.001;

        ctx.clearRect(0, 0, ancho, alto);

        for (var i = 0; i < particulas.length; i++) {
            var p = particulas[i];

            if (!reduceMotion) {
                p.x += p.driftX;
                p.y += p.driftY;

                // Al salir del borde, reaparece al otro lado (efecto infinito)
                if (p.x < -4) p.x = ancho + 4;
                if (p.x > ancho + 4) p.x = -4;
                if (p.y < -4) p.y = alto + 4;
                if (p.y > alto + 4) p.y = -4;
            }

            dibujarParticula(p, tiempoSeg);
        }

        requestAnimationFrame(tick);
    }

    // ── Inicio ────────────────────────────────────────────────────────────

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(tick);

    // Pausa la animación cuando la pestaña no está visible (ahorra batería)
    document.addEventListener('visibilitychange', function () {
        animando = !document.hidden;
        if (animando) requestAnimationFrame(tick);
    });
})();
