
const socket = io();

socket.on('valve_changed', (data) => {
    if (data.name === "Koch's Air") {
        const width = 600;
        const height = 500;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        const popup = window.open(
            "",
            "Valve Alert",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes`
        );

        popup.document.write(`
            <html>
            <body style="font-family: Arial; text-align:center; padding:20px;">
                <style>
                    @keyframes flash {
                        0% { opacity: 1; }
                        50% { opacity: 0; }
                        100% { opacity: 1; }
                    }
        
                    .flash {
                        animation: flash 1s infinite;
                        color: red;
                        font-size: 48px;
                        font-weight: 900;
                        letter-spacing: 2px;
                    }
                </style>
        
                <h2 class="flash">WARNING:</h2>
        
                <p>THIS IS THE COLLISON OF HIGH AND LOW PRESSURE SYSTEM AND IS NORMALLY CLOSED</p>
                <p><strong>${data.name}</strong> (${data.type})</p>
                <p>You are changing to ${data.new_state} state.</p>
                <p>IF YOU ARE QUESTIONING THIS ASK BEFORE YOU OPEN THIS VALVE</p>
                <p>CALL DAVID,ERIC, OR TUCKER FOR QUESTIONS</p>
                <p>User: ${data.user}</p>
        
                <button id="ackBtn">Acknowledge</button>
        
                <script>
                    document.getElementById("ackBtn").onclick = function() {
                        window.close();
                    };
                <\/script>
            </body>
            </html>
        `);
    }

    if (data.name === "Old Supply Drain at Bottom of Cascade") {
        const width = 600;
        const height = 500;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        const popup = window.open(
            "",
            "Valve Alert",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes`
        );

        popup.document.write(`
            <html>
            <body style="font-family: Arial; text-align:center; padding:20px;">
                <style>
                    @keyframes flash {
                        0% { opacity: 1; }
                        50% { opacity: 0; }
                        100% { opacity: 1; }
                    }
        
                    .flash {
                        animation: flash 1s infinite;
                        color: red;
                        font-size: 48px;
                        font-weight: 900;
                        letter-spacing: 2px;
                    }
                </style>
        
                <h2 class="flash">WARNING:</h2>
        
                <p>add text</p>
                <p><strong>${data.name}</strong> (${data.type})</p>
                <p>You are changing to ${data.new_state} state.</p>
                <p>IF YOU ARE QUESTIONING THIS ASK BEFORE YOU OPEN THIS VALVE</p>
                <p>CALL DAVID,ERIC, OR TUCKER FOR QUESTIONS</p>
                <p>User: ${data.user}</p>
        
                <button id="ackBtn">Acknowledge</button>
        
                <script>
                    document.getElementById("ackBtn").onclick = function() {
                        window.close();
                    };
                <\/script>
            </body>
            </html>
        `);
    }


     if (data.name === "Pond/Pit Isolation Valve") {
        const width = 600;
        const height = 500;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);
        const popup = window.open(
            "",
            "Valve Alert",
            `width=${width},height=${height},left=${left},top=${top},resizable=yes`
        );

        popup.document.write(`
            <html>
            <body style="font-family: Arial; text-align:center; padding:20px;">
                <style>
                    @keyframes flash {
                        0% { opacity: 1; }
                        50% { opacity: 0; }
                        100% { opacity: 1; }
                    }
        
                    .flash {
                        animation: flash 1s infinite;
                        color: red;
                        font-size: 48px;
                        font-weight: 900;
                        letter-spacing: 2px;
                    }
                </style>
        
                <h2 class="flash">WARNING:</h2>
        
                <p>POND WILL DRAIN</p>
                <p><strong>${data.name}</strong> (${data.type})</p>
                <p>You are changing to ${data.new_state} state.</p>
                <p>IF POND ISOLATION VALVE IS CLOSED</p>
                <p>PUMPING WATER WILL DRAIN PIT UNTIL PUMP SHUTS DOWN AT 3 FEET LEFT IN POND</p>
                <p>CALL DAVID,ERIC, OR TUCKER FOR QUESTIONS</p>
                <p>User: ${data.user}</p>
        
                <button id="ackBtn">Acknowledge</button>
        
                <script>
                    document.getElementById("ackBtn").onclick = function() {
                        window.close();
                    };
                <\/script>
            </body>
            </html>
        `);
    }

});



