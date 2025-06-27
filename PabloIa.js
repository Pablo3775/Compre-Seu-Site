// PabloIA - JavaScript aprimorado para IA local com busca web e imagens

let comandosPersonalizados = JSON.parse(localStorage.getItem("comandosPersonalizados")) || {};
let buscandoResposta = false;

const respostasSociais = {
  "oi": ["Olá! Tudo bem com você?", "Oi! Como posso ajudar?", "E aí! Tudo certo?"],
  "tudo bem": ["Estou ótimo! E você?", "Tudo certo por aqui, obrigado!", "Tudo bem sim, pode perguntar."],
  "bom dia": ["Bom dia! Que seu dia seja incrível ☀️", "Bom dia! Em que posso ajudar hoje?", "Bom dia, meu amigo!"],
  "boa tarde": ["Boa tarde! Precisa de algo?", "Boa tarde! Conte comigo.", "Boa tarde! Como posso ajudar?"],
  "boa noite": ["Boa noite! Pode perguntar algo se quiser.", "Boa noite! Estou aqui para ajudar.", "Boa noite! O que deseja saber?"],
  "obrigado": ["De nada! Pode contar comigo.", "Por nada! Sempre à disposição.", "Obrigado você!"],
  "tchau": ["Até mais! 😊", "Até logo! Volte sempre.", "Tchau, foi bom conversar!"]
};

const stopwords = new Set([
  "o","a","os","as","de","do","da","dos","das","e","é","em","para","por","com","sem",
  "que","quem","como","quando","onde","qual","quais","se","eu","você","tu","ele","ela",
  "eles","elas","me","te","lhe","nos","vos","lhe","isso","isto","aquilo","mais","muito",
  "pode","quer","querer","falar","diga","sobre","fale","meu","minha","teu","tua","seu",
  "sua","nosso","nossa","deixe","faça","fazer"
]);

const FETCH_TIMEOUT = 9000;
const URL_DUCKDUCKGO = "https://api.duckduckgo.com/";
const URL_WIKIPEDIA = "https://pt.wikipedia.org/api/rest_v1/page/summary/";

function salvarComandos() {
  localStorage.setItem("comandosPersonalizados", JSON.stringify(comandosPersonalizados));
}

function respostaAleatoria(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function fetchComTimeout(url, options = {}, timeout = FETCH_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na requisição")), timeout))
  ]);
}

function palavrasLimpa(frase) {
  return frase.toLowerCase()
    .replace(/[.,?!;:\-_"'(){}\[\]]+/g, " ")
    .split(" ")
    .filter(p => p.length > 0);
}

function extrairTermoPrincipal(pergunta) {
  const palavras = palavrasLimpa(pergunta);
  const filtradas = palavras.filter(p => !stopwords.has(p));
  if(filtradas.length === 0) return pergunta.trim();
  return filtradas.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ").trim();
}

function escaparHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

function mostrarMensagemInicial() {
  const respostaDiv = document.getElementById("resposta");
  const imagemDiv = document.getElementById("imagem");
  respostaDiv.innerHTML = `
    <p>👋 Oi! Eu sou a <strong>PabloIA</strong>.<br>
    Pergunte qualquer coisa ou me ensine comandos personalizados como:<br>
    <em>se eu falar lua diga é o satélite natural da Terra</em><br>
    Também posso mostrar imagens com:<br>
    <em>faça uma imagem de dragão</em></p>
  `;
  imagemDiv.innerHTML = "";
}

function mostrarLoading() {
  const respostaDiv = document.getElementById("resposta");
  respostaDiv.innerHTML += `<p class="loading">⌛ Pensando...</p>`;
}

function mostrarErro(msg) {
  const respostaDiv = document.getElementById("resposta");
  respostaDiv.innerHTML = `<p class="erro">❌ ${escaparHtml(msg)}</p>`;
  document.getElementById("imagem").innerHTML = "";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function atualizarRespostaTexto(textoHtml) {
  const respostaDiv = document.getElementById("resposta");
  const imagemDiv = document.getElementById("imagem");
  respostaDiv.innerHTML = textoHtml;
  imagemDiv.innerHTML = "";
}

function atualizarRespostaComImagem(textoHtml, urlImagem, altTexto) {
  const respostaDiv = document.getElementById("resposta");
  const imagemDiv = document.getElementById("imagem");
  respostaDiv.innerHTML = textoHtml;
  if(urlImagem) {
    imagemDiv.innerHTML = `<img src="${urlImagem}" alt="${escaparHtml(altTexto)}" class="imagem-gerada" onerror="this.onerror=null;this.src='https://picsum.photos/600/400';">`;
  } else {
    imagemDiv.innerHTML = "";
  }
}

async function buscarResposta() {
  if (buscandoResposta) return;
  buscandoResposta = true;

  const inputRaw = document.getElementById("pergunta").value.trim();
  const input = inputRaw.toLowerCase();
  const respostaDiv = document.getElementById("resposta");
  const imagemDiv = document.getElementById("imagem");

  respostaDiv.innerHTML = "";
  imagemDiv.innerHTML = "";

  if (!input) {
    atualizarRespostaTexto("<p>Digite algo primeiro.</p>");
    buscandoResposta = false;
    return;
  }

  atualizarRespostaTexto(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p class="loading">⌛ Pensando...</p>`);

  await sleep(300);

  for (const chave in respostasSociais) {
    if (input === chave) {
      const resposta = respostaAleatoria(respostasSociais[chave]);
      atualizarRespostaTexto(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p>${escaparHtml(resposta)}</p>`);
      buscandoResposta = false;
      return;
    }
  }

  const regexEnsinar = /^se eu falar (.+) diga (.+)$/i;
  const comandoAprender = inputRaw.match(regexEnsinar);
  if (comandoAprender) {
    const gatilho = comandoAprender[1].trim().toLowerCase();
    const resposta = comandoAprender[2].trim();

    comandosPersonalizados[gatilho] = resposta;
    salvarComandos();

    atualizarRespostaTexto(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p>Entendido! Quando você falar "<strong>${escaparHtml(gatilho)}</strong>", responderei: "<strong>${escaparHtml(resposta)}</strong>".</p>`);
    buscandoResposta = false;
    return;
  }

  for (const gatilho in comandosPersonalizados) {
    if (input.includes(gatilho)) {
      const resposta = comandosPersonalizados[gatilho];
      atualizarRespostaTexto(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p>${escaparHtml(resposta)}</p>`);
      buscandoResposta = false;
      return;
    }
  }

  const frasesPedidoImagem = ["faça uma imagem de", "quero uma imagem de", "me mostre uma imagem de"];
  for (const frase of frasesPedidoImagem) {
    if (input.startsWith(frase)) {
      const termoImagem = inputRaw.toLowerCase().replace(frase, "").trim();
      if (!termoImagem) {
        atualizarRespostaTexto(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p>Por favor, diga o que quer ver na imagem.</p>`);
        buscandoResposta = false;
        return;
      }
      const urlImagem = `https://source.unsplash.com/600x400/?${encodeURIComponent(termoImagem)}`;
      atualizarRespostaComImagem(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p>Aqui está uma imagem de <strong>${escaparHtml(termoImagem)}</strong>:</p>`, urlImagem, termoImagem);
      buscandoResposta = false;
      return;
    }
  }

  const termoPesquisa = extrairTermoPrincipal(inputRaw);
  atualizarRespostaTexto(`<p><strong>Você perguntou:</strong> ${escaparHtml(inputRaw)}</p><p class="loading">🔎 Pesquisando sobre "<strong>${escaparHtml(termoPesquisa)}</strong>" na web...</p>`);

  try {
    const urlDuck = `${URL_DUCKDUCKGO}?q=${encodeURIComponent(termoPesquisa)}&format=json&no_redirect=1&no_html=1`;
    const resDuck = await fetchComTimeout(urlDuck);
    if (!resDuck.ok) throw new Error("DuckDuckGo não respondeu");

    const dataDuck = await resDuck.json();

    if (dataDuck.AbstractText && dataDuck.AbstractText.trim().length > 0) {
      atualizarRespostaComImagem(
        `<h3>🔎 Resultado DuckDuckGo:</h3><p>${escaparHtml(dataDuck.AbstractText)}</p>`,
        dataDuck.Image || `https://source.unsplash.com/600x400/?${encodeURIComponent(termoPesquisa)}`,
        termoPesquisa
      );
      buscandoResposta = false;
      return;
    }

    const urlWiki = `${URL_WIKIPEDIA}${encodeURIComponent(termoPesquisa)}`;
    const resWiki = await fetchComTimeout(urlWiki);
    if (!resWiki.ok) throw new Error("Wikipedia não respondeu");

    const dataWiki = await resWiki.json();

    if (dataWiki.extract && dataWiki.extract.trim().length > 0) {
      atualizarRespostaComImagem(
        `<h3>📚 Resultado Wikipedia:</h3><h4>${escaparHtml(dataWiki.title)}</h4><p>${escaparHtml(dataWiki.extract)}</p>`,
        dataWiki.thumbnail?.source || `https://source.unsplash.com/600x400/?${encodeURIComponent(termoPesquisa)}`,
        dataWiki.title || termoPesquisa
      );
      buscandoResposta = false;
      return;
    }

    atualizarRespostaTexto(`<p>⚠️ Não encontrei uma resposta satisfatória para "<strong>${escaparHtml(termoPesquisa)}</strong>". Tente reformular a pergunta.</p>`);
    buscandoResposta = false;
  } catch (error) {
    mostrarErro(`Erro ao buscar na web: ${error.message}. Tente perguntas mais simples.`);
    buscandoResposta = false;
  }
}

document.querySelector("button").addEventListener("click", buscarResposta);
document.getElementById("pergunta").addEventListener("keydown", function(e) {
  if(e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    buscarResposta();
  }
});

window.onload = () => {
  mostrarMensagemInicial();
  document.getElementById("pergunta").focus();
};
