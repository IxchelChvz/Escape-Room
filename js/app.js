// Controlador Principal de la Aplicación (Navegación, Estado, Temporizador y Efectos)
class HeraclesApp {
    constructor() {
        this.currentScreen = "landing"; // 'landing', 'map', 'restored'
        this.timerInterval = null;
        this.startTime = null;
        this.elapsedSeconds = 0;
        this.teamName = localStorage.getItem("heracles_team_name") || "Héroes del DAW";
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initMatrixCanvas();
        this.updateDiscoveredPasswordHUD();
        this.checkInitialState();
    }

    checkInitialState() {
        // Si el trabajo 12 está resuelto o todos están resueltos, permitir ver estado
        if (window.laborsManager.isSolved(12)) {
            // Se puede ir a la pantalla restaurada
        }
    }

    setupEventListeners() {
        // Botones de pantalla inicial
        document.getElementById("btn-enter-hellas")?.addEventListener("click", () => {
            window.olympusAudio?.playGlitch();
            this.startTimer();
            this.showScreen("map");
        });

        // Altar terminal submit
        document.getElementById("btn-altar-submit")?.addEventListener("click", () => {
            const input = document.getElementById("altar-pwd-input");
            this.validatePassword(input.value);
        });

        document.getElementById("altar-pwd-input")?.addEventListener("keyup", (e) => {
            if (e.key === "Enter") {
                this.validatePassword(e.target.value);
            }
        });

        // Botones de navegación en barra superior
        document.getElementById("nav-landing")?.addEventListener("click", () => this.showScreen("landing"));
        document.getElementById("nav-map")?.addEventListener("click", () => this.showScreen("map"));
        document.getElementById("nav-technical-doc")?.addEventListener("click", () => this.openTechnicalModal());
        document.getElementById("nav-sound-toggle")?.addEventListener("click", () => {
            const isMuted = window.olympusAudio?.toggleMute();
            const btn = document.getElementById("nav-sound-toggle");
            btn.innerHTML = isMuted ? "[MUTED] Sonido: OFF" : "[AUDIO] Sonido: ON";
        });

        // Cerrar modal de reto
        document.getElementById("btn-close-modal")?.addEventListener("click", () => {
            this.closeModalAndRefresh();
        });

        // Cerrar modal de ficha técnica
        document.getElementById("btn-close-tech")?.addEventListener("click", () => {
            document.getElementById("modal-technical")?.classList.remove("active");
        });

        // Botón volver a jugar / reiniciar
        document.getElementById("btn-replay")?.addEventListener("click", () => {
            if (confirm("¿Deseas reiniciar la maldición y comenzar de nuevo la odisea?")) {
                window.laborsManager.resetProgress();
                this.elapsedSeconds = 0;
                localStorage.removeItem("heracles_elapsed_time");
                location.reload();
            }
        });

        // Alternar modo para evaluación docente
        document.getElementById("btn-toggle-view-mode")?.addEventListener("click", () => {
            if (this.currentScreen === "restored") {
                this.showScreen("landing");
            } else {
                this.triggerRestoration(true);
            }
        });

        // Guardar nombre del equipo en leaderboard
        document.getElementById("btn-save-team")?.addEventListener("click", () => {
            const nameInput = document.getElementById("team-input");
            if (nameInput.value.trim()) {
                this.teamName = nameInput.value.trim();
                localStorage.setItem("heracles_team_name", this.teamName);
                this.renderLeaderboard();
                alert(`¡Equipo "${this.teamName}" guardado en los anales del Olimpo!`);
            }
        });
    }

    startTimer() {
        if (!this.timerInterval) {
            this.startTime = Date.now() - (this.elapsedSeconds * 1000);
            this.timerInterval = setInterval(() => {
                this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
                this.updateTimerDisplay();
            }, 1000);
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    updateTimerDisplay() {
        const timerEls = document.querySelectorAll(".timer-display");
        timerEls.forEach(el => el.textContent = this.formatTime(this.elapsedSeconds));
    }

    showScreen(screenId) {
        this.currentScreen = screenId;
        window.olympusAudio?.playClick();

        document.getElementById("screen-landing")?.classList.toggle("active", screenId === "landing");
        document.getElementById("screen-map")?.classList.toggle("active", screenId === "map");
        document.getElementById("screen-restored")?.classList.toggle("active", screenId === "restored");

        const body = document.body;
        if (screenId === "restored") {
            body.classList.remove("mode-broken");
            body.classList.add("mode-restored");
        } else {
            body.classList.add("mode-broken");
            body.classList.remove("mode-restored");
        }

        if (screenId === "map") {
            this.renderMapNodes();
            this.updateDiscoveredPasswordHUD();
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    renderMapNodes() {
        const mapContainer = document.getElementById("greece-map-nodes");
        if (!mapContainer) return;

        mapContainer.innerHTML = "";

        LABORS_DATA.forEach(labor => {
            const isSolved = window.laborsManager.isSolved(labor.id);
            const nodeEl = document.createElement("div");
            nodeEl.className = `map-node ${isSolved ? 'node-solved' : 'node-broken'}`;
            nodeEl.style.left = `${labor.coordinates.x}%`;
            nodeEl.style.top = `${labor.coordinates.y}%`;

            nodeEl.innerHTML = `
                <div class="node-icon">
                    ${isSolved ? `
                        <div class="gold-amphora">[ANFORA]</div>
                        <div class="node-badge-char">${labor.character}</div>
                    ` : `
                        <div class="broken-column">[TEMPLO]️</div>
                        <div class="flame-spark">[FUEGO]</div>
                    `}
                </div>
                <div class="node-tooltip">
                    <span class="tooltip-num">Trabajo #${labor.id}</span>
                    <strong class="tooltip-title">${labor.title}</strong>
                    <span class="tooltip-module">${labor.module}</span>
                    <span class="tooltip-status">${isSolved ? '¡SUPERADO! Carácter: ' + labor.character : 'BLOQUEADO'}</span>
                </div>
            `;

            nodeEl.addEventListener("click", () => {
                this.openChallengeModal(labor);
            });

            mapContainer.appendChild(nodeEl);
        });

        // Actualizar estadísticas de progreso
        const solvedCount = window.laborsManager.solvedLabors.length;
        const progressPercent = Math.round((solvedCount / 12) * 100);
        const bar = document.getElementById("labors-progress-bar");
        const txt = document.getElementById("labors-progress-text");
        if (bar) bar.style.width = `${progressPercent}%`;
        if (txt) txt.textContent = `${solvedCount} / 12 Trabajos Purgados (${progressPercent}%)`;
    }

    openChallengeModal(labor) {
        window.olympusAudio?.playGlitch();
        const modal = document.getElementById("modal-challenge");
        const title = document.getElementById("challenge-title");
        const moduleTag = document.getElementById("challenge-module-tag");
        const body = document.getElementById("challenge-body");

        title.textContent = `Trabajo #${labor.id}: ${labor.title} (${labor.subtitle})`;
        moduleTag.textContent = `Módulo: ${labor.module} | Ubicación: ${labor.location}`;

        window.laborsManager.renderChallengeContent(labor, body);
        modal.classList.add("active");
    }

    closeModalAndRefresh() {
        document.getElementById("modal-challenge")?.classList.remove("active");
        this.renderMapNodes();
        this.updateDiscoveredPasswordHUD();

        // Si se han resuelto todos o el 12, felicitar
        if (window.laborsManager.isSolved(12)) {
            this.triggerRestoration();
        }
    }

    updateDiscoveredPasswordHUD() {
        const hudContainer = document.getElementById("password-slots");
        if (!hudContainer) return;

        hudContainer.innerHTML = "";
        LABORS_DATA.forEach((labor, idx) => {
            const isSolved = window.laborsManager.isSolved(labor.id);
            const slot = document.createElement("div");
            slot.className = `pwd-slot ${isSolved ? 'slot-revealed' : 'slot-locked'}`;
            slot.innerHTML = `
                <span class="slot-idx">${idx + 1}</span>
                <span class="slot-letter">${isSolved ? labor.character : '?'}</span>
            `;
            hudContainer.appendChild(slot);
        });
    }

    validatePassword(inputStr) {
        const clean = inputStr.trim().toUpperCase();
        if (clean === "HERACLESDAW!" || clean === "HERACLESDAW1" || clean === "HERACLESDAW") {
            window.laborsManager.solveLabor(12);
            this.triggerRestoration();
        } else {
            window.olympusAudio?.playError();
            const msg = document.getElementById("altar-feedback");
            if (msg) {
                msg.innerHTML = `<span class="txt-danger">[ERROR] La contraseña sagrada rechaza la entrada. Completa los trabajos en la Hélade para recolectar las 12 letras.</span>`;
            }
        }
    }

    triggerRestoration(bypassPrompt = false) {
        this.stopTimer();
        window.olympusAudio?.playRestorationFanfare();

        // Efecto de fogonazo blanco de restauración
        const flash = document.createElement("div");
        flash.className = "divine-flash";
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 1200);

        this.showScreen("restored");

        // Registrar tiempo en pantalla restaurada
        const finalTimeEl = document.getElementById("victory-time");
        if (finalTimeEl) finalTimeEl.textContent = this.formatTime(this.elapsedSeconds);

        this.renderLeaderboard();
    }

    renderLeaderboard() {
        const boardBody = document.getElementById("leaderboard-body");
        if (!boardBody) return;

        const defaultTeams = [
            { name: "Equipo Atenea (Micenas)", time: "05:14", solved: "12/12" },
            { name: "Tigres de Esparta (DIW)", time: "07:38", solved: "12/12" },
            { name: this.teamName, time: this.formatTime(this.elapsedSeconds || 420), solved: "12/12 (TÚ)", isCurrent: true },
            { name: "Centauros de Tesalia", time: "09:45", solved: "12/12" },
            { name: "Argonautas del DWES", time: "11:20", solved: "12/12" }
        ];

        boardBody.innerHTML = "";
        defaultTeams.forEach((t, i) => {
            const tr = document.createElement("tr");
            if (t.isCurrent) tr.className = "highlight-row";
            tr.innerHTML = `
                <td>#${i + 1}</td>
                <td><strong>${t.name}</strong></td>
                <td><span class="badge-time">⏱️ ${t.time}</span></td>
                <td>${t.solved}</td>
            `;
            boardBody.appendChild(tr);
        });
    }

    openTechnicalModal() {
        window.olympusAudio?.playClick();
        document.getElementById("modal-technical")?.classList.add("active");
    }

    // Efecto de lluvia digital de caracteres en griego antiguo y errores de consola
    initMatrixCanvas() {
        const canvas = document.getElementById("matrix-canvas");
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const greekChars = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψω404_500_SEGFAULT_ERR_NULL_NaN_0xDEADBEEF";
        const fontSize = 15;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = new Array(columns).fill(1);

        const draw = () => {
            if (this.currentScreen === "restored") {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.fillStyle = "rgba(18, 12, 10, 0.08)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#D32F2F"; // Rojo maldición
            ctx.font = `${fontSize}px 'Fira Code', monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = greekChars[Math.floor(Math.random() * greekChars.length)];
                ctx.fillText(char, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        setInterval(draw, 50);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    window.app = new HeraclesApp();
});
