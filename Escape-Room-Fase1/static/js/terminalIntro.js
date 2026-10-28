/* ==========================================================================
   TERMINAL INTRO // BOOTLOADER VERDE -> INYECCION BURDEOS -> ARAÑA ASCII
   (Cero emojis, transiciones fluidas y opcion de saltar)
   ========================================================================== */

(function () {
    'use strict';

    var SPIDER_ASCII = `                                                                                           +-       
                                                          *                              +=         
                                                       -=                              +#           
                                                     *:                              *@-            
                                                  -#                               =@%              
                                                =+                               +@@-               
                                              %-                                %@%                 
                                           :@-                                =@@*                  
                                         =@=                                 %@@=                   
                                       :@%                                 :@@@                     
                                     =@@-                                 -@@#                      
                                    :@@                                  =@@-                       
                                    *@@                                 *@@+                        
                                    @@#                                #@@%                         
                                   *@@-                               *@@@-                         
                                   @@#                               *@@@=                          
                                  +@@                               *@@@-                           
                                  @@%                              *@@@:                            
                                 *@@+                             =@@@+                             
                                :@@@:                             @@@*                              
                                @@@=                             @@@%                               
                               *@@@                             %@%@                                
                              -@@@*                            =@%%-                                
                              %@@@                            =@#+%                                 
                             +@@@%                           %@@%@:                                 
                             %@@@-                          %@@@@@                                  
                             %@@@                          #@@@@@-                                  
                             %@@@+                        :@@@@@@                                   
                            :=@@@@:                       @@@@@@#                                   
                       :*@@@%=*@@@@:                     #@@@@@@                            +#@@+   
                    -@@@@+     %@@@@-                   =@@@@@@=                        *@@@@=      
                  +@@@*         @@@@@-                  #@@@@@:                     +@@@@%=         
                 :@@@           :@@@@@:                :@@@@@%                  :#@@@@#:            
                 :@@@@           :@@@@@                #@@@@@=               :@@@@@#                
                 :@@@@            =@@@@@               %@@@@@=            :#@@@@+                   
                  #@@@             %@@@@%              %@@@@@:          :@@@@*                      
                  +@@@              #@@@@=             %@@@@@         :@@@@@-                       
                  -@@@:              %@@@@:            *@@@@*        %@@@@+                         
                   @@@%               @@@@*            *@@@@-      *@@@@@                           
                   +@@@-               #@@@+           %@@@@     -@@@@@:                            
                   :@@+@:               =@@@+          @@@@*   :@@@@@:                              
                    @@#@@@@@=:           #@@@+        -@@+@:  #@@@@=                                
                     =%@@@@@@@@@%+        %@@@@@@@=   #@%:@ -@@@@#                                  
                         -@@@@@@@@@@@:    #@@@@@#@@%  @@-@-@@@@@:                                   
                             -#@@@@@@@@%::@@@@@@@@@@@@@#@@@@@@@=                                    
                                 :-#@@@@@@@@@@@@#@@@@@@@@@@@@@*                                     
                                       =@@@@@@@-@@@@@@@@@@@@@+                                      
                                       @@@@@@@@@@@@@@@@@@@@@-                                       
                                      -@@@@@@@@@@@@@@@@@@@@                                         
                       :-=+#%%%%%%#+=-*@@@@@@@@@@@@@@@@@@-                                          
                    +@@@@@@@@@@@@*= :+*#@@@@@@@@@@@@@@@@+                                           
                  @@@@@@@@@-: * +@@@@@@@@@@@@@@@@@@@@@@@@@                                          
                @@@@@@+     =*@@@@@@@@@@@@@@@@@@@@@@@@@@@@:                                         
              :@@@@%       @@@@@@@@@@@@@@@@@@@@@@@@@@@@@#@@@-                                       
              *@@@=      -@@@@@@#@@@@@@@@@@@@@@@@@@@@@- %@@@@@-                                     
               @@@#   +@@@@@@%=  :@@@@@@@@@@@@@@@@@@@@@@@@-%@@@@=                                   
                +@@@@@@@@@@@       @@@@@@@@@@#-@@@@::@@@@@%  #@@@@%:                                
                #@@@@@@@@@@@@     *@@@@@@@@@@@  @@@*  @@@@@:   :%@@@@%:                             
             :@@@@@@@@++%@@@@-   #@@@@@@@@@@@@+ %@@*  =@@@@#       -#@@@:                           
            #@@@%#@*    #@@@@:   :@@@@@@@@@@@@ =@@@#   *@@@@:          =@@                          
           %@@@#@*      *@@@%    :@@@@@@@@@@@@ @@@@*    @@@@*            :@#                        
          %@@@*         -@@@*    *@@@@@@@@@@@%@@@@@-    =@@@@-             :#=                      
         @@@@%           *@@%   :@@@@@@@@@@@@@@@@@%      %@@@%                #:                    
        %@@@%             @@@:  :@@@@@@@@@@@@@@@@@       -@@@@+                                     
       +@@@@:             :@@%   @@@@@@@@@@@@@@@@         %@@@@=                                    
      =@@@@:                @@%  :@@@@@@@@@@@@@%           @@@@@:                                   
     :@@@@:                  #@@= :@@@@@@@@@@@=            *@@@@@                                   
     @@@@:                     =@@*%@@@@@@@@+               %@@@@#                                  
    %@@@-                          -=+***+:                 -@@@@@:                                 
   #@@@=                                                     +@@@@-                                 
  +@@@+                                                       +@@@@:                                
 =@@@#                                                         +@@@@                                
 @- @:                                                          @@@@%                               
 @@@+                                                           =@@@@*                              
 *@@#                                                            @@@@@-                             
  @@@=                                                            @@@@%                             
   @@@                                                             @@@@=                            
    %@%                                                             @@@@                            
     %@*                                                             @@@*                           
      %@*                                                             @@@-                          
       #@+                                                             @@@:                         
        *@-                                                             %@#                         
         +@:                                                             #@*                        
          -#                                                              #@=                       
           :*                                                              %@:                      
             +                                                              @@                      
              :                                                             :@#                     
                                                                             :@-                    
                                                                              =@                    
                                                                               ++                   
                                                                                *-                  `;

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
                    '<pre class="intro-spider-pre">' + SPIDER_ASCII + '</pre>' +
                    '<div class="intro-spider-footer">MALDICION DE HERA ACTIVADA // INICIANDO LOS 12 TRABAJOS...</div>' +
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
        }

        // Fase 1: Terminal en verde fósforo
        setTimeout(function () {
            addLine('> INICIALIZANDO TERMINAL DEL OLIMPO...', '');
        }, 120);

        setTimeout(function () {
            addLine('> VERIFICANDO ACCESO A LA BASE DE DATOS... [OK]', '');
        }, 450);

        setTimeout(function () {
            addLine('> ANALIZANDO INTEGRIDAD DE LOS 12 SECTORES... [12/12 ACTIVOS]', '');
        }, 850);

        setTimeout(function () {
            addLine('> ADVERTENCIA: ANOMALIA DETECTADA EN PUERTO 3000...', 'alert-red');
        }, 1250);

        // Fase 2: Transición a color burdeos + "Injecting HERACLES.EXE"
        setTimeout(function () {
            if (isFinished) return;
            overlay.classList.remove('phase-green');
            overlay.classList.add('phase-burgundy');
            addLine('======================================================================', '');
            addLine('[ALERTA CRITICA] INTRUSION EXTERNA DETECTADA', 'alert-red glitch-flash');
            addLine('[EXPLOIT] SOBREESCRIBIENDO PRIVILEGIOS DE RAIZ...', '');
        }, 1700);

        setTimeout(function () {
            if (isFinished) return;
            addLine('[PAYLOAD] INJECTING HERACLES.EXE...', 'alert-red');
            var pWrap = document.createElement('div');
            pWrap.className = 'intro-progress-wrap';
            pWrap.id = 'introProgress';
            pWrap.textContent = '[INYECCION] [                    ] 0%';
            consoleBox.appendChild(pWrap);

            var pct = 0;
            var pInt = setInterval(function () {
                if (isFinished) { clearInterval(pInt); return; }
                pct += 25;
                var bars = '='.repeat(pct / 5) + ' '.repeat(20 - (pct / 5));
                pWrap.textContent = '[INYECCION] [' + bars + '] ' + pct + '%';
                if (pct >= 100) {
                    clearInterval(pInt);
                    addLine('[ESTADO] HERACLES.EXE INYECTADO CON EXITO.', 'alert-red');
                    addLine('[MALWARE] CORROMPIENDO LOS 12 TRABAJOS DEL OLIMPO...', '');
                }
            }, 110);
        }, 2050);

        // Fase 3: Aparicion de la araña en ASCII
        setTimeout(function () {
            if (isFinished) return;
            consoleBox.style.display = 'none';
            spiderBox.style.display = 'flex';
        }, 3200);

        // Fase 4: Colapso del tubo CRT y carga de la pagina
        setTimeout(function () {
            finishIntro();
        }, 5300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startTerminalIntro);
    } else {
        startTerminalIntro();
    }
})();
