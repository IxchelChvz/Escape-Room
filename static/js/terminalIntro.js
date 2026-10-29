/* ==========================================================================
   TERMINAL INTRO // BOOTLOADER VERDE -> INYECCION BURDEOS -> QUIMERA ASCII
   (Cero emojis, transiciones fluidas y opcion de saltar)
   ========================================================================== */

(function () {
    'use strict';

    var SPIDER_ASCII = `           .                                                           .                           -
                                           .  .   . ..      .                                      =
                          .                      .:.*...         :.                       .        .
                                                 +%%%@:.                                            
        .                              .        .+#.=%:..                               .           
              .                                  #%:#@-.   .            .                           
        ...   .                          .       .@@@*..                                            
                    .                       ...  .*@@:....                                          
                                                .=@%@@:.   .                   .     .    .         
                                                .=@%%@:.                    .              .        
                                                *=@*@%*-.        .                                  
                .                              .. -@@..             .       .                       
                                                  +@@:.                 .                 .         
           .                                    ::@@@@.:..         .                     .          
                    .        .                   =@@@@:.                   .                 .      
                                                 .@#%%.                                             
  .                                              .%*@#.                                            .
     ..   .        .                             .%@@#.    .                                        
     ..                      .                   .@*@%.                                             
     .                                          .+@.:@-.                           .                
                          .          .. .       =@@%@@@:           ...                              
                              .:-+@*:-#%%:..   ..#@@@@+..       ..-+%%%#.....             .     .   
                          ...:+-.-.#@@#-:#:      =@@@@:.       .=-%@@=%%##%@@@#:..         .  .     
                          :@%+:.*%=**+#@-+.      .@@@@.       ..=@@##+=-**%@@@@@@+.        .        
                      ..#@@@@=#@+. ...+-::        #@@#.         .=:+.+:+=%#-*%@@@@@=.              .
                   .=@@@%@:==.-:.   .:-...       .##@#.         .-.+:.... .%#@@@@@@@@:.             
                 ..*@@%*#--#:..=.-... := .:.    -%@@@@%:.       . .-...- .+%*%@@@@@@@@+             
                 :#@@*+#:.+=..+--%%%@+=..+:     .@@#%@@.       .# .*#%#+#+=%%::=*:=@@@@#.           
                .#@#==*-.*...........-*%%=.   .-@@*::#@@-.     .**%%@%=-:::..-@##-++#@@@%.          
               .:@@@@%-.-:+.           ...   ...%@*.-*@#..      .*...         .#:=---*@@@%          
              .:@@@%%-..*:.=.                   #@*.:*@+.    .          .      :+...::=*@@:.    .   
              ..@@@@%-.*=..      ..             +@#%%#@-.  .            .      .+..... .*@#.        
              .:@@@@@:.*-.        .             +@%**@@=.          .           .*#--== ..@*.        
               .%@@@%+*=::                      +@#.-@@+.                      .*. ..    #:.        
     .         .*@@@+==*+-.           .        .#@#==@@*.                     .+::+#+-:+#%..        
               .-%@@@.:+*#+=.                   .@%+*@@..      .             .=:-...   .#.          
                 .#@@@@:-=.--:.     .           .%#-#@@..                   :+:. .=...:*.           
     .           ..=@@@@-%=..+-...             ..*%#*@*..       .       ..-+=..+-.....*.            
                  .+#%@@@%.-=.=-:*...            *@#@@*..           ...-%..:.::....:+-..            
    .    .         ..:-@@@@@*%.++.+=.-.          *@=@@+..        .-+#-=... .*-.:..-+. .             
                       .+@@@@-#+.@..+ .%.*-..=.  *@%#@*.....:*%*=......+.++.  .=+*.       .         
                         :##%@@+@+.@:.+.*:.%:.  .*@@@##::....=.--:+.=-..:...-*#:...              .  
.         .                .-:-%@@@@-*+.*.:+.  =#-=.%-#-=+:=.=..= ...::.=#@#:..       .             
                            ..-..=@@@@%+@-%=.*-:#==:.=.:::=.+-###@@@@@@@=.   .      .       .       
   .         .                 .....**-*@@@@*+-=.-::*#%@@@@@@@@@@@%*-...           .                
                                      ...:+@=...#%==##@@@@@@#+=-.      .    .         .             
                                         .@.:*%@@--@@@@@@#..::*#+-::.                               
               .        .               .#.=+=-.==@@@@@@@@@@=.........                            ..
                .                       .#=-:=+#:@@@@@%*%@@@@@***@@..                             .%
                                        .#-+---:*@@@@@*=:%@@@@@@*.:.                           .  *@
                                        .#+%#@=.+@%%@%=.--@@@#:...:+=.   .                       .#@
                                         :+*.::.%@@@@%-.+#@@@#-+%+..                             .+@
   .                                     .#*-#:#@@@@@%-.==@@#*#...-:.    .                  .  .  .#
                                          .@++%.-#@@@@-*@@*@%..:@....                    .        ..
        .                  .              ..#::#:+@@@@@@%@..=+...                                   
                                            .-@**@@@@@@@@@#..-...                               .   
             .                             --#@%@@@*@@@@@@@%.....                                   
                     .        .         .=:#@@@-.:@@@@-**#@@@@-..                                   
                                        .+@@@*.-#:%##*+::+*-#@@%.                  .                
.                                      +@@%....*..=-%@..=@:-@@@@@+.                                 
                                     ..#@-...-#-. =%%%. ..==#@@@@@%.                                
         .                           .=@@@*++%#...=-%@.   .-*:%@@@@*. .                             
                                  .  -@@@@#**-.. :=#@@:.    *..+@@@@=.                              
  .           .   .    .            .-+@=..:::...:%@@@=.    =:-=:@@@*.          . .                 
         .                          ..%@@@...+#+. **@@:     *:....@@#.                              
                      .               -+@#@=+*+.. =@@@.   ..=-.-=:*@+.                              
                     .                .=+@@@**#-+:-@@@.:...#=.#:...%.                             . 
                       .               .=.%@@@@:#@%@%@-..:%..*-  .#..                             . 
                                         .:.=#%@@*@@%%==+.:%..-:+-.                                 
                                            .. .@#@@@@--#=:..=*:.                                   
                                      .        .=**.+#+.:.+*:..      .                              
                           .                 ..+::=*.+=@*#%=::==-                                   
                         .             .    .=.+=.=%@*.%@@+%@@@@%..                                 
          .                                .+.-:.#.@@*.==@@%+=++:.=..                    .          
                                           --=.=+ .@@*.:#@@@#+. .=*:.                         .     
                                          .=#.:@-  %@=..-@@@::..=%.-.                               
                                          .+*.@@+. #@=..:+@@*:-#%..-.                               
      .                        .           :+.@@@=.*@-...%@%.:#= .%..                      . .      
.        .                                 .+.@@@@##@-.*@@@:.#.:% .=.                               
              .                   .         .+=@@@@@@%@@@@*:%-+:.=...          .                    
                                        .    ..#@@@@@@@%..*=.%.= ..         .                 .     
     .     .                                 .=%@@@@@@@@@::=.*.:      .                             
                             .     .       .-=#@@@@@@@*%@@@.....       .                            
                                           .*@#..#@@@@+**%@@-                       .     .         
 .               .                       :.-@@@@=-=@@%...:*@@=                  .                   
                       .                ...%@:...=-@@@:. ..@@@.                                     
                          .         .   ..#@%....-:@@@:-....@@-                             ..      
               .         .              ...@@#.  .#@@@+.    %@=  .   ..              .              
      .                   .             .:#@@*.-. .#@*.   ..@@:                         .           
                             .          ..-@@@=....+@=.....@@+.                                     
                              .            .@@+%.:=+@-=..=@@*..                                     
                         .                ...#@@@*.*@*.:@@@... .                                .   
            .                               ...-:+%@:.@@:..    .                                    
         .                       .             ...=@@@+..                                   .       
  ..        .                  .                  -##@@..      .   .                                
 ...  ....................                        +.:.#:.        .              .                .  
..... ....................      .                 :- .:.                                     .  .   
`;

    function startTerminalIntro() {
        // Crear elemento contenedor CRT
        var overlay = document.createElement('div');
        overlay.id = 'introTerminalOverlay';
        overlay.className = 'intro-terminal-overlay phase-green';

        overlay.innerHTML = 
            '<div class="intro-crt-bezel"></div>' +
            '<div class="intro-crt-glass"></div>' +
            '<div class="intro-crt-scanlines"></div>' +
            '<div class="intro-crt-beam"></div>' +
            '<button type="button" class="intro-skip-btn" id="introSkipBtn">[SALTAR INTRO]</button>' +
            '<div class="intro-crt-tube-content">' +
                '<div class="intro-console-box" id="introConsoleBox"></div>' +
                '<div class="intro-spider-container" id="introSpiderBox">' +
                    '<div class="intro-spider-title">=== HERACLES.EXE // SISTEMA SECUESTRADO ===</div>' +
                    '<div class="intro-spider-subtitle">EXPLOIT: CVE-0404-HERA-CHIMAERA (RCE ROOTKIT ACTIVO)</div>' +
                    '<pre class="intro-spider-pre">' + SPIDER_ASCII + '</pre>' +
                    '<div class="intro-spider-footer">MALDICION DE HERA ACTIVADA // 9 TEMPLOS CON CANDADO // PRUEBAS 3, 11 Y 12 DISPONIBLES</div>' +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);

        var consoleBox = document.getElementById('introConsoleBox');
        var spiderBox = document.getElementById('introSpiderBox');
        var skipBtn = document.getElementById('introSkipBtn');

        var isFinished = false;

        function finishIntro() {
            if (isFinished) return;
            isFinished = true;
            // Efecto de apagado y colapso clasico CRT
            overlay.classList.add('crt-turn-off');
            setTimeout(function () {
                if (overlay && overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
            }, 650);
        }

        // Saltos manuales
        if (skipBtn) skipBtn.onclick = finishIntro;
        window.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
                window.removeEventListener('keydown', onKey);
                finishIntro();
            }
        });

        function addLine(text, className) {
            if (isFinished) return;
            var line = document.createElement('div');
            line.className = 'intro-log-line ' + (className || '');
            line.textContent = text;
            consoleBox.appendChild(line);
            consoleBox.scrollTop = consoleBox.scrollHeight;
        }

        // FASE 1: ARRANQUE Y RECONOCIMIENTO (Verde fósforo, 0s - 3.2s)
        setTimeout(function () {
            addLine('[10:15:01] olympus-kernel v5.19.12-heracles x86_64 ttyS0 initialized', '');
        }, 120);

        setTimeout(function () {
            addLine('[10:15:01] > INICIALIZANDO MONITOR DE AUDITORIA DEL OLIMPO...', '');
        }, 450);

        setTimeout(function () {
            addLine('[10:15:02] > OBJETIVO DETECTADO: 10.0.12.254:443 [dodeka.olympus.internal]', '');
        }, 850);

        setTimeout(function () {
            addLine('[10:15:02] > ESCANEANDO LOS 12 TEMPLOS SAGRADOS... [12/12 PUERTOS ACTIVOS]', '');
        }, 1300);

        setTimeout(function () {
            addLine('[10:15:03] > COMPROBANDO REGLAS DE FIREWALL AEGIS-WAF... [REGLAS CARGADAS]', '');
        }, 1800);

        setTimeout(function () {
            addLine('[10:15:03] > ADVERTENCIA: ANOMALIA EN TRAFICO ENTRANTE (SOCKET TCP/3000)', 'alert-red');
        }, 2350);

        setTimeout(function () {
            addLine('[10:15:04] > CORRELACIONANDO AMENAZA CON BASE DE DATOS DE VULNERABILIDADES...', '');
        }, 2900);

        // FASE 2: DETECCION DE VULNERABILIDAD Y ARSENAL DE EXPLOITS (3.5s - 5.8s)
        setTimeout(function () {
            addLine('----------------------------------------------------------------------', '');
            addLine('[10:15:04] [CVE-0404-HERA-CHIMAERA] Desbordamiento de búfer en demonio Olimpo', 'alert-red');
            addLine('[10:15:05] [EXPLOIT ARSENAL] Seleccionado: EXPLOIT_CHIMAERA_v12.4.bin', '');
            addLine('[10:15:05] > Generando shellcode polimórfico evasor de telemetría...', '');
        }, 3500);

        setTimeout(function () {
            addLine('[10:15:06] > Estableciendo túnel inverso con templo de Zeus... CONEXION ESTABLECIDA', '');
        }, 4300);

        setTimeout(function () {
            addLine('[10:15:06] > Evasión de firma criptográfica: bypass de AEGIS-WAF completado', 'alert-red');
        }, 5000);

        // FASE 3: SUBIDA DEL EXPLOIT CON PROGRESO REALISTA (5.6s - 8.2s)
        setTimeout(function () {
            if (isFinished) return;
            addLine('[10:15:07] [UPLOADING EXPLOIT] Transfiriendo EXPLOIT_CHIMAERA_v12.4.bin (14.8 MB)...', '');
            var pWrap = document.createElement('div');
            pWrap.className = 'intro-progress-wrap';
            pWrap.id = 'introProgress';
            pWrap.textContent = '[SUBIDA] [                    ]  0% (0.0 MB / 14.8 MB)';
            consoleBox.appendChild(pWrap);
            consoleBox.scrollTop = consoleBox.scrollHeight;

            var steps = [
                { pct: 14, mb: '2.1', speed: '2.9 MB/s' },
                { pct: 32, mb: '4.7', speed: '3.3 MB/s' },
                { pct: 54, mb: '8.0', speed: '3.1 MB/s' },
                { pct: 76, mb: '11.2', speed: '3.4 MB/s' },
                { pct: 92, mb: '13.6', speed: '3.0 MB/s' },
                { pct: 100, mb: '14.8', speed: 'COMPLETO' }
            ];
            var stepIndex = 0;

            var pInt = setInterval(function () {
                if (isFinished) { clearInterval(pInt); return; }
                if (stepIndex >= steps.length) {
                    clearInterval(pInt);
                    return;
                }
                var cur = steps[stepIndex];
                var bars = '='.repeat(Math.floor(cur.pct / 5)) + ' '.repeat(20 - Math.floor(cur.pct / 5));
                pWrap.textContent = '[SUBIDA] [' + bars + '] ' + (cur.pct < 100 ? ' ' : '') + cur.pct + '% (' + cur.mb + ' MB / 14.8 MB) ' + cur.speed;
                stepIndex++;

                if (cur.pct >= 100) {
                    setTimeout(function() {
                        addLine('[10:15:09] [OK] EXPLOIT_CHIMAERA_v12.4.bin ALMACENADO EN /tmp/dodeka.bin', 'alert-red');
                        addLine('[10:15:09] > Ejecutando payload con permisos privilegiados UID=0 (root)...', '');
                    }, 200);
                }
            }, 350);
        }, 5600);

        // FASE 4: TRANSICION CRITICA CARMESI / BURDEOS Y SECUESTRO DE KERNEL (8.4s - 10.2s)
        setTimeout(function () {
            if (isFinished) return;
            overlay.classList.remove('phase-green');
            overlay.classList.add('phase-burgundy');
            addLine('======================================================================', '');
            addLine('[ALERTA ROJA] INTRUSION CONFIRMADA: KERNEL PANIC EN TEMPLO DEL OLIMPO', 'alert-red glitch-flash');
            addLine('[10:15:10] > Sobreescribiendo tabla IDT y punteros: 0x7FFF_OLYMPOS -> 0xDEAD_CHIMAERA', '');
            addLine('[10:15:10] > Modificando cerrojos: 9 templos bloqueados con candado arcano', 'alert-red');
            addLine('[10:15:11] > Solo permanecen accesibles las pruebas 3, 11 y 12 para resolver la clave', '');
            addLine('[10:15:11] [ROOTKIT] LA QUIMERA HA CORROMPIDO LA BASE DE DATOS SAGRADA', 'alert-red');
        }, 8400);

        // FASE 5: APARICION DEL ARTE ASCII DE LA QUIMERA (10.4s - 16.5s)
        setTimeout(function () {
            if (isFinished) return;
            consoleBox.style.display = 'none';
            spiderBox.style.display = 'flex';
        }, 10400);

        // FASE 6: CIERRE AUTOMATICO CON EFECTO CRT (16.5s)
        setTimeout(function () {
            finishIntro();
        }, 16500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startTerminalIntro);
    } else {
        startTerminalIntro();
    }
})();
