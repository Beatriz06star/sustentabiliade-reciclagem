const objetos = document.getElementById("objetos");
const pontuacao = document.getElementById("pontuacao");
const mensagem = document.getElementById("mensagem");
const btnReiniciar = document.getElementById("btnReiniciar");
const btnAjuda = document.getElementById("btnAjuda");
const balao = document.getElementById("balao");
const fecharBalao = document.getElementById("fecharBalao");
const jogoCanvas = document.getElementById("jogoCanvas");
const cursorCustomizado = document.getElementById("cursorCustomizado");
const textoBalao = document.querySelector(".texto-balao");

let pontos = 0;
let objetoArrastado = null;
let offsetX = 0;
let offsetY = 0;


const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function tocarSomAcerto() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); 
    osc.frequency.setValueAtTime(783.99, now + 0.08); 
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + 0.3);
}

function tocarSomErro() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.25);
}


function tocarSomVitoria() {
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    // Notas de uma musiquinha de vitória rápida (Arpejo alegre)
    const notas = [523.25, 659.25, 783.99, 1046.50]; // Dó, Mi, Sol, Dó agudo
    
    notas.forEach((freq, index) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + (index * 0.1));
        
        gain.gain.setValueAtTime(0.2, now + (index * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.1) + 0.25);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(now + (index * 0.1));
        osc.stop(now + (index * 0.1) + 0.25);
    });
}


document.addEventListener("pointermove", (e) => {
    const rect = jogoCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cursorCustomizado.style.left = x + "px";
    cursorCustomizado.style.top = y + "px";

    if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
    ) {
        cursorCustomizado.style.display = "block";
    } else {
        cursorCustomizado.style.display = "none";
    }
});


const lixo = [
    { imagem: "imagens/caixa.png", tipo: "papel", esquerda: 8, topo: 58, w: 29, h: 35 },
    { imagem: "imagens/garrafa.png", tipo: "plastico", esquerda: 27, topo: 40, w: 20, h: 42 },
    { imagem: "imagens/sacola.png", tipo: "plastico", esquerda: 29, topo: 64, w: 24, h: 33 },
    { imagem: "imagens/lata.png", tipo: "metal", esquerda: 44, topo: 54, w: 20, h: 33 },
    { imagem: "imagens/chave metal.png", tipo: "metal", esquerda: 54, topo: 67, w: 18, h: 26 },
    { imagem: "imagens/metal amaçado.png", tipo: "metal", esquerda: 64, topo: 62, w: 20, h: 29 },
    { imagem: "imagens/garrafa de vidro.png", tipo: "vidro", esquerda: 72, topo: 45, w: 17, h: 46 },
    { imagem: "imagens/copo de vidro.png", tipo: "vidro", esquerda: 80, topo: 64, w: 20, h: 33 }
];


function criarObjetos() {
    objetos.innerHTML = "";

    lixo.forEach((item, index) => {
        const img = document.createElement("img");
        img.src = item.imagem;
        img.className = "objeto";
        img.dataset.tipo = item.tipo;
        img.dataset.id = index;
        img.draggable = false;

        img.style.left = item.esquerda + "%";
        img.style.top = item.topo + "%";
        img.style.width = item.w + "%";
        img.style.height = item.h + "%";

        img.addEventListener("pointerdown", iniciarArraste);
        objetos.appendChild(img);
    });
}


function iniciarArraste(event) {
    event.preventDefault();

    objetoArrastado = event.currentTarget;
    const rect = objetoArrastado.getBoundingClientRect();

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    objetoArrastado.classList.add("arrastando");

    document.addEventListener("pointermove", moverObjeto);
    document.addEventListener("pointerup", soltarObjeto, { once: true });
}


function moverObjeto(event) {
    if (!objetoArrastado) return;

    const cenario = document.querySelector(".cenario").getBoundingClientRect();

    let esquerda = event.clientX - cenario.left - offsetX;
    let topo = event.clientY - cenario.top - offsetY;

    const limiteX = cenario.width - objetoArrastado.offsetWidth;
    const limiteY = cenario.height - objetoArrastado.offsetHeight;

    esquerda = Math.max(0, Math.min(esquerda, limiteX));
    topo = Math.max(0, Math.min(topo, limiteY));

    objetoArrastado.style.left = esquerda + "px";
    objetoArrastado.style.top = topo + "px";
}


function soltarObjeto() {
    if (!objetoArrastado) return;

    const objeto = objetoArrastado;
    objeto.classList.remove("arrastando");

    const lixeira = encontrarLixeira(objeto);

    if (lixeira) {
        const tipoObjeto = objeto.dataset.tipo;
        const tipoLixeira = lixeira.dataset.tipo;

        if (tipoObjeto === tipoLixeira) {
            acertou(objeto);
        } else {
            errou();
        }
    }

    objetoArrastado = null;
    document.removeEventListener("pointermove", moverObjeto);
}


function encontrarLixeira(objeto) {
    const objetoRect = objeto.getBoundingClientRect();
    const centroX = objetoRect.left + objetoRect.width / 2;
    const centroY = objetoRect.top + objetoRect.height / 2;

    const lixeiras = document.querySelectorAll(".lixeira");

    for (const lixeira of lixeiras) {
        const rect = lixeira.getBoundingClientRect();

        if (
            centroX >= rect.left &&
            centroX <= rect.right &&
            centroY >= rect.top &&
            centroY <= rect.bottom
        ) {
            return lixeira;
        }
    }

    return null;
}

/* ACERTO */
function acertou(objeto) {
    pontos++;
    pontuacao.textContent = pontos;

    objeto.classList.add("acertou");

    setTimeout(() => {
        objeto.remove();
    }, 400);

    if (pontos === 8) {
        tocarSomVitoria(); 
        mensagem.textContent = "🏆 Jogo Concluído!";
        mensagem.className = "acerto";
        
        balao.style.display = "flex";
        if (textoBalao) {
            textoBalao.innerHTML = `<strong>PARABÉNS!</strong> Você acertou tudo e salvou o meio ambiente! 🌳🎉`;
        }
    } else {
        tocarSomAcerto(); // Toca o som normal de acerto (plim duplo)
        mensagem.textContent = "Muito bem! ♻️ Descarte correto!";
        mensagem.className = "acerto";
    }
}


function errou() {
    tocarSomErro();

    mensagem.textContent = "Ops! Essa não é a lixeira correta. Tente novamente!";
    mensagem.className = "erro";

    setTimeout(() => {
        if (pontos < 8) {
            mensagem.textContent = "Segure o lixo e arraste para o tambor!";
            mensagem.className = "";
        }
    }, 1200);
}


btnReiniciar.addEventListener("click", () => {
    pontos = 0;
    pontuacao.textContent = "0";
    mensagem.textContent = "Segure o lixo e arraste para o tambor!";
    mensagem.className = "";
    
    if (textoBalao) {
        textoBalao.innerHTML = `<strong>Olá!</strong> Arraste cada lixo para a lixeira correta!`;
    }
    
    criarObjetos();
});


btnAjuda.addEventListener("click", () => {
    balao.style.display = (balao.style.display === "none") ? "flex" : "none";
});


fecharBalao.addEventListener("click", (e) => {
    e.stopPropagation();
    balao.style.display = "none";
});


criarObjetos();