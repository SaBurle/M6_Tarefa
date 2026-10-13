// Regras do jogo
const limiteTentativas = 15;
const menorNumero = 1;
const maiorNumero = 100;

// Estado do jogo
let numeroSecreto = 0;
let tentativasMaximas = 0;
let errosSeguidos = 0;
let jogoAtivo = false;

// Matriz de chutes: [número da tentativa, chute, dica]
let matrizChutes = [];

// Funções utilitárias
const obterElemento = (id) => document.getElementById(id);
const sortearNumero = () => Math.floor(Math.random() * maiorNumero) + menorNumero;
const numeroInteiro = (valor) => Math.floor(valor) === valor;
const foraDoIntervalo = (valor) => valor < menorNumero || valor > maiorNumero;
const jaTentou = (chute) => matrizChutes.find((item) => item[1] === chute) !== undefined;
const acabaramTentativas = () => matrizChutes.length >= tentativasMaximas;
const registrarChute = (chute, dica) => matrizChutes.push([matrizChutes.length + 1, chute, dica]);

// Mostra uma mensagem no jogo (tipo: 'dica', 'erro' ou 'vitoria')
const mostrarMensagem = (texto, tipo) => {
    const elemento = obterElemento('mensagem');
    elemento.textContent = texto;
    elemento.className = `mensagem ${tipo}`;
};

// Motivo pelo qual o chute é inválido (vazio se estiver tudo certo)
const obterMotivoInvalido = (chute) => {
    if (isNaN(chute)) {
        return 'Digite um número.';
    }
    if (!numeroInteiro(chute)) {
        return 'Use um número inteiro, sem vírgula.';
    }
    if (foraDoIntervalo(chute)) {
        return `O número deve estar entre ${menorNumero} e ${maiorNumero}.`;
    }
    if (jaTentou(chute)) {
        return `Você já tentou o ${chute}.`;
    }
    return '';
};

// Atualizar interface (lista de chutes e tentativas restantes)
const atualizarTela = () => {
    let texto = '';

    matrizChutes.forEach(([numero, chute, dica]) => {
        texto += `${numero}: ${chute} (${dica})\n`;
    });

    obterElemento('listaTentativas').textContent = texto === '' ? 'Nenhum chute ainda.' : texto;
    obterElemento('restantes').textContent = `Tentativas restantes: ${tentativasMaximas - matrizChutes.length}`;
};

// Trava o jogo e libera o botão "Jogar de novo"
const finalizarJogo = () => {
    jogoAtivo = false;
    obterElemento('chute').disabled = true;
    obterElemento('botaoChutar').disabled = true;
    obterElemento('botaoNovoJogo').hidden = false;
};

// Se as tentativas acabaram, mostra a derrota
const verificarFimDeJogo = () => {
    if (acabaramTentativas()) {
        mostrarMensagem(`🦆 Você não conseguiu acertar, mesmo com ${tentativasMaximas} chances! Tentativas feitas: ${matrizChutes.length}. O número era ${numeroSecreto}.`, 'erro');
        finalizarJogo();
    }
};

// Chute inválido: avisa sem gastar tentativa, mas 3 erros seguidos custam uma
const tratarChuteInvalido = (motivo) => {
    errosSeguidos++;

    if (errosSeguidos < 3) {
        mostrarMensagem(`${motivo} (erro ${errosSeguidos} de 3)`, 'erro');
        return;
    }

    errosSeguidos = 0;
    obterElemento('chute').value = '';
    registrarChute('—', 'tentativa perdida');
    mostrarMensagem('🦆 Quack! Três erros seguidos: você perdeu uma tentativa.', 'erro');
    verificarFimDeJogo();
    atualizarTela();
};


// Chamada quando o usuário digita o número de tentativas
function validarTentativas() {

    /*
    1. Pegar o número de tentativas digitado
    2. Vazio, menor que 1 ou com vírgula: botão "Iniciar" fica desativado
    3. Maior que 15: avisa na zoação e usa 15
    4. Tudo certo: libera o botão "Iniciar"
    */

    const campo = obterElemento('tentativas');
    const quantidade = parseFloat(campo.value);
    let aviso = '';
    let valido = true;

    if (isNaN(quantidade) || quantidade < 1) {
        valido = false;
        aviso = `Selecione o número de tentativas (de 1 a ${limiteTentativas}).`;
    } else if (!numeroInteiro(quantidade)) {
        valido = false;
        aviso = 'Use um número inteiro, sem vírgula.';
    } else if (quantidade > limiteTentativas) {
        campo.value = limiteTentativas;
        aviso = `🦆 Quack! O limite é ${limiteTentativas}, patinho. Vou te dar ${limiteTentativas} chances.`;
    }

    obterElemento('botaoIniciar').disabled = !valido;
    obterElemento('areaIniciar').title = valido ? '' : 'Selecione o número de tentativas';
    obterElemento('avisoTentativas').textContent = aviso;
}


function iniciarJogo() {

    /*
    1. Sortear o número escondido
    2. Guardar o número de tentativas escolhido
    3. Zerar chutes e erros
    4. Travar a escolha de tentativas
    5. Mostrar a área de chutes
    */

    numeroSecreto = sortearNumero();
    tentativasMaximas = parseFloat(obterElemento('tentativas').value);
    matrizChutes = [];
    errosSeguidos = 0;
    jogoAtivo = true;

    obterElemento('tentativas').disabled = true;
    obterElemento('botaoIniciar').disabled = true;
    obterElemento('avisoTentativas').textContent = '';

    obterElemento('cartaoChute').hidden = false;
    obterElemento('cartaoLista').hidden = false;
    obterElemento('chute').disabled = false;
    obterElemento('botaoChutar').disabled = false;
    obterElemento('botaoNovoJogo').hidden = true;
    obterElemento('chute').value = '';

    mostrarMensagem('', 'dica');
    atualizarTela();
}


function chutar() {

    /*
    1. Pegar o chute informado
    2. Se for inválido: avisar (3 erros seguidos custam uma tentativa)
    3. Se acertou: mostrar vitória e finalizar
    4. Se errou: dizer se o chute é menor ou maior que o número escondido
    5. Se as tentativas acabaram: mostrar derrota
    6. Atualizar interface
    */

    if (!jogoAtivo) {
        return;
    }

    const chute = parseFloat(obterElemento('chute').value);
    const motivo = obterMotivoInvalido(chute);

    if (motivo !== '') {
        tratarChuteInvalido(motivo);
        return;
    }

    errosSeguidos = 0;
    obterElemento('chute').value = '';

    if (chute === numeroSecreto) {
        registrarChute(chute, 'acertou!');
        const restantes = tentativasMaximas - matrizChutes.length;
        const textoRestantes = restantes === 1 ? 'Restou 1 tentativa' : `Restaram ${restantes} tentativas`;
        mostrarMensagem(`Acertou! Era o número ${numeroSecreto}! ${textoRestantes}, parabéns!`, 'vitoria');
        finalizarJogo();
    } else {
        const comparacao = chute < numeroSecreto ? 'menor' : 'maior';
        registrarChute(chute, `${comparacao} do que o valor escondido`);
        mostrarMensagem(`${chute} é ${comparacao} do que o número escondido.`, 'dica');
        verificarFimDeJogo();
    }

    atualizarTela();
}


function jogarDeNovo() {
    jogoAtivo = false;

    obterElemento('tentativas').disabled = false;
    obterElemento('tentativas').value = '';
    obterElemento('cartaoChute').hidden = true;
    obterElemento('cartaoLista').hidden = true;

    validarTentativas();
}
