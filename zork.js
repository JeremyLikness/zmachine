if (!WebAssembly.instantiateStreaming) { // polyfill
    WebAssembly.instantiateStreaming = async (resp, importObject) => {
        const source = await (await resp).arrayBuffer();
        return await WebAssembly.instantiate(source, importObject);
    };
}

const go = new Go();

let mod, inst, disk, consoleDiv, btn, inp, loader;

logger = (msg) => {
    var p = document.createElement("p");
    p.innerText = msg;
    consoleDiv.appendChild(p);
    consoleDiv.scrollTop = consoleDiv.scrollHeight;
};

fetch("games.json").then(resp => resp.json().then(result => {
    consoleDiv = document.getElementById("console");
    btn = document.getElementById("btnGo");
    inp = document.getElementById("inp");
    loader = document.getElementById("loader");
    loader.innerHTML = '&nbsp;';
    result.forEach(item => {
        const newButton = document.createElement("button");
        newButton.innerText = item.name;
        newButton.addEventListener("click", () => {
            disk = item.disk;
            loader.innerText = '';
            logger(`SEARCHING FOR ${disk}...`);
            setTimeout(() => {
                logger(`LOADING...`);
                setTimeout(() => {
                    logger('READY');
                    logger('RUN');
                    setTimeout(loadingCode, 2000);
                }, 3000);
            }, 2000);
        });
        loader.appendChild(newButton);
        const spacer = document.createElement("span");
        spacer.innerHTML = "&nbsp;"
        loader.appendChild(spacer);
    });
}));

const loadingCode = () => {
    WebAssembly.instantiateStreaming(fetch("zmachine.wasm"), go.importObject).then((result) => {
        mod = result.module;
        inst = result.instance;
        console.clear();
        go.run(inst);
        inst = WebAssembly.instantiate(mod, go.importObject);
        fetch(disk).then(resp => resp.arrayBuffer().then(buf => {
            const byteArray = new Uint8Array(buf);
            window.zork(byteArray);
            inp.removeAttribute("disabled");
            btn.removeAttribute("disabled");
            inp.focus();
            const executeCommand = () => {
                const cmd = inp.value;
                inp.value = "";
                if (cmd.replace(/\s/g, "").length > 0) {
                    window.command(cmd);
                }
                inp.focus();
            }
            btn.addEventListener("click", executeCommand);
            inp.addEventListener("keydown", e => {
                if (e.keyCode === 13) {
                    executeCommand();
                }
            });
        }));
    }).catch((err) => {
        console.error(err);
    });
};

