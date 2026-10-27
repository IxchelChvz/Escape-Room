// Datos y lógica de los 12 Trabajos de Heracles adaptados a retos técnicos DAW
const LABORS_DATA = [
    {
        id: 1,
        title: "El León de Nemea",
        subtitle: "Piel impenetrable",
        location: "Nemea",
        module: "DIW / DWEC",
        character: "H",
        position: 1,
        coordinates: { x: 38, y: 56 },
        lore: "La fiera de Nemea posee una piel que ninguna espada puede cortar. En la web sagrada, un escudo CSS malicioso (pointer-events: none y z-index negativo) impide toda interacción con el elemento divino.",
        instruction: "Inspecciona el DOM simulado. Elimina o neutraliza la propiedad CSS impenetrable para poder pulsar la reliquia sagrada.",
        challengeType: "css_inspection"
    },
    {
        id: 2,
        title: "La Hidra de Lerna",
        subtitle: "Multiplicación de cabezas",
        location: "Lerna",
        module: "DWEC",
        character: "E",
        position: 2,
        coordinates: { x: 42, y: 64 },
        lore: "Por cada cabeza que cortas, brotan dos más debido a un event listener desbocado y un bucle infinito en JavaScript que satura la memoria del navegador.",
        instruction: "Detén la propagación del evento descontrolado con e.stopPropagation() y cauteriza el ciclo infinito en el depurador.",
        challengeType: "js_event_loop"
    },
    {
        id: 3,
        title: "La Cierva de Cerinea",
        subtitle: "Velocidad divina",
        location: "Cerinea",
        module: "DWEC",
        character: "R",
        position: 3,
        coordinates: { x: 32, y: 44 },
        lore: "Consagrada a Artemisa, la cierva corre más rápido que el viento. Su botón de captura escucha mouseenter y cambia sus coordenadas instantáneamente.",
        instruction: "Usa la consola de depuración para desconectar el listener de huida o inmoviliza el script para atraparla.",
        challengeType: "dom_evasion"
    },
    {
        id: 4,
        title: "El Jabalí de Erimanto",
        subtitle: "Fuerza descontrolada",
        location: "Monte Erimanto",
        module: "DWES / DWEC",
        character: "A",
        position: 4,
        coordinates: { x: 26, y: 48 },
        lore: "La bestia derriba las murallas del templo. El formulario de paso está bloqueado por una Expresión Regular (Regex) corrupta y contradictoria que rechaza todo acceso legítimo.",
        instruction: "Corrige el patrón RegExp para validar el código de paso de Heracles en el formato: HERACLES-2026",
        challengeType: "regex_sanitization"
    },
    {
        id: 5,
        title: "Los Establos de Augías",
        subtitle: "Basura acumulada",
        location: "Élide",
        module: "DWES",
        character: "C",
        position: 5,
        coordinates: { x: 20, y: 55 },
        lore: "30 años de estiércol y registros corruptos desbordan la base de datos divina. Los índices están degradados y las tablas bloqueadas por datos basura.",
        instruction: "Ejecuta una sentencia SQL (DELETE) para purgar todos los registros marcados como 'corrupto' o 'estiércol' sin dañar a las vacas sagradas.",
        challengeType: "sql_cleanup"
    },
    {
        id: 6,
        title: "Las Aves del Estínfalo",
        subtitle: "Lluvia de ataques",
        location: "Lago Estínfalo",
        module: "DWES / DWEC",
        character: "L",
        position: 6,
        coordinates: { x: 34, y: 48 },
        lore: "Una bandada de aves con plumas de bronce bombardea la red con una tormenta DDoS de peticiones HTTP 404 (Not Found) y 500 (Internal Server Error).",
        instruction: "Reconfigura el archivo de rutas del servidor asignando los controladores y códigos de estado 200 OK correctos a los endpoints atacados.",
        challengeType: "http_router"
    },
    {
        id: 7,
        title: "El Toro de Creta",
        subtitle: "Furia marina",
        location: "Creta",
        module: "DWEC / DAW",
        character: "E",
        position: 7,
        coordinates: { x: 55, y: 88 },
        lore: "Enloquecido por Poseidón, el Toro lanza peticiones asíncronas fetch() que son fulminadas por la política de seguridad CORS y cabeceras ausentes.",
        instruction: "Configura la cabecera Access-Control-Allow-Origin y el header Authorization con el token sagrado en la promesa fetch().",
        challengeType: "cors_fetch"
    },
    {
        id: 8,
        title: "Las Yeguas de Diomedes",
        subtitle: "Devoradoras de hombres",
        location: "Tracia",
        module: "DWES / DAW",
        character: "S",
        position: 8,
        coordinates: { x: 68, y: 18 },
        lore: "Las bestias carnívoras se alimentan de datos sin sanitizar. Una inyección SQL maligna (' OR '1'='1) y scripts XSS devoran la memoria de la fortaleza.",
        instruction: "Reemplaza la concatenación insegura por Sentencias Preparadas (Prepared Statements con PDO) para neutralizar la inyección.",
        challengeType: "sqli_defense"
    },
    {
        id: 9,
        title: "El Cinto de Hipólita",
        subtitle: "Tesoro de las Amazonas",
        location: "Temiscira",
        module: "DWEC / DIW",
        character: "D",
        position: 9,
        coordinates: { x: 82, y: 28 },
        lore: "La reina de las Amazonas guarda el cinturón divino de Ares. El secreto no está a simple vista: ha sido camuflado en el código fuente y las cabeceras HTTP.",
        instruction: "Abre las DevTools simuladas, inspecciona los comentarios del DOM y las cabeceras de red para descifrar el token secreto de Hipólita.",
        challengeType: "devtools_inspection"
    },
    {
        id: 10,
        title: "El Ganado de Gerión",
        subtitle: "Gigante de 3 cuerpos",
        location: "Eritia (Occidente)",
        module: "DWES",
        character: "A",
        position: 10,
        coordinates: { x: 10, y: 72 },
        lore: "Gerión posee tres torsos y tres cabezas que actúan sin coordinación. Su arquitectura de plantillas Jinja2 / Blade está rota en 3 archivos aislados.",
        instruction: "Configura la herencia de plantillas usando {% extends 'base.html' %} y los tags {% block contenido %} para unificar los 3 cuerpos en un solo layout.",
        challengeType: "template_inheritance"
    },
    {
        id: 11,
        title: "Las Manzanas de las Hespérides",
        subtitle: "Jardín protegido",
        location: "Monte Atlas",
        module: "DIW",
        character: "W",
        position: 11,
        coordinates: { x: 12, y: 88 },
        lore: "Las ninfas del atardecer velan el árbol dorado con una barrera visual impenetrable. Solo quienes dominan la Accesibilidad Web (ARIA, foco de teclado y WCAG) podrán recoger el fruto.",
        instruction: "Usa exclusivamente las teclas de dirección o TAB + ENTER (o la barra de accesibilidad) para navegar por los atributos ARIA y cosechar la manzana dorada.",
        challengeType: "accessibility_aria"
    },
    {
        id: 12,
        title: "Cerbero",
        subtitle: "Guardián del Inframundo",
        location: "Ténaro (Hades)",
        module: "DWES / DAW",
        character: "!",
        position: 12,
        coordinates: { x: 44, y: 76 },
        lore: "El can de tres cabezas guarda las puertas del Tártaro. Solo la combinación armónica de los 12 caracteres obtenidos en las pruebas purgará la maldición de Hera.",
        instruction: "Introduce la contraseña divina de 12 caracteres en la consola del inframundo para someter a Cerbero y desatar la Restauración del Olimpo.",
        challengeType: "cerberus_terminal"
    }
];

class LaborsManager {
    constructor() {
        this.solvedLabors = this.loadSolvedLabors();
    }

    loadSolvedLabors() {
        try {
            const data = localStorage.getItem("heracles_solved_labors");
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    saveSolvedLabors() {
        try {
            localStorage.setItem("heracles_solved_labors", JSON.stringify(this.solvedLabors));
        } catch (e) {
            console.warn("Storage not available");
        }
    }

    isSolved(laborId) {
        return this.solvedLabors.includes(laborId);
    }

    solveLabor(laborId) {
        if (!this.solvedLabors.includes(laborId)) {
            this.solvedLabors.push(laborId);
            this.saveSolvedLabors();
            window.olympusAudio?.playSuccess();
        }
    }

    resetProgress() {
        this.solvedLabors = [];
        this.saveSolvedLabors();
    }

    getObtainedPassword() {
        const chars = new Array(12).fill("_");
        LABORS_DATA.forEach(labor => {
            if (this.isSolved(labor.id)) {
                chars[labor.position - 1] = labor.character;
            }
        });
        return chars.join("");
    }

    // Renderiza el HTML del reto específico en el modal
    renderChallengeContent(labor, container) {
        container.innerHTML = "";

        switch(labor.challengeType) {
            case "css_inspection":
                this.setupLabor1(labor, container);
                break;
            case "js_event_loop":
                this.setupLabor2(labor, container);
                break;
            case "dom_evasion":
                this.setupLabor3(labor, container);
                break;
            case "regex_sanitization":
                this.setupLabor4(labor, container);
                break;
            case "sql_cleanup":
                this.setupLabor5(labor, container);
                break;
            case "http_router":
                this.setupLabor6(labor, container);
                break;
            case "cors_fetch":
                this.setupLabor7(labor, container);
                break;
            case "sqli_defense":
                this.setupLabor8(labor, container);
                break;
            case "devtools_inspection":
                this.setupLabor9(labor, container);
                break;
            case "template_inheritance":
                this.setupLabor10(labor, container);
                break;
            case "accessibility_aria":
                this.setupLabor11(labor, container);
                break;
            case "cerberus_terminal":
                this.setupLabor12(labor, container);
                break;
            default:
                container.innerHTML = `<p>Reto en preparación...</p>`;
        }
    }

    // RETO 1: León de Nemea (CSS impenetrable)
    setupLabor1(labor, container) {
        const isAlreadySolved = this.isSolved(labor.id);
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Inspector de Estilos CSS (DIW)</div>
                    <div class="editor-pane">
                        <div class="css-rule">
                            <span class="css-selector">.reliquia-nemea {</span>
                            <div class="css-prop-row">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="css-pointer-events" checked>
                                    <code>pointer-events: none;</code>
                                </label>
                                <span class="badge-curse">MALICIOSO</span>
                            </div>
                            <div class="css-prop-row">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="css-z-index" checked>
                                    <code>z-index: -999;</code>
                                </label>
                                <span class="badge-curse">BLOQUEANTE</span>
                            </div>
                            <div class="css-prop-row">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="css-opacity" checked>
                                    <code>filter: blur(4px) grayscale(80%);</code>
                                </label>
                            </div>
                            <span class="css-selector">}</span>
                        </div>
                    </div>
                    <p class="hint-text">💡 <em>Módulo DIW:</em> Desactiva las propiedades que impiden la interacción del usuario en el árbol renderizado.</p>
                </div>
                <div class="challenge-arena arena-nemea">
                    <div class="arena-title">Altar de Nemea</div>
                    <div class="reliquia-wrapper">
                        <div id="target-reliquia" class="reliquia-box blocked-by-css">
                            <div class="lion-icon">🦁</div>
                            <div class="lion-label">Manto del León de Nemea</div>
                            <button id="btn-claim-nemea" class="btn-claim">ARRANCAR PIEL IMPENETRABLE</button>
                        </div>
                    </div>
                    <div id="nemea-feedback" class="feedback-msg"></div>
                </div>
            </div>
        `;

        const chkPointer = container.querySelector("#css-pointer-events");
        const chkZIndex = container.querySelector("#css-z-index");
        const chkOpacity = container.querySelector("#css-opacity");
        const reliquia = container.querySelector("#target-reliquia");
        const btnClaim = container.querySelector("#btn-claim-nemea");
        const feedback = container.querySelector("#nemea-feedback");

        const updateStyles = () => {
            let pointerVal = chkPointer.checked ? "none" : "auto";
            let zIndexVal = chkZIndex.checked ? "-10" : "10";
            let filterVal = chkOpacity.checked ? "blur(4px) grayscale(80%)" : "none";

            reliquia.style.pointerEvents = pointerVal;
            reliquia.style.zIndex = zIndexVal;
            reliquia.style.filter = filterVal;

            if (!chkPointer.checked && !chkZIndex.checked) {
                reliquia.classList.remove("blocked-by-css");
                reliquia.classList.add("unlocked-by-css");
                feedback.innerHTML = `<span class="txt-success">⚡ Escudo CSS disuelto. ¡Pulsa el botón ahora!</span>`;
            } else {
                reliquia.classList.add("blocked-by-css");
                reliquia.classList.remove("unlocked-by-css");
                feedback.innerHTML = `<span class="txt-warning">⚠️ La piel aún es impenetrable por las reglas CSS activas.</span>`;
            }
        };

        chkPointer.addEventListener("change", updateStyles);
        chkZIndex.addEventListener("change", updateStyles);
        chkOpacity.addEventListener("change", updateStyles);

        btnClaim.addEventListener("click", () => {
            this.handleSuccess(labor, "¡Has penetrado la piel con tu dominio del DOM y CSS!");
        });

        updateStyles();
    }

    // RETO 2: La Hidra de Lerna (Bucle infinito y propagación de eventos)
    setupLabor2(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Depurador JavaScript (DWEC) - Event Loop</div>
                    <div class="editor-pane">
                        <pre><code>// hydra_spawner.js (VULNERABLE)
const hydra = document.getElementById("hydra-core");

hydra.addEventListener("click", function(event) {
    // ⚠️ Bucle que satura el DOM
    for (let i = 0; i < 2; i++) {
        spawnNewHead();
    }
});</code></pre>
                    </div>
                    <div class="action-buttons-group">
                        <button id="btn-fire-cauterize" class="btn-action">🔥 Aplicar Fuego Sagrado (e.stopPropagation() y clearInterval)</button>
                        <button id="btn-reset-hydra" class="btn-secondary">Reiniciar Hidra</button>
                    </div>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Pantano de Lerna - Cabezas Vivas: <span id="hydra-count">1</span> / Límite: 10</div>
                    <div id="hydra-swamp" class="hydra-swamp">
                        <div class="hydra-head core-head" data-head="core">🐉 Cabeza Principal</div>
                    </div>
                    <div id="hydra-feedback" class="feedback-msg">Haz clic en la cabeza principal para comprobar el descontrol del bucle.</div>
                </div>
            </div>
        `;

        const swamp = container.querySelector("#hydra-swamp");
        const countSpan = container.querySelector("#hydra-count");
        const feedback = container.querySelector("#hydra-feedback");
        const btnFire = container.querySelector("#btn-fire-cauterize");
        const btnReset = container.querySelector("#btn-reset-hydra");

        let cauterized = false;
        let headCount = 1;

        const spawnHead = () => {
            if (cauterized || headCount >= 12) return;
            headCount++;
            countSpan.textContent = headCount;
            const head = document.createElement("div");
            head.className = "hydra-head clone-head";
            head.innerHTML = `🐍 Cabeza #${headCount}`;
            head.addEventListener("click", (e) => {
                if (!cauterized) {
                    window.olympusAudio?.playGlitch();
                    spawnHead();
                    spawnHead();
                }
            });
            swamp.appendChild(head);
            if (headCount >= 10 && !cauterized) {
                feedback.innerHTML = `<span class="txt-danger">💥 ¡ALERTA DE DESBORDAMIENTO DE MEMORIA! ¡Aplica fuego con e.stopPropagation()!</span>`;
            }
        };

        const coreHead = container.querySelector(".core-head");
        coreHead.addEventListener("click", (e) => {
            if (!cauterized) {
                window.olympusAudio?.playGlitch();
                spawnHead();
                spawnHead();
            } else {
                this.handleSuccess(labor, "¡La Hidra ha sido cauterizada y el bucle infinito exterminado!");
            }
        });

        btnFire.addEventListener("click", () => {
            cauterized = true;
            window.olympusAudio?.playClick();
            feedback.innerHTML = `<span class="txt-success">🔥 ¡e.stopPropagation() activado! Ahora haz clic en la Cabeza Principal para asestar el golpe final.</span>`;
            btnFire.disabled = true;
            btnFire.style.opacity = "0.5";
            coreHead.classList.add("hydra-vulnerable");
        });

        btnReset.addEventListener("click", () => {
            cauterized = false;
            headCount = 1;
            countSpan.textContent = 1;
            swamp.innerHTML = `<div class="hydra-head core-head" data-head="core">🐉 Cabeza Principal</div>`;
            feedback.innerHTML = `La hidra se ha regenerado. Intenta cauterizarla adecuadamente.`;
            btnFire.disabled = false;
            btnFire.style.opacity = "1";
            this.setupLabor2(labor, container);
        });
    }

    // RETO 3: La Cierva de Cerinea (Evasión del puntero en el DOM)
    setupLabor3(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Consola de Scripts (DWEC)</div>
                    <div class="editor-pane">
                        <pre><code>// cerinea_runner.js
ciervaBtn.addEventListener("mouseenter", (e) => {
    moverCoordenadasAleatorias();
});</code></pre>
                    </div>
                    <div class="terminal-mini">
                        <label for="cerinea-cmd">> Ejecutar comando en consola:</label>
                        <div class="input-with-btn">
                            <input type="text" id="cerinea-cmd" placeholder="removeEventListener / freeze / stop" value="">
                            <button id="btn-exec-cmd" class="btn-action">Ejecutar</button>
                        </div>
                    </div>
                    <p class="hint-text">💡 Pista: Escribe <code>cierva.removeEventListener()</code> o <code>freeze</code> para neutralizar su velocidad.</p>
                </div>
                <div class="challenge-arena arena-cerinea" id="cerinea-boundary">
                    <div class="arena-title">Bosque de Cerinea</div>
                    <button id="cierva-target" class="btn-cierva">🦌 CIERVA DE PEZUÑAS DE BRONCE</button>
                    <div id="cerinea-feedback" class="feedback-msg">Intenta tocar a la cierva con el cursor.</div>
                </div>
            </div>
        `;

        const boundary = container.querySelector("#cerinea-boundary");
        const cierva = container.querySelector("#cierva-target");
        const cmdInput = container.querySelector("#cerinea-cmd");
        const btnExec = container.querySelector("#btn-exec-cmd");
        const feedback = container.querySelector("#cerinea-feedback");

        let isFrozen = false;

        const moveCierva = () => {
            if (isFrozen) return;
            window.olympusAudio?.playGlitch();
            const rect = boundary.getBoundingClientRect();
            const maxX = rect.width - 140;
            const maxY = rect.height - 60;
            const randX = Math.max(10, Math.floor(Math.random() * maxX));
            const randY = Math.max(40, Math.floor(Math.random() * maxY));

            cierva.style.transform = `translate(${randX}px, ${randY}px)`;
            feedback.innerHTML = `<span class="txt-warning">💨 ¡La cierva huyó esquivando el puntero!</span>`;
        };

        cierva.addEventListener("mouseenter", moveCierva);

        const freezeCierva = () => {
            isFrozen = true;
            cierva.removeEventListener("mouseenter", moveCierva);
            cierva.classList.add("cierva-captured");
            cierva.style.transform = "translate(50px, 60px)";
            feedback.innerHTML = `<span class="txt-success">❄️ ¡Script de huida revocado! Haz clic sobre la cierva para consagrarla.</span>`;
            window.olympusAudio?.playSuccess();
        };

        btnExec.addEventListener("click", () => {
            const val = cmdInput.value.trim().toLowerCase();
            if (val.includes("remove") || val.includes("freeze") || val.includes("stop") || val.includes("off")) {
                freezeCierva();
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">❌ Comando no reconocido. Prueba: cierva.removeEventListener('mouseenter') o freeze</span>`;
            }
        });

        cierva.addEventListener("click", () => {
            if (isFrozen) {
                this.handleSuccess(labor, "¡Cierva de Cerinea capturada sin herirla gracias a tu depuración de eventos!");
            } else {
                moveCierva();
            }
        });
    }

    // RETO 4: Jabalí de Erimanto (Validación Regex)
    setupLabor4(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Expresión Regular Corrupta (DWES/DWEC)</div>
                    <div class="editor-pane">
                        <label for="regex-pattern">Patrón RegExp:</label>
                        <div class="regex-editor-row">
                            <span class="regex-delim">/</span>
                            <input type="text" id="regex-pattern" class="input-code" value="^[^A-Za-z0-9]{99}$">
                            <span class="regex-delim">/</span>
                        </div>
                        <p class="field-desc">El sello sagrado debe cumplir exactamente el formato: <code>HERACLES-\\d{4}</code> (Ej: HERACLES-2026)</p>
                    </div>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Puerta Nevada de Erimanto</div>
                    <div class="form-group">
                        <label for="seal-input">Sello de Euristeo:</label>
                        <input type="text" id="seal-input" class="input-text" value="HERACLES-2026" placeholder="Introduce el sello">
                    </div>
                    <button id="btn-test-regex" class="btn-action">Probar Validación Regex</button>
                    <div id="regex-feedback" class="feedback-msg">Verifica si el patrón acepta el código del héroe.</div>
                </div>
            </div>
        `;

        const regexInput = container.querySelector("#regex-pattern");
        const sealInput = container.querySelector("#seal-input");
        const btnTest = container.querySelector("#btn-test-regex");
        const feedback = container.querySelector("#regex-feedback");

        btnTest.addEventListener("click", () => {
            const rawRegex = regexInput.value.trim();
            const text = sealInput.value.trim();

            try {
                const regex = new RegExp(rawRegex);
                const matches = regex.test(text);

                if (matches && (text === "HERACLES-2026" || /HERACLES-\d{4}/.test(text))) {
                    this.handleSuccess(labor, "¡Expresión Regular corregida! El jabalí ha sido acorralado en las nieves.");
                } else if (!matches) {
                    window.olympusAudio?.playError();
                    feedback.innerHTML = `<span class="txt-danger">❌ Fallo de validación: El texto "${text}" NO coincide con el patrón /${rawRegex}/</span>`;
                } else {
                    feedback.innerHTML = `<span class="txt-warning">⚠️ El patrón es demasiado laxo o no cumple el requisito HERACLES-\\d{4}</span>`;
                }
            } catch (err) {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">💥 Sintaxis de RegExp inválida: ${err.message}</span>`;
            }
        });
    }

    // RETO 5: Establos de Augías (SQL Cleanup)
    setupLabor5(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Consola SQL (DWES / MariaDB)</div>
                    <div class="editor-pane">
                        <textarea id="sql-query" class="sql-area" rows="4">DELETE FROM establos WHERE estado = 'corrupto' OR tipo_residuo = 'estiercol';</textarea>
                    </div>
                    <button id="btn-run-sql" class="btn-action">🌊 Desviar Ríos Alfeo y Peneo (Ejecutar SQL)</button>
                    <p class="hint-text">💡 <em>Módulo DWES:</em> Elimina la basura sin borrar los registros con <code>estado = 'sagrado'</code>.</p>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Tabla: <code>establos_augias</code></div>
                    <div class="table-responsive">
                        <table class="db-table" id="augias-table">
                            <thead>
                                <tr><th>ID</th><th>Animal</th><th>Tipo</th><th>Estado</th></tr>
                            </thead>
                            <tbody>
                                <tr class="row-corrupt" data-status="corrupto"><td>1</td><td>Toro Bravo</td><td>estiercol</td><td class="badge-corrupt">corrupto</td></tr>
                                <tr class="row-clean" data-status="sagrado"><td>2</td><td>Vaca de Augías</td><td>ganado</td><td class="badge-clean">sagrado</td></tr>
                                <tr class="row-corrupt" data-status="corrupto"><td>3</td><td>Buey</td><td>estiercol</td><td class="badge-corrupt">corrupto</td></tr>
                                <tr class="row-corrupt" data-status="corrupto"><td>4</td><td>Mula</td><td>basura_30_anos</td><td class="badge-corrupt">corrupto</td></tr>
                                <tr class="row-clean" data-status="sagrado"><td>5</td><td>Toro Blanco</td><td>ganado</td><td class="badge-clean">sagrado</td></tr>
                            </tbody>
                        </table>
                    </div>
                    <div id="sql-feedback" class="feedback-msg">Escribe tu sentencia SQL de limpieza.</div>
                </div>
            </div>
        `;

        const sqlArea = container.querySelector("#sql-query");
        const btnRun = container.querySelector("#btn-run-sql");
        const tableBody = container.querySelector("#augias-table tbody");
        const feedback = container.querySelector("#sql-feedback");

        btnRun.addEventListener("click", () => {
            const query = sqlArea.value.trim().toUpperCase();

            if (query.includes("DROP TABLE") || query.includes("DELETE FROM ESTABLOS;") || (query.startsWith("DELETE FROM ESTABLOS") && !query.includes("WHERE"))) {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">❌ ¡Cuidado! ¡Ibas a borrar a las vacas sagradas sin una cláusula WHERE!</span>`;
                return;
            }

            if (query.includes("DELETE") && (query.includes("CORRUPTO") || query.includes("ESTIERCOL") || query.includes("BASURA"))) {
                const rows = tableBody.querySelectorAll("tr");
                rows.forEach(r => {
                    if (r.getAttribute("data-status") === "corrupto") {
                        r.style.transition = "all 0.5s";
                        r.style.opacity = "0";
                        r.style.transform = "translateX(50px)";
                        setTimeout(() => r.remove(), 500);
                    }
                });

                setTimeout(() => {
                    this.handleSuccess(labor, "¡Las aguas limpiaron los establos de Augías y las tablas han quedado relucientes!");
                }, 700);
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-warning">⚠️ Sentencia no válida. Usa DELETE FROM establos WHERE estado = 'corrupto'</span>`;
            }
        });
    }

    // RETO 6: Aves del Estínfalo (Router HTTP)
    setupLabor6(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Configuración del Enrutador (DWES / Express / Laravel)</div>
                    <div class="editor-pane">
                        <div class="router-row">
                            <code>GET /api/oraculo</code> ➔ 
                            <select id="route-oraculo" class="route-select">
                                <option value="404">Controlador Inexistente (404)</option>
                                <option value="200">OraculoController@consultar (200 OK)</option>
                            </select>
                        </div>
                        <div class="router-row">
                            <code>POST /api/crotalos</code> ➔ 
                            <select id="route-crotalos" class="route-select">
                                <option value="500">NullPointerCrash (500 Error)</option>
                                <option value="200">CrotalosAtenea@ahuyentar (200 OK)</option>
                            </select>
                        </div>
                    </div>
                    <button id="btn-deploy-routes" class="btn-action">Desplegar Rutas Corregidas</button>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Monitor de Tráfico de Red</div>
                    <div id="traffic-monitor" class="traffic-monitor">
                        <div class="req-log req-err">GET /api/oraculo ➔ 404 Not Found 💥</div>
                        <div class="req-log req-err">POST /api/crotalos ➔ 500 Internal Error 💥</div>
                        <div class="req-log req-err">GET /api/oraculo ➔ 404 Not Found 💥</div>
                    </div>
                    <div id="router-feedback" class="feedback-msg">Alinea los endpoints con sus controladores válidos.</div>
                </div>
            </div>
        `;

        const selOraculo = container.querySelector("#route-oraculo");
        const selCrotalos = container.querySelector("#route-crotalos");
        const btnDeploy = container.querySelector("#btn-deploy-routes");
        const monitor = container.querySelector("#traffic-monitor");
        const feedback = container.querySelector("#router-feedback");

        btnDeploy.addEventListener("click", () => {
            if (selOraculo.value === "200" && selCrotalos.value === "200") {
                monitor.innerHTML = `
                    <div class="req-log req-ok">GET /api/oraculo ➔ 200 OK (0.12ms) ✅</div>
                    <div class="req-log req-ok">POST /api/crotalos ➔ 200 OK (Crotalos de bronce resonando) ✅</div>
                    <div class="req-log req-ok">STATUS: TODAS LAS AVES EN RETIRADA ✅</div>
                `;
                this.handleSuccess(labor, "¡Las aves del Estínfalo han huido ante el enrutamiento perfecto!");
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">❌ La tormenta de 404s y 500s continúa. Corrige todos los selectores.</span>`;
            }
        });
    }

    // RETO 7: El Toro de Creta (CORS y Fetch)
    setupLabor7(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Promesa Asíncrona Fetch (DWEC / DAW)</div>
                    <div class="editor-pane">
                        <div class="fetch-config">
                            <label><input type="checkbox" id="chk-cors-header"> <code>'Access-Control-Allow-Origin': '*'</code></label>
                            <label><input type="checkbox" id="chk-auth-header"> <code>'Authorization': 'Bearer MINOS_CRETA_TOKEN'</code></label>
                            <label><input type="checkbox" id="chk-mode-cors" checked> <code>mode: 'cors'</code></label>
                        </div>
                    </div>
                    <button id="btn-fire-fetch" class="btn-action">Ejecutar fetch('https://api.creta/toro')</button>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Consola del Navegador</div>
                    <div id="fetch-console" class="browser-console">
                        <span class="txt-danger">Access to fetch at 'https://api.creta/toro' from origin 'http://olimpiada.daw' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.</span>
                    </div>
                    <div id="fetch-feedback" class="feedback-msg">Agrega las cabeceras requeridas por la política de seguridad.</div>
                </div>
            </div>
        `;

        const chkCors = container.querySelector("#chk-cors-header");
        const chkAuth = container.querySelector("#chk-auth-header");
        const btnFetch = container.querySelector("#btn-fire-fetch");
        const consoleBox = container.querySelector("#fetch-console");
        const feedback = container.querySelector("#fetch-feedback");

        btnFetch.addEventListener("click", () => {
            if (chkCors.checked && chkAuth.checked) {
                consoleBox.innerHTML = `
                    <span class="txt-success">➔ Fetch resolved with status: 200 OK</span><br>
                    <span class="txt-success">Response body: { "status": "DOMINADO", "toro": "Llevado a Micenas ante Euristeo" }</span>
                `;
                this.handleSuccess(labor, "¡El Toro de Creta ha sido amansado al satisfacer la política CORS!");
            } else {
                window.olympusAudio?.playGlitch();
                consoleBox.innerHTML = `
                    <span class="txt-danger">💥 Uncaught (in promise) TypeError: Failed to fetch: Headers insuficientes para cruzar el mar Egeo.</span>
                `;
                feedback.innerHTML = `<span class="txt-warning">⚠️ Faltan cabeceras CORS o el Token de Autorización.</span>`;
            }
        });
    }

    // RETO 8: Las Yeguas de Diomedes (Inyección SQL y Sanitización)
    setupLabor8(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Mecanismo de Consulta (DWES / DAW)</div>
                    <div class="editor-pane">
                        <label><input type="radio" name="sqli-mode" value="vuln" checked> <strong>Inseguro:</strong> Concatenación directa (<code>SELECT * FROM establo WHERE id = '$id'</code>)</label><br><br>
                        <label><input type="radio" name="sqli-mode" value="pdo"> <strong>Seguro:</strong> Sentencia Preparada (<code>$stmt = $pdo->prepare('SELECT * FROM establo WHERE id = :id'); $stmt->execute(['id' => $id]);</code>)</label>
                    </div>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Pesebre de Bronce de Diomedes</div>
                    <div class="form-group">
                        <label for="sqli-payload">Carga de Entrada (Payload Malicioso):</label>
                        <input type="text" id="sqli-payload" class="input-text" value="' OR '1'='1 --">
                    </div>
                    <button id="btn-feed-horses" class="btn-action">Alimentar Sistema</button>
                    <div id="sqli-feedback" class="feedback-msg">Prueba la entrada con el mecanismo actual.</div>
                </div>
            </div>
        `;

        const btnFeed = container.querySelector("#btn-feed-horses");
        const feedback = container.querySelector("#sqli-feedback");

        btnFeed.addEventListener("click", () => {
            const isPDO = container.querySelector('input[name="sqli-mode"]:checked').value === "pdo";

            if (isPDO) {
                feedback.innerHTML = `<span class="txt-success">🛡️ Prepared Statement neutralizó la inyección. El input fue tratado como string literal.</span>`;
                this.handleSuccess(labor, "¡Las Yeguas de Diomedes han sido domadas con parámetros seguros!");
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">💥 ¡VULNERABILIDAD EXPLOTADA! Las yeguas devoraron toda la tabla de usuarios: <code>SELECT * FROM establo WHERE id = '' OR '1'='1'</code></span>`;
            }
        });
    }

    // RETO 9: El Cinto de Hipólita (Inspección DevTools y Comentarios)
    setupLabor9(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="devtools-mock">
                        <div class="devtools-tabs">
                            <button class="dtab active" id="dtab-elements">Elements (DOM)</button>
                            <button class="dtab" id="dtab-network">Network Headers</button>
                        </div>
                        <div id="dtab-content-elements" class="dtab-content active">
                            <pre><code>&lt;div class="palacio-amazonas"&gt;
  &lt;h1&gt;Reino de Temiscira&lt;/h1&gt;
  &lt;!-- CONFIDENCIAL_AMAZONAS: --&gt;
  <span class="txt-gold">&lt;!-- TOKEN_CINTO_HIPOLITA = "D" --&gt;</span>
  &lt;p&gt;Custodiado por Ares&lt;/p&gt;
&lt;/div&gt;</code></pre>
                        </div>
                        <div id="dtab-content-network" class="dtab-content">
                            <pre><code>HTTP/2 200 OK
content-type: text/html
x-cinto-amazon-token: <span class="txt-gold">"D"</span>
server: AmazonasGuard/3.1</code></pre>
                        </div>
                    </div>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Ofrenda a Hipólita</div>
                    <div class="form-group">
                        <label for="belt-token">Introduce el Carácter Oculto Descubierto:</label>
                        <input type="text" id="belt-token" maxlength="1" class="input-char" placeholder="?">
                    </div>
                    <button id="btn-claim-belt" class="btn-action">Entregar Token a Hipólita</button>
                    <div id="belt-feedback" class="feedback-msg">Inspecciona el código oculto en las pestañas DevTools.</div>
                </div>
            </div>
        `;

        const tabElem = container.querySelector("#dtab-elements");
        const tabNet = container.querySelector("#dtab-network");
        const contElem = container.querySelector("#dtab-content-elements");
        const contNet = container.querySelector("#dtab-content-network");
        const tokenInput = container.querySelector("#belt-token");
        const btnClaim = container.querySelector("#btn-claim-belt");
        const feedback = container.querySelector("#belt-feedback");

        tabElem.addEventListener("click", () => {
            tabElem.classList.add("active");
            tabNet.classList.remove("active");
            contElem.classList.add("active");
            contNet.classList.remove("active");
        });

        tabNet.addEventListener("click", () => {
            tabNet.classList.add("active");
            tabElem.classList.remove("active");
            contNet.classList.add("active");
            contElem.classList.remove("active");
        });

        btnClaim.addEventListener("click", () => {
            if (tokenInput.value.trim().toUpperCase() === "D") {
                this.handleSuccess(labor, "¡Hipólita te entrega el Cinto Sagrado con solemnidad!");
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">❌ Token erróneo. Lee el comentario HTML en Elements o en Network Headers.</span>`;
            }
        });
    }

    // RETO 10: El Ganado de Gerión (Herencia de Plantillas Jinja2 / Blade)
    setupLabor10(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="code-box-header">Plantilla <code>gerion_view.html</code> (DWES)</div>
                    <div class="editor-pane">
                        <div class="form-group">
                            <label>1. Directiva de extensión:</label>
                            <select id="tpl-extends" class="route-select">
                                <option value="none">-- Sin herencia --</option>
                                <option value="extends">{% extends "base.html" %}</option>
                                <option value="include">{% include "base.html" %}</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>2. Bloque principal:</label>
                            <select id="tpl-block" class="route-select">
                                <option value="none">-- Sin bloque --</option>
                                <option value="block">{% block contenido %} ... {% endblock %}</option>
                                <option value="div">&lt;div class="content"&gt; ... &lt;/div&gt;</option>
                            </select>
                        </div>
                    </div>
                    <button id="btn-compile-template" class="btn-action">Renderizar y Ensamblar Gigante</button>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Estado de los 3 Cuerpos de Gerión</div>
                    <div id="gerion-status-box" class="gerion-status broken">
                        <p>⚠️ Fragmento 1: Cabeza aislada</p>
                        <p>⚠️ Fragmento 2: Torso sin layout</p>
                        <p>⚠️ Fragmento 3: Piernas desvinculadas</p>
                    </div>
                    <div id="tpl-feedback" class="feedback-msg">Configura la herencia con extends y block.</div>
                </div>
            </div>
        `;

        const selExt = container.querySelector("#tpl-extends");
        const selBlk = container.querySelector("#tpl-block");
        const btnComp = container.querySelector("#btn-compile-template");
        const statusBox = container.querySelector("#gerion-status-box");
        const feedback = container.querySelector("#tpl-feedback");

        btnComp.addEventListener("click", () => {
            if (selExt.value === "extends" && selBlk.value === "block") {
                statusBox.className = "gerion-status assembled";
                statusBox.innerHTML = `
                    <p>✅ <code>base.html</code> adoptado con éxito</p>
                    <p>✅ <code>{% block contenido %}</code> inyectado en el layout maestro</p>
                    <p>✨ Ganado de Gerión unificado y pacificado</p>
                `;
                this.handleSuccess(labor, "¡La herencia de plantillas unificó a los tres cuerpos de Gerión!");
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">❌ La vista sigue rota. Una vista hija debe extender con {% extends %} y encapsularse en {% block %}.</span>`;
            }
        });
    }

    // RETO 11: Las Manzanas de las Hespérides (Accesibilidad ARIA y Teclado)
    setupLabor11(labor, container) {
        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="accessibility-controls">
                        <div class="badge-aria">WCAG 2.1 AAA - DIW</div>
                        <p class="hint-text">⌨️ <strong>Mecanismo accesible:</strong> Usa la tecla <code>TAB</code> de tu teclado físico para enfocar los elementos del árbol, y pulsa <code>ENTER</code> o <code>ESPACIO</code> en la Manzana Dorada. (O usa los botones de navegación asistida debajo).</p>
                    </div>
                    <div class="assistive-nav">
                        <button id="btn-tab-sim" class="btn-secondary">Simular Pulsar TAB</button>
                        <button id="btn-screen-reader" class="btn-secondary">🔊 Lector de Pantalla (ARIA)</button>
                    </div>
                    <div id="aria-announcer" class="aria-announcer" aria-live="polite">Lector: En espera...</div>
                </div>
                <div class="challenge-arena arena-hesperides">
                    <div class="arena-title">Árbol de Oro de las Hespérides</div>
                    <div class="tree-container">
                        <button tabindex="1" class="tree-node leaf" aria-label="Hojas de sauce del jardín">🌿 Hoja</button>
                        <button tabindex="2" class="tree-node branch" aria-label="Rama custodiada por el dragón Ladón">🐉 Rama</button>
                        <button tabindex="3" id="golden-apple-btn" class="tree-node golden-apple" aria-label="Manzana dorada de la inmortalidad. Pulsa Enter para cosechar." role="button">🍎 MANZANA DORADA</button>
                        <button tabindex="4" class="tree-node leaf" aria-label="Flor nocturna">🌸 Flor</button>
                    </div>
                    <div id="hesperides-feedback" class="feedback-msg">Enfoca la manzana dorada y actívala mediante teclado.</div>
                </div>
            </div>
        `;

        const apple = container.querySelector("#golden-apple-btn");
        const announcer = container.querySelector("#aria-announcer");
        const btnTab = container.querySelector("#btn-tab-sim");
        const btnSR = container.querySelector("#btn-screen-reader");
        const allNodes = Array.from(container.querySelectorAll(".tree-node"));
        let currentIndex = 0;

        const announce = (text) => {
            announcer.textContent = `🔊 Lector de Pantalla: ${text}`;
            window.olympusAudio?.playClick();
        };

        allNodes.forEach((node) => {
            node.addEventListener("focus", () => {
                announce(node.getAttribute("aria-label"));
            });
        });

        btnTab.addEventListener("click", () => {
            allNodes[currentIndex].focus();
            currentIndex = (currentIndex + 1) % allNodes.length;
        });

        btnSR.addEventListener("click", () => {
            announce(document.activeElement?.getAttribute("aria-label") || "Ningún elemento enfocado. Usa TAB.");
        });

        const harvestApple = () => {
            this.handleSuccess(labor, "¡Has superado la prueba de accesibilidad universal y obtenido la Manzana Dorada!");
        };

        apple.addEventListener("click", harvestApple);
        apple.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                harvestApple();
            }
        });
    }

    // RETO 12: Cerbero (Consola de la contraseña final)
    setupLabor12(labor, container) {
        const solvedCount = this.solvedLabors.filter(id => id !== 12).length;
        const currentPass = this.getObtainedPassword();

        container.innerHTML = `
            <div class="challenge-layout">
                <div class="challenge-desc">
                    <p class="challenge-story">${labor.lore}</p>
                    <div class="cerberus-status">
                        <div class="cerberus-head">🐺 Cabeza 1: DWEC</div>
                        <div class="cerberus-head">🐺 Cabeza 2: DWES</div>
                        <div class="cerberus-head">🐺 Cabeza 3: DIW / DAW</div>
                    </div>
                    <p class="hint-text">Has completado <strong>${solvedCount} de 11</strong> trabajos previos. Tu contraseña reconstruida hasta ahora es:</p>
                    <div class="discovered-password-display">${currentPass}</div>
                </div>
                <div class="challenge-arena">
                    <div class="arena-title">Las Puertas de Bronce del Hades</div>
                    <div class="form-group">
                        <label for="cerberus-pwd">Introduce la Contraseña Divina de 12 Caracteres:</label>
                        <input type="text" id="cerberus-pwd" class="input-cerberus" maxlength="12" placeholder="HERACLESDAW!" value="${currentPass.replace(/_/g, '')}">
                    </div>
                    <button id="btn-purge-curse" class="btn-purification">⚔️ SOMETER A CERBERO Y RESTAURAR EL OLIMPO</button>
                    <div id="cerberus-feedback" class="feedback-msg">Cada trabajo mitológico corresponde a una letra.</div>
                </div>
            </div>
        `;

        const pwdInput = container.querySelector("#cerberus-pwd");
        const btnPurge = container.querySelector("#btn-purge-curse");
        const feedback = container.querySelector("#cerberus-feedback");

        btnPurge.addEventListener("click", () => {
            const val = pwdInput.value.trim().toUpperCase();
            if (val === "HERACLESDAW!" || val === "HERACLESDAW1" || val === "HERACLESDAW") {
                this.solveLabor(12);
                window.olympusAudio?.playRestorationFanfare();
                document.getElementById("modal-challenge")?.classList.remove("active");
                window.app?.triggerRestoration();
            } else {
                window.olympusAudio?.playError();
                feedback.innerHTML = `<span class="txt-danger">❌ Cerbero ruge con furia. La contraseña '${val}' es incorrecta. Pista: H-E-R-A-C-L-E-S-D-A-W-!</span>`;
            }
        });
    }

    handleSuccess(labor, message) {
        this.solveLabor(labor.id);
        const modal = document.getElementById("modal-challenge");
        const feedback = modal?.querySelector(".feedback-msg");
        if (feedback) {
            feedback.innerHTML = `
                <div class="success-banner">
                    <div class="trophy-char">✨ ¡CARÁCTER OBTENIDO: <strong>'${labor.character}'</strong> (Posición ${labor.position}/12)! ✨</div>
                    <p>${message}</p>
                    <button class="btn-action" onclick="window.app.closeModalAndRefresh()">Volver al Mapa de la Hélade</button>
                </div>
            `;
        }
    }
}

window.laborsManager = new LaborsManager();
