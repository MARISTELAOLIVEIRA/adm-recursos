/*
  interativos.js: os simuladores das aulas de ARC (só deste site, não copie para os outros).
  versão 7 · 2026-11-05 · Todos com ANALOGIA DO DIA A DIA, cores e animação (pedido da Stela: "os alunos aprendem
  melhor quando associam as coisas"). Cenas comuns em cenaVR (cards com o nome técnico e a analogia, envelope ou
  balão voando, carimbos, estrelinhas):
  aula 5, DORA = chegar num hotel (recepção, quarto, chave, recepção falsa);
  aula 6, contas = prédio (crachás, salas, armários, chave mestra);
  aula 7, chmod = o chaveiro (chaves de olhar, mexer e usar; porta escancarada);
  aula 10, e-mail = carta (agência, guia de CEPs, lacre, porteiro);
  aula 11, servidor de e-mail = Correios (agência, portaria, rastreamento).

  Tudo funciona no teclado. Com as animações pausadas, as mensagens chegam na hora, sem o voo.
*/

(function () {
  "use strict";

  var raiz = document.documentElement;
  var NS = "http://www.w3.org/2000/svg";

  // as quatro mensagens, na ordem certa
  var MENSAGENS = [
    { nome: "Descoberta", ingles: "Discover" },
    { nome: "Oferta", ingles: "Offer" },
    { nome: "Pedido", ingles: "Request" },
    { nome: "Confirmação", ingles: "Ack" }
  ];

  // dica para quem erra, conforme a mensagem que deveria vir agora
  var DICAS = [
    "Quem começa é o notebook: ele ainda nem sabe se existe um servidor na rede.",
    "O notebook já perguntou. Agora alguém precisa responder.",
    "A oferta chegou. Agora o notebook escolhe e pede.",
    "O pedido foi feito. Falta o servidor confirmar."
  ];

  // as duas redes: a da escola e a do roteador doméstico do estudo de caso
  var REDES = {
    escola: {
      quem: "o servidor DHCP da escola",
      servidor: "10.10.5.10",
      base: "10.10.5.",
      primeiro: 20,
      gateway: "10.10.5.1",
      dns: "10.10.5.10",
      prazo: "8 horas",
      trilha: "srv",
      pulso: "do-servidor"
    },
    intruso: {
      quem: "o roteador doméstico",
      servidor: "192.168.1.1",
      base: "192.168.1.",
      primeiro: 100,
      gateway: "192.168.1.1",
      dns: "192.168.1.1",
      prazo: "24 horas",
      trilha: "rot",
      pulso: "do-intruso"
    }
  };

  function pausado() {
    return raiz.classList.contains("pausado");
  }

  // espera um tempo (nenhum, com as animações pausadas)
  function espera(ms) {
    return new Promise(function (ok) {
      setTimeout(ok, pausado() ? 0 : ms);
    });
  }

  // embaralha uma lista (Fisher-Yates)
  function embaralha(lista) {
    for (var i = lista.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var troca = lista[i];
      lista[i] = lista[j];
      lista[j] = troca;
    }
    return lista;
  }

  /* =====================================================================
     Cenas "na vida real" (aulas 5, 10 e 11): cada peça é um card colorido
     com o nome técnico e a analogia, ligado por trilhas. Um envelope ou um
     balão de fala voa pelas trilhas. No celular, o desenho fica em pé.
     ===================================================================== */

  // o envelope (ou balão) voando por um caminho do SVG (volta = do fim para o começo)
  function voaEnvelope(camada, caminho, tipo, volta, rotulo, emoji) {
    if (pausado() || document.hidden) return Promise.resolve();
    var total = caminho.getTotalLength();
    var g = document.createElementNS(NS, "g");
    var largura = rotulo ? rotulo.length * 7.4 + 20 : 0;
    g.setAttribute("class", "vr-envelope " + tipo);
    g.innerHTML = '<circle r="15"></circle><text class="vr-env">' + (emoji || "✉️") + "</text>" +
      (rotulo ? '<g class="vr-balao"><rect x="' + (-largura / 2) + '" y="-48" width="' + largura + '" height="24" rx="12"/>' +
        '<text y="-31">' + rotulo + "</text></g>" : "");
    camada.appendChild(g);
    var icone = g.querySelector(".vr-env");
    return new Promise(function (ok) {
      var inicio = null;
      var acabou = false;
      var ms = Math.max(700, total * 7);
      var reserva = setTimeout(termina, ms + 500);
      function termina() {
        if (acabou) return;
        acabou = true;
        clearTimeout(reserva);
        g.remove();
        ok();
      }
      function passo(agora) {
        if (acabou) return;
        if (inicio === null) inicio = agora;
        var p = pausado() ? 1 : Math.min((agora - inicio) / ms, 1);
        var suave = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        var ponto = caminho.getPointAtLength((volta ? 1 - suave : suave) * total);
        g.setAttribute("transform", "translate(" + ponto.x + " " + ponto.y + ")");
        // o envelope balança um pouco enquanto voa
        icone.setAttribute("transform", "rotate(" + (Math.sin(p * Math.PI * 4) * 10) + ")");
        if (p < 1) requestAnimationFrame(passo);
        else termina();
      }
      requestAnimationFrame(passo);
    });
  }

  // chuva de estrelinhas por cima de um elemento (missão cumprida)
  function festa(palco, enfeites) {
    if (pausado()) return;
    var f = document.createElement("div");
    f.className = "vr-festa";
    f.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 16; i++) {
      var s = document.createElement("span");
      s.textContent = (enfeites || ["✨", "🎉", "⭐", "💚"])[i % 4];
      s.style.setProperty("--x", (Math.random() * 100) + "%");
      s.style.setProperty("--d", (Math.random() * .4) + "s");
      s.style.setProperty("--g", (Math.random() * 60 - 30) + "deg");
      f.appendChild(s);
    }
    palco.appendChild(f);
    setTimeout(function () {
      f.remove();
    }, 1900);
  }

  // monta a cena: desenhos = {largo, estreito}; pecas = {nome: {emoji, nome, vida, cor, extra}}
  function cenaVR(palco, desenhos, pecas) {
    var celular = window.matchMedia("(max-width: 600px)");
    var api = { aoRedesenhar: null };

    function desenha() {
      var d = desenhos[celular.matches ? "estreito" : "largo"];
      var html = '<svg class="vr-cena" viewBox="' + d.viewBox + '" aria-hidden="true"><g class="vr-trilhas">';
      Object.keys(d.trilhas).forEach(function (t) {
        html += '<path data-trilha="' + t + '" d="' + d.trilhas[t] + '"/>';
      });
      html += '</g><g class="vr-fluxos">';
      Object.keys(d.trilhas).forEach(function (t) {
        html += '<path class="vr-fluxo-' + t + '" d="' + d.trilhas[t] + '"/>';
      });
      html += "</g>";
      Object.keys(d.pecas).forEach(function (nome) {
        var p = d.pecas[nome];
        var peca = pecas[nome];
        var w = p[2];
        var h = p[3];
        var pequena = h < 90;
        html += '<g class="vr-no vr-' + peca.cor + '" data-no="' + nome + '" transform="translate(' + p[0] + " " + p[1] + ')">' +
          '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="14"/>' +
          '<text class="vr-emoji" y="' + (pequena ? -17 : -22) + '">' + peca.emoji + "</text>" +
          '<text class="vr-nome" y="' + (pequena ? 15 : 20) + '">' + peca.nome + "</text>" +
          '<text class="vr-vida" y="' + (pequena ? 31 : 38) + '">' + peca.vida + "</text>" +
          (peca.extra || "") + '<text class="vr-carimbo" y="4"></text></g>';
      });
      html += '<g class="vr-voo"></g></svg>';
      palco.innerHTML = html;
      api.svg = palco.querySelector("svg");
      api.camada = api.svg.querySelector(".vr-voo");
      if (api.aoRedesenhar) api.aoRedesenhar();
    }

    api.no = function (nome) {
      return api.svg.querySelector('[data-no="' + nome + '"]');
    };

    api.fluxo = function (trilha) {
      return api.svg.querySelector(".vr-fluxo-" + trilha);
    };

    // troca o ícone, o nome ou a analogia de uma peça
    api.texto = function (nome, parte, valor) {
      api.no(nome).querySelector(".vr-" + parte).textContent = valor;
    };

    api.voa = function (trilha, tipo, volta, rotulo, emoji) {
      return voaEnvelope(api.camada, api.svg.querySelector('[data-trilha="' + trilha + '"]'), tipo, volta, rotulo, emoji);
    };

    // a peça brilha quando a mensagem chega
    api.acende = function (nome) {
      var no = api.no(nome);
      no.classList.remove("pisca");
      requestAnimationFrame(function () {
        no.classList.add("pisca");
      });
    };

    // carimbo: aparece e some; fixo = fica lá (FECHADO); tipo "bom" = verde
    api.carimba = function (nome, texto, tipo, fixo) {
      var c = api.no(nome).querySelector(".vr-carimbo");
      c.textContent = texto;
      c.setAttribute("class", "vr-carimbo" + (tipo ? " " + tipo : "") + (fixo ? " fixo" : ""));
      if (!fixo) {
        requestAnimationFrame(function () {
          c.classList.add("carimba");
        });
        // depois de carimbar, o carimbo some (para não voltar a piscar ao ligar as animações)
        clearTimeout(c.saida);
        c.saida = setTimeout(function () {
          c.classList.remove("carimba");
        }, 2600);
      }
    };

    api.tiraCarimbo = function (nome) {
      api.no(nome).querySelector(".vr-carimbo").setAttribute("class", "vr-carimbo");
    };

    celular.addEventListener("change", desenha);
    desenha();
    return api;
  }

  /* =====================================================================
     DORA do DHCP (aula 5): chegar num hotel. O notebook é o hóspede, o
     switch é o saguão (todo mundo ouve), o servidor DHCP é a recepção e o
     IP é o número do quarto. O roteador doméstico é uma recepção falsa.
     ===================================================================== */

  var HOTEL_PECAS = {
    cli: { emoji: "🧳", nome: "Notebook", vida: "o hóspede chegando", cor: "verde" },
    "switch": { emoji: "🛋️", nome: "Switch", vida: "o saguão: todos ouvem", cor: "roxo" },
    srv: { emoji: "🛎️", nome: "Servidor DHCP", vida: "a recepção do hotel", cor: "azul" },
    rot: { emoji: "🏴‍☠️", nome: "Roteador doméstico", vida: "uma recepção falsa", cor: "laranja" }
  };

  var HOTEL_DESENHOS = {
    largo: {
      viewBox: "0 0 680 300",
      pecas: { cli: [90, 90, 150, 100], "switch": [340, 90, 150, 100], srv: [590, 90, 150, 100], rot: [590, 238, 150, 100] },
      trilhas: { cli: "M165 90 H265", srv: "M415 90 H515", rot: "M340 140 V238 H515" }
    },
    estreito: {
      viewBox: "0 0 340 470",
      pecas: { cli: [170, 60, 170, 100], "switch": [170, 200, 170, 100], srv: [85, 352, 150, 100], rot: [255, 352, 150, 100] },
      trilhas: { cli: "M170 110 V150", srv: "M120 250 V302", rot: "M220 250 V302" }
    }
  };

  document.querySelectorAll("[data-dora]").forEach(montaDora);

  function montaDora(caixa) {
    var palco = caixa.querySelector(".vr-palco");
    var botoes = caixa.querySelector(".dora-botoes");
    var letras = caixa.querySelectorAll(".dora-letras li");
    var retorno = caixa.querySelector(".dora-retorno");
    var pacote = caixa.querySelector(".dora-pacote");
    var ficha = caixa.querySelector(".dora-ficha");
    var chave = caixa.querySelector(".dora-chave input");
    var placar = caixa.querySelector(".dora-placar");
    var textoInicial = pacote.innerHTML;
    var fichaInicial = ficha.innerHTML;
    var pontos = { escola: 0, intruso: 0 };
    var estado;
    var vr = cenaVR(palco, HOTEL_DESENHOS, HOTEL_PECAS);
    var TIPOS = { "do-cliente": "ok", "do-servidor": "servidor", "do-intruso": "erro" };

    // ao redesenhar (computador <-> celular), volta o estado da recepção falsa e do hóspede
    vr.aoRedesenhar = function () {
      if (!estado) return;
      var ligado = estado.intruso;
      vr.no("rot").classList.toggle("apagado", !ligado);
      vr.fluxo("rot").classList.toggle("apagado", !ligado);
      vr.svg.querySelector('.vr-trilhas [data-trilha="rot"]').classList.toggle("apagado", !ligado);
      vr.no("cli").classList.toggle("cheia", estado.passo === 4);
      vr.texto("cli", "vida", estado.quarto || "o hóspede chegando");
    };

    // a mensagem voa como um balão de fala
    function viajar(nome, classe, volta, fala) {
      return vr.voa(nome, TIPOS[classe], volta, fala, "💬");
    }

    function pisca(nome) {
      vr.acende(nome);
    }

    // o número do quarto é o final do IP
    function quarto() {
      return estado.ip.split(".")[3];
    }

    function conta(html) {
      pacote.innerHTML = html;
    }

    // ---------- os quatro passos ----------
    var PASSOS = [
      // 1. Descoberta: o hóspede pergunta em voz alta no saguão
      function () {
        conta('<p><b>1 · Descoberta</b> <small>(DHCP Discover)</small></p>' +
          '<p class="dora-rota">De <code>0.0.0.0:68</code> para <code>255.255.255.255:67</code>: todo mundo da rede.</p>' +
          '<p>"Alguém aí me dá um endereço?" O notebook ainda não tem IP, então manda para todos: é um <strong>broadcast</strong>.</p>' +
          '<p class="na-vida">🏨 Na vida real: o hóspede chega e pergunta em voz alta no saguão: "tem quarto?". Todo mundo ouve.</p>');
        return viajar("cli", "do-cliente", false, "Tem quarto?").then(function () {
          pisca("switch");
          var idas = [viajar("srv", "do-cliente", false, "Tem quarto?")];
          if (estado.intruso) idas.push(viajar("rot", "do-cliente", false, "Tem quarto?"));
          return Promise.all(idas);
        }).then(function () {
          pisca("srv");
          if (estado.intruso) {
            pisca("rot");
            conta(pacote.innerHTML + '<p>O switch espalha a pergunta por todas as portas. Desta vez, <strong>dois</strong> aparelhos ouviram: a recepção de verdade e a falsa.</p>');
          }
        });
      },

      // 2. Oferta: quem tem quarto responde (com o intruso, chegam duas ofertas)
      function () {
        var ofertas = [corrida("escola", 0)];
        if (estado.intruso) {
          // quem venceu foi sorteado no preparaOferta; o outro sai 0,45 s depois
          ofertas = [
            corrida("escola", estado.vencedor === "escola" ? 0 : 450),
            corrida("intruso", estado.vencedor === "intruso" ? 0 : 450)
          ];
        }
        var rede = REDES[estado.vencedor];
        conta('<p><b>2 · Oferta</b> <small>(DHCP Offer)</small></p>' +
          '<p class="dora-rota">De <code>' + rede.servidor + ':67</code> para o notebook (porta <code>68</code>).</p>' +
          '<p>"Tenho o <code>' + estado.ip + '</code> para você, com máscara, gateway e DNS."</p>' +
          '<p class="na-vida">🏨 Na vida real: "temos o quarto ' + quarto() + '!". O IP é o número do quarto.</p>');
        return Promise.all(ofertas).then(function () {
          if (estado.intruso) {
            conta(pacote.innerHTML + '<p>Chegaram <strong>duas ofertas</strong>! A de ' + rede.quem +
              ' chegou primeiro, e o notebook fica com a primeira que chega. Como o hóspede apressado: aceita o primeiro quarto que oferecem.</p>');
          }
        });
      },

      // 3. Pedido: o hóspede aceita, de novo em voz alta
      function () {
        var rede = REDES[estado.vencedor];
        conta('<p><b>3 · Pedido</b> <small>(DHCP Request)</small></p>' +
          '<p class="dora-rota">De <code>0.0.0.0:68</code> para <code>255.255.255.255:67</code>: broadcast de novo.</p>' +
          '<p>"Quero o <code>' + estado.ip + '</code> que o <code>' + rede.servidor + '</code> me ofereceu." ' +
          'Vai para todos de propósito: assim, quem também ofereceu fica sabendo que perdeu.</p>' +
          '<p class="na-vida">🏨 Na vida real: "quero o ' + quarto() + '!", em voz alta, para a outra recepção saber que não precisa mais guardar quarto.</p>');
        var fala = "Quero o " + quarto() + "!";
        return viajar("cli", "do-cliente", false, fala).then(function () {
          pisca("switch");
          var idas = [viajar("srv", "do-cliente", false, fala)];
          if (estado.intruso) idas.push(viajar("rot", "do-cliente", false, fala));
          return Promise.all(idas);
        }).then(function () {
          pisca("srv");
          if (estado.intruso) pisca("rot");
        });
      },

      // 4. Confirmação: a recepção entrega a chave
      function () {
        var rede = REDES[estado.vencedor];
        conta('<p><b>4 · Confirmação</b> <small>(DHCP Ack)</small></p>' +
          '<p class="dora-rota">De <code>' + rede.servidor + ':67</code> para o notebook (porta <code>68</code>).</p>' +
          '<p>"Confirmado: o <code>' + estado.ip + '</code> é seu por ' + rede.prazo + '." É o <strong>empréstimo</strong>: perto do fim do prazo, o notebook pede para renovar.</p>' +
          '<p class="na-vida">🏨 Na vida real: a recepção entrega a chave 🔑. O empréstimo é a diária: perto de acabar, o hóspede renova.</p>');
        return viajar(rede.trilha, rede.pulso, true, "É seu! 🔑").then(function () {
          pisca("switch");
          return viajar("cli", rede.pulso, true, "É seu! 🔑");
        }).then(function () {
          pisca("cli");
        });
      }
    ];

    // a oferta de uma recepção: até o hóspede, saindo depois de um atraso
    function corrida(qual, atraso) {
      var rede = REDES[qual];
      var fala = "Temos o " + (qual === estado.vencedor ? quarto() : (qual === "escola" ? "23" : "117")) + "!";
      return espera(atraso).then(function () {
        return viajar(rede.trilha, rede.pulso, true, fala);
      }).then(function () {
        pisca("switch");
        return viajar("cli", rede.pulso, true, fala);
      }).then(function () {
        pisca("cli");
      });
    }

    // ---------- rodada nova: botões embaralhados, notebook sem endereço ----------
    function recomeca() {
      var intruso = chave.checked;
      estado = {
        rodada: estado ? estado.rodada + 1 : 1,
        passo: 0,
        erros: 0,
        ocupado: false,
        auto: false,
        intruso: intruso,
        vencedor: "escola",
        ip: "",
        quarto: ""
      };
      caixa.classList.toggle("com-intruso", intruso);
      placar.hidden = !intruso;
      vr.tiraCarimbo("cli");
      vr.aoRedesenhar();
      letras.forEach(function (li) {
        li.classList.remove("feito");
      });
      falas("Temos o …!", "Quero o …!");
      pacote.innerHTML = textoInicial;
      ficha.innerHTML = fichaInicial;
      retorno.textContent = "";
      retorno.className = "dora-retorno";
      botoes.innerHTML = "";
      embaralha([0, 1, 2, 3]).forEach(function (i) {
        var b = document.createElement("button");
        b.type = "button";
        b.dataset.passo = i;
        b.innerHTML = MENSAGENS[i].nome + " <small>" + MENSAGENS[i].ingles + "</small>";
        b.addEventListener("click", function () {
          escolhe(i, b);
        });
        botoes.appendChild(b);
      });
    }

    // sorteia o próximo endereço livre da rede que venceu (a escolha é feita na oferta)
    function sorteiaIp() {
      var rede = REDES[estado.vencedor];
      estado.ip = rede.base + (rede.primeiro + Math.floor(Math.random() * 40));
    }

    // ---------- o aluno escolheu uma mensagem ----------
    function escolhe(i, botao) {
      if (estado.ocupado || estado.auto || estado.passo > 3) return;
      if (i !== estado.passo) {
        estado.erros++;
        retorno.className = "dora-retorno errado";
        retorno.textContent = "Curto-circuito. " + DICAS[estado.passo];
        botao.classList.remove("errou");
        requestAnimationFrame(function () {
          botao.classList.add("errou");
        });
        return;
      }
      botoes.querySelectorAll(".errou").forEach(function (b) {
        b.classList.remove("errou");
      });
      botao.classList.add("feito");
      retorno.className = "dora-retorno certo";
      retorno.textContent = "Isso! " + MENSAGENS[i].nome + " (" + MENSAGENS[i].ingles + ") na trilha.";
      executa(i);
    }

    // roda um passo e, no fim, avança (se a rodada não foi trocada no meio)
    function executa(i) {
      var rodada = estado.rodada;
      estado.ocupado = true;
      caixa.setAttribute("aria-busy", "true");
      if (i === 1) preparaOferta();
      return PASSOS[i]().then(function () {
        if (rodada !== estado.rodada) return;
        letras[i].classList.add("feito");
        estado.passo = i + 1;
        estado.ocupado = false;
        caixa.removeAttribute("aria-busy");
        if (estado.passo === 4) fim();
      });
    }

    // antes da oferta: com o intruso, o sorteio de quem chega primeiro; depois, o endereço
    function preparaOferta() {
      estado.vencedor = estado.intruso && Math.random() < .5 ? "intruso" : "escola";
      sorteiaIp();
      falas("Temos o " + quarto() + "!", "Quero o " + quarto() + "!");
    }

    // as falas embaixo das letras O e R mostram o quarto da rodada
    function falas(oferta, pedido) {
      letras[1].querySelector("span").textContent = '"' + oferta + '"';
      letras[2].querySelector("span").textContent = '"' + pedido + '"';
    }

    // ---------- fim da rodada: preenche a ficha do notebook ----------
    function fim() {
      var qual = estado.vencedor;
      var rede = REDES[qual];
      var bom = qual === "escola";
      if (estado.intruso && !estado.auto) pontos[qual]++;
      estado.quarto = "🔑 quarto " + quarto();
      vr.aoRedesenhar();
      vr.carimba("cli", bom ? "HOSPEDADO" : "SEM SAÍDA", bom ? "bom" : "");
      if (bom && !estado.auto) festa(palco, ["🔑", "✨", "🛎️", "⭐"]);
      // a ficha do hóspede: cada campo com o seu papel no hotel
      var campo = function (nome, vida, valor) {
        return "<dt>" + nome + " <small>" + vida + "</small></dt><dd>" + valor + "</dd>";
      };
      ficha.innerHTML = '<p><b>🪪 Ficha do hóspede</b></p><dl>' +
        campo("Endereço IP", "o número do quarto", estado.ip) +
        campo("Máscara", "o tamanho do hotel", "255.255.255.0") +
        campo("Gateway", "a porta da rua", rede.gateway) +
        campo("DNS", "o guia da cidade", rede.dns) +
        campo("Empréstimo", "a diária", rede.prazo) +
        campo("Quem deu", "a recepção", rede.servidor) + "</dl>" +
        '<p class="dora-status ' + (bom ? "ok" : "ruim") + '">' +
        (bom ? "✓ Na rede da escola, com internet: a porta da rua leva para o mundo." : "✗ Sem internet: a recepção falsa deu um quarto num hotel sem porta para a rua.") + "</p>";
      if (estado.auto) {
        retorno.className = "dora-retorno";
        retorno.textContent = "Essa foi a demonstração. Agora é a sua vez: aperte Recomeçar.";
      } else if (bom) {
        retorno.className = "dora-retorno certo";
        retorno.textContent = (estado.erros === 0 ? "Compilou de primeira! " : "Trilha fechada! ") + "O notebook está na rede.";
      } else {
        retorno.className = "dora-retorno errado";
        retorno.textContent = "O notebook pegou o endereço do roteador doméstico. Recomece algumas vezes: quem responde primeiro?";
      }
      placar.textContent = "Rodadas com o roteador ligado: " + pontos.escola + " na rede da escola · " +
        pontos.intruso + " no roteador doméstico.";
    }

    // ---------- botões do rodapé ----------
    caixa.querySelector("[data-dora-recomecar]").addEventListener("click", recomeca);

    // mostra a sequência certa sozinho, para quem travou
    caixa.querySelector("[data-dora-ver]").addEventListener("click", function () {
      recomeca();
      var rodada = estado.rodada;
      estado.auto = true;
      retorno.className = "dora-retorno";
      retorno.textContent = "Olha a sequência certa: D, O, R, A.";
      var fila = Promise.resolve();
      [0, 1, 2, 3].forEach(function (i) {
        fila = fila.then(function () {
          if (rodada !== estado.rodada) return;
          botoes.querySelector('[data-passo="' + i + '"]').classList.add("feito");
          return executa(i).then(function () {
            return espera(600);
          });
        });
      });
    });

    chave.addEventListener("change", recomeca);
    recomeca();
  }


  /* =====================================================================
     Terminal das contas (aula 6): um Linux de mentirinha, só com o que a
     aula usa. O aluno digita o comando, o quadro e os arquivos mudam.
     ===================================================================== */

  // nome válido de usuário ou grupo no Linux: minúsculas, números, _ e -, sem acento
  var NOME_VALIDO = /^[a-z_][a-z0-9_-]{0,31}$/;

  // escapa o texto digitado antes de pôr na tela
  function limpa(texto) {
    return String(texto).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  document.querySelectorAll("[data-contas]").forEach(montaContas);

  function montaContas(caixa) {
    var saida = caixa.querySelector(".contas-saida");
    var entrada = caixa.querySelector(".contas-linha input");
    var quadro = caixa.querySelector(".contas-quadro");
    var arquivo = caixa.querySelector(".contas-arquivo code");
    var abas = caixa.querySelectorAll(".contas-abas button");
    var missoes = caixa.querySelectorAll(".contas-missoes li");
    var placar = caixa.querySelector(".contas-placar");
    var PS = "stela@ponto-certo:~$";
    var sistema;
    var historico = [];
    var posicao = 0;
    var abaAtual = "/etc/passwd";
    var linhasAntes = {};
    var fichasAntes = {};
    var conferiuId = false;

    // ---------- o servidor no começo: a Stela (administradora) e o estagiário ----------
    function sistemaNovo() {
      return {
        usuarios: [
          { nome: "stela", uid: 1000, gid: 1000, shell: "/bin/bash", senha: true },
          { nome: "estagiario", uid: 1001, gid: 1001, shell: "/bin/bash", senha: true }
        ],
        grupos: [
          { nome: "sudo", gid: 27, membros: ["stela"], privado: false },
          { nome: "stela", gid: 1000, membros: [], privado: true },
          { nome: "estagiario", gid: 1001, membros: [], privado: true }
        ],
        pastas: ["stela", "estagiario"]
      };
    }

    function usuario(nome) {
      return sistema.usuarios.find(function (u) {
        return u.nome === nome;
      });
    }

    function grupo(nome) {
      return sistema.grupos.find(function (g) {
        return g.nome === nome;
      });
    }

    function grupoPorGid(gid) {
      return sistema.grupos.find(function (g) {
        return g.gid === gid;
      });
    }

    // o próximo número livre (UID ou GID), a partir de 1000
    function proximo(lista, campo) {
      return lista.reduce(function (maior, item) {
        return item[campo] >= 1000 && item[campo] >= maior ? item[campo] + 1 : maior;
      }, 1000);
    }

    // os grupos de um usuário: o primário (o dele) e os extras
    function gruposDe(u) {
      var lista = [grupoPorGid(u.gid)];
      sistema.grupos.forEach(function (g) {
        if (g.membros.indexOf(u.nome) >= 0 && lista.indexOf(g) < 0) lista.push(g);
      });
      return lista.filter(Boolean);
    }

    // ---------- escrever no terminal ----------
    function escreve(texto, classe) {
      var linha = document.createElement("div");
      if (classe) linha.className = classe;
      linha.innerHTML = texto;
      saida.appendChild(linha);
      saida.scrollTop = saida.scrollHeight;
    }

    function erro(texto) {
      escreve(limpa(texto), "t-erro");
    }

    function dica(texto) {
      escreve("# dica: " + texto, "t-dica");
    }

    // a tradução para a vida real: o prédio da empresa, com crachás, salas e armários
    function vida(texto) {
      escreve("📦 " + texto, "t-vida");
    }

    // ---------- os comandos ----------
    var COMANDOS = {
      groupadd: function (args) {
        var nome = args.filter(function (a) { return a[0] !== "-"; })[0];
        if (!nome) return erro("groupadd: falta o nome do grupo");
        if (!NOME_VALIDO.test(nome)) {
          erro("groupadd: '" + nome + "' não é um nome de grupo válido");
          return dica("o Linux não aceita acento, espaço nem maiúscula. Tente sem o acento.");
        }
        if (grupo(nome)) return erro("groupadd: o grupo '" + nome + "' já existe");
        sistema.grupos.push({ nome: nome, gid: proximo(sistema.grupos, "gid"), membros: [], privado: false });
        vida("🚪 Nova sala no prédio: " + nome + ". Por enquanto, vazia.");
        return true;
      },

      useradd: function (args) {
        var comPasta = false;
        var extras = [];
        var nome = null;
        for (var i = 0; i < args.length; i++) {
          if (args[i] === "-m") comPasta = true;
          else if (args[i] === "-G") extras = (args[++i] || "").split(",").filter(Boolean);
          else if (args[i] === "-s") i++;
          else if (args[i][0] !== "-") nome = args[i];
        }
        if (!nome) return erro("useradd: falta o nome do usuário");
        if (!NOME_VALIDO.test(nome)) return erro("useradd: nome de usuário inválido '" + nome + "'");
        if (usuario(nome)) return erro("useradd: o usuário '" + nome + "' já existe");
        var falta = extras.filter(function (g) { return !grupo(g); })[0];
        if (falta) {
          erro("useradd: o grupo '" + falta + "' não existe");
          return dica("crie o grupo antes: sudo groupadd " + falta);
        }
        // como no Ubuntu: cada usuário ganha um grupo com o próprio nome (o primário)
        var gid = proximo(sistema.grupos, "gid");
        var uid = proximo(sistema.usuarios, "uid");
        sistema.grupos.push({ nome: nome, gid: gid, membros: [], privado: true });
        sistema.usuarios.push({ nome: nome, uid: uid, gid: gid, shell: "/bin/sh", senha: false });
        vida("🪪 Crachá nº " + uid + " feito para " + nome + (extras.length ? ", que abre a sala " + extras.join(" e ") : "") +
          (comPasta ? ", e um armário pessoal 🗄️." : ". Sem armário: faltou o -m."));
        extras.forEach(function (g) {
          grupo(g).membros.push(nome);
        });
        if (comPasta) {
          sistema.pastas.push(nome);
        } else {
          dica("sem o -m, " + nome + " ficou sem pasta em /home. Apague (sudo userdel " + nome + ") e crie de novo com -m.");
        }
        return true;
      },

      usermod: function (args) {
        var acrescenta = false;
        var lista = null;
        var nome = null;
        for (var i = 0; i < args.length; i++) {
          if (args[i] === "-aG" || args[i] === "-Ga") {
            acrescenta = true;
            lista = args[++i];
          } else if (args[i] === "-a") acrescenta = true;
          else if (args[i] === "-G") lista = args[++i];
          else if (args[i][0] !== "-") nome = args[i];
        }
        if (!nome || !lista) return erro("uso: usermod -aG grupo usuário");
        var u = usuario(nome);
        if (!u) return erro("usermod: o usuário '" + nome + "' não existe");
        var novos = lista.split(",").filter(Boolean);
        var falta = novos.filter(function (g) { return !grupo(g); })[0];
        if (falta) return erro("usermod: o grupo '" + falta + "' não existe");
        var saiu = [];
        if (!acrescenta) {
          // sem o -a, o -G troca a lista inteira: o usuário sai dos grupos que não estão nela
          sistema.grupos.forEach(function (g) {
            var p = g.membros.indexOf(nome);
            if (p >= 0 && novos.indexOf(g.nome) < 0) {
              g.membros.splice(p, 1);
              saiu.push(g.nome);
            }
          });
        }
        novos.forEach(function (g) {
          if (grupo(g).membros.indexOf(nome) < 0 && grupoPorGid(u.gid).nome !== g) grupo(g).membros.push(nome);
        });
        if (saiu.length) {
          dica("sem o -a, " + nome + " SAIU de: " + saiu.join(", ") + ". O -a quer dizer \"acrescentar\".");
          vida("⚠️ Crachá reprogramado do zero: agora só abre " + novos.join(", ") + ". Perdeu o acesso a " + saiu.join(", ") + "!");
        } else {
          vida("🚪 O crachá de " + nome + " agora abre também a sala " + novos.join(" e ") + ".");
        }
        return true;
      },

      gpasswd: function (args) {
        if (args[0] !== "-d" || args.length < 3) return erro("uso: gpasswd -d usuário grupo");
        var g = grupo(args[2]);
        if (!g) return erro("gpasswd: o grupo '" + args[2] + "' não existe");
        var p = g.membros.indexOf(args[1]);
        if (p < 0) return erro("gpasswd: o usuário '" + args[1] + "' não é membro de '" + args[2] + "'");
        g.membros.splice(p, 1);
        escreve(limpa("Removendo o usuário " + args[1] + " do grupo " + args[2]));
        vida("🚪 O crachá de " + args[1] + " não abre mais a sala " + args[2] + ".");
        return true;
      },

      userdel: function (args) {
        var apagaPasta = args.indexOf("-r") >= 0;
        var nome = args.filter(function (a) { return a[0] !== "-"; })[0];
        if (!nome) return erro("userdel: falta o nome do usuário");
        var u = usuario(nome);
        if (!u) return erro("userdel: o usuário '" + nome + "' não existe");
        if (nome === "stela") return erro("userdel: aqui no simulador a conta da professora não sai, combinado? 😉");
        sistema.usuarios.splice(sistema.usuarios.indexOf(u), 1);
        sistema.grupos.forEach(function (g) {
          var p = g.membros.indexOf(nome);
          if (p >= 0) g.membros.splice(p, 1);
        });
        var primario = grupoPorGid(u.gid);
        if (primario && primario.privado) sistema.grupos.splice(sistema.grupos.indexOf(primario), 1);
        if (apagaPasta) {
          sistema.pastas = sistema.pastas.filter(function (p) { return p !== nome; });
          vida("✂️ Crachá de " + nome + " cancelado e armário esvaziado.");
        } else if (sistema.pastas.indexOf(nome) >= 0) {
          dica("a conta saiu, mas a pasta /home/" + nome + " ficou para trás, sem dono. O -r apaga a pasta junto. Para apagar agora: sudo rm -r /home/" + nome);
          vida("✂️ Crachá cancelado, mas o armário de " + nome + " ficou lá, cheio e sem dono.");
        } else {
          vida("✂️ Crachá de " + nome + " cancelado.");
        }
        return true;
      },

      groupdel: function (args) {
        var g = grupo(args[0]);
        if (!g) return erro("groupdel: o grupo '" + (args[0] || "") + "' não existe");
        var dono = sistema.usuarios.find(function (u) { return u.gid === g.gid; });
        if (dono) return erro("groupdel: não é possível remover o grupo primário do usuário '" + dono.nome + "'");
        sistema.grupos.splice(sistema.grupos.indexOf(g), 1);
        vida("🚪 Sala " + g.nome + " desativada.");
        return true;
      },

      passwd: function (args) {
        var u = usuario(args[0]);
        if (!args[0]) return erro("passwd: aqui no simulador, diga de quem é a senha: sudo passwd ana");
        if (!u) return erro("passwd: o usuário '" + args[0] + "' não existe");
        escreve("Nova senha: ••••••••");
        escreve("Redigite a nova senha: ••••••••");
        escreve("passwd: senha atualizada com sucesso");
        u.senha = true;
        vida("🔑 " + u.nome + " ganhou a senha do crachá. Ela fica embaralhada no cofre (/etc/shadow).");
        return true;
      },

      id: function (args) {
        var u = usuario(args[0] || "stela");
        if (!u) return erro("id: '" + args[0] + "': usuário inexistente");
        var gs = gruposDe(u);
        escreve(limpa("uid=" + u.uid + "(" + u.nome + ") gid=" + u.gid + "(" + gs[0].nome + ") grupos=" +
          gs.map(function (g) { return g.gid + "(" + g.nome + ")"; }).join(",")));
        if (u.nome === "ana") conferiuId = true;
        var salas = gs.filter(function (g) { return !g.privado; }).map(function (g) { return g.nome; });
        vida("🔎 A portaria consulta o crachá nº " + u.uid + (salas.length ? ": ele abre a sala " + salas.join(" e ") + "." : ": ele ainda não abre nenhuma sala."));
        return false;
      },

      groups: function (args) {
        var u = usuario(args[0] || "stela");
        if (!u) return erro("groups: '" + args[0] + "': usuário inexistente");
        escreve(limpa(u.nome + " : " + gruposDe(u).map(function (g) { return g.nome; }).join(" ")));
        return false;
      },

      cat: function (args, comSudo) {
        var nome = args[0];
        if (["/etc/passwd", "/etc/group", "/etc/shadow"].indexOf(nome) < 0) {
          return erro("cat: " + (nome || "") + ": arquivo não encontrado (aqui só tem /etc/passwd, /etc/group e /etc/shadow)");
        }
        if (nome === "/etc/shadow" && !comSudo) {
          erro("cat: /etc/shadow: Permissão negada");
          dica("as senhas embaralhadas só o root lê. Com sudo, você pode.");
          return vida("🔐 O cofre das senhas só abre com a chave mestra.");
        }
        conteudo(nome).forEach(function (l) {
          escreve(limpa(l));
        });
        mostraAba(nome);
        return false;
      },

      ls: function (args) {
        if (args[0] !== "/home") return erro("ls: aqui no simulador, olhe a pasta das pessoas: ls /home");
        escreve(limpa(sistema.pastas.join("  ")) || "(vazia)", "t-info");
        return false;
      },

      // só para apagar a pasta que ficou sem dono
      rm: function (args) {
        var alvo = args.filter(function (a) { return a[0] !== "-"; })[0] || "";
        var nome = alvo.replace(/^\/home\//, "").replace(/\/$/, "");
        if (args.indexOf("-r") < 0 || alvo.indexOf("/home/") !== 0) return erro("rm: aqui no simulador, só apagar pasta em /home: sudo rm -r /home/nome");
        if (sistema.pastas.indexOf(nome) < 0) return erro("rm: não foi possível remover '" + alvo + "': Arquivo ou diretório inexistente");
        if (usuario(nome)) return erro("rm: essa pasta ainda tem dono. Para tirar a pessoa, use: sudo userdel -r " + nome);
        sistema.pastas = sistema.pastas.filter(function (p) { return p !== nome; });
        vida("🗄️ O armário abandonado de " + nome + " foi esvaziado.");
        return true;
      },

      whoami: function () {
        escreve("stela");
        return false;
      },

      clear: function () {
        saida.innerHTML = "";
        return false;
      },

      ajuda: function () {
        escreve("Comandos deste simulador:", "t-info");
        escreve("  sudo groupadd grupo           sudo useradd -m -G grupo usuário");
        escreve("  sudo usermod -aG grupo usuário  sudo gpasswd -d usuário grupo");
        escreve("  sudo passwd usuário           sudo userdel -r usuário");
        escreve("  id usuário    groups usuário    ls /home    cat /etc/passwd    clear");
        return false;
      }
    };
    COMANDOS.help = COMANDOS.ajuda;
    COMANDOS.limpar = COMANDOS.clear;

    // quem mexe nas contas precisa de sudo
    var PRECISA_SUDO = ["groupadd", "useradd", "usermod", "gpasswd", "userdel", "groupdel", "passwd", "rm"];

    // ---------- rodar uma linha digitada ----------
    function roda(linha) {
      linha = linha.trim();
      escreve('<span class="ps">' + PS + "</span> " + limpa(linha), "t-eco");
      if (!linha) return;
      historico.push(linha);
      posicao = historico.length;
      var partes = linha.split(/\s+/);
      var comSudo = partes[0] === "sudo";
      if (comSudo) partes.shift();
      var nome = partes.shift();
      var comando = COMANDOS[nome];
      if (!comando) {
        erro(nome + ": comando não encontrado");
        return dica("digite ajuda para ver os comandos deste simulador.");
      }
      if (PRECISA_SUDO.indexOf(nome) >= 0 && !comSudo) {
        erro(nome + ": Permissão negada");
        dica("mexer nas contas é coisa de administrador: comece com sudo.");
        return vida("🚫 Só quem tem a chave mestra (sudo) mexe nos crachás e nas salas.");
      }
      var mudou = comando(partes, comSudo);
      if (mudou === true) {
        quadro.classList.remove("corre");
        requestAnimationFrame(function () {
          quadro.classList.add("corre");
        });
      }
      desenha();
    }

    // ---------- os arquivos, linha por linha ----------
    function conteudo(nome) {
      var hoje = Math.floor(Date.now() / 86400000);
      if (nome === "/etc/passwd") {
        return ["root:x:0:0:root:/root:/bin/bash"].concat(sistema.usuarios.map(function (u) {
          return u.nome + ":x:" + u.uid + ":" + u.gid + "::/home/" + u.nome + ":" + u.shell;
        }));
      }
      if (nome === "/etc/group") {
        return ["root:x:0:"].concat(sistema.grupos.slice().sort(function (a, b) {
          return a.gid - b.gid;
        }).map(function (g) {
          return g.nome + ":x:" + g.gid + ":" + g.membros.join(",");
        }));
      }
      return ["root:*:" + hoje + ":0:99999:7:::"].concat(sistema.usuarios.map(function (u) {
        return u.nome + ":" + (u.senha ? "$y$j9T$" + u.nome.split("").reverse().join("") + "Qx…" : "!") + ":" + hoje + ":0:99999:7:::";
      }));
    }

    // o que cada arquivo é, na vida real
    var LEGENDAS = {
      "/etc/passwd": "📋 A lista de crachás da portaria: nome, número do crachá (UID), sala principal (GID) e armário.",
      "/etc/group": "🚪 Quem entra em cada sala: o nome da sala, o número (GID) e a lista de crachás que abrem a porta.",
      "/etc/shadow": "🔐 O cofre das senhas: só o root abre. O ! quer dizer \"sem senha ainda\"."
    };

    function mostraAba(nome) {
      abaAtual = nome;
      caixa.querySelector(".contas-legenda").textContent = LEGENDAS[nome] + " Linha nova acende em verde.";
      abas.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.arquivo === nome));
      });
      desenhaArquivo();
    }

    // linha nova ou mudada aparece em verde
    function desenhaArquivo() {
      var linhas = conteudo(abaAtual);
      var antes = linhasAntes[abaAtual] || linhas;
      arquivo.innerHTML = linhas.map(function (l) {
        return antes.indexOf(l) < 0 ? '<span class="nova">' + limpa(l) + "</span>" : limpa(l);
      }).join("\n");
      linhasAntes[abaAtual] = linhas;
    }

    // ---------- o quadro: usuários, grupos e pastas ----------
    function ficha(chave, texto, extra, classe, icone) {
      var nova = fichasAntes.ok && !fichasAntes[chave];
      fichasAgora[chave] = true;
      return '<span class="contas-ficha' + (classe ? " " + classe : "") + (nova ? " chega" : "") + '"><i aria-hidden="true">' +
        (icone || limpa(texto[0])) + "</i>" + limpa(texto) + (extra ? " <small>" + limpa(extra) + "</small>" : "") + "</span>";
    }

    var CORES_SALAS = ["azul", "roxo", "laranja", "verde", "ouro"];

    var fichasAgora = {};

    function desenha() {
      fichasAgora = { ok: true };
      var usuarios = sistema.usuarios.map(function (u) {
        return ficha("u:" + u.nome, u.nome, "crachá nº " + u.uid, "cracha");
      }).join("");
      var grupos = sistema.grupos.filter(function (g) {
        return !g.privado;
      }).map(function (g, i) {
        var nova = fichasAntes.ok && !fichasAntes["g:" + g.nome];
        var mestra = g.nome === "sudo";
        fichasAgora["g:" + g.nome] = true;
        var membros = g.membros.map(function (m) {
          return ficha("m:" + g.nome + ":" + m, m);
        }).join("") || '<span class="contas-vazio">ninguém ainda</span>';
        return '<div class="contas-grupo vr-' + (mestra ? "ouro" : CORES_SALAS[i % CORES_SALAS.length]) + (nova ? " chega" : "") + '"><b>' +
          (mestra ? "🔑 " : "🚪 ") + limpa(g.nome) + " <small>" + (mestra ? "chave mestra · " : "sala · ") + "GID " + g.gid + "</small></b>" +
          '<div class="contas-fichas">' + membros + "</div></div>";
      }).join("");
      var pastas = sistema.pastas.map(function (p) {
        var orfa = !usuario(p);
        return ficha("p:" + p, p, orfa ? "abandonado" : "", "pasta" + (orfa ? " orfa" : ""), "🗄️");
      }).join("") || '<span class="contas-vazio">vazia</span>';
      quadro.querySelector("[data-usuarios]").innerHTML = usuarios;
      quadro.querySelector("[data-grupos]").innerHTML = grupos;
      quadro.querySelector("[data-pastas]").innerHTML = pastas;
      fichasAntes = fichasAgora;
      desenhaArquivo();
      confere();
    }

    // ---------- as missões do estudo de caso ----------
    function confere() {
      var ana = usuario("ana");
      var em = function (g) {
        return !!grupo(g) && grupo(g).membros.indexOf("ana") >= 0;
      };
      var feitas = [
        !!grupo("caixa") && !!grupo("estoque") && !!grupo("escritorio"),
        !!ana && em("caixa") && sistema.pastas.indexOf("ana") >= 0,
        !!ana && ana.senha,
        !!ana && em("caixa") && em("estoque"),
        !!ana && em("caixa") && em("estoque") && conferiuId,
        !usuario("estagiario") && sistema.pastas.indexOf("estagiario") < 0
      ];
      var total = 0;
      feitas.forEach(function (ok, i) {
        missoes[i].classList.toggle("feita", ok);
        if (ok) total++;
      });
      placar.classList.toggle("pronto", total === 6);
      placar.textContent = total === 6 ? "6 de 6: servidor organizado! A Ponto Certo agradece. 🎉" : total + " de 6 missões";
      // missão nova cumprida: estrelinhas no quadro
      if (totalAntes >= 0 && total > totalAntes) festa(quadro, ["🪪", "✨", "🎉", "⭐"]);
      totalAntes = total;
    }

    var totalAntes = -1;

    // ---------- teclado: Enter roda, setas andam no histórico ----------
    entrada.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        roda(entrada.value);
        entrada.value = "";
      } else if (e.key === "ArrowUp" && posicao > 0) {
        posicao--;
        entrada.value = historico[posicao];
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        posicao = Math.min(posicao + 1, historico.length);
        entrada.value = historico[posicao] || "";
        e.preventDefault();
      }
    });

    // clicar no terminal leva o cursor para a linha de comando
    saida.addEventListener("click", function () {
      if (!window.getSelection().toString()) entrada.focus();
    });

    // "Mostrar o comando": a dica aparece e o comando vai para a linha, sem rodar
    missoes.forEach(function (li) {
      var botao = li.querySelector("button");
      botao.addEventListener("click", function () {
        var cmd = li.dataset.comando;
        var mostra = li.querySelector(".dica-cmd");
        mostra.textContent = cmd;
        mostra.hidden = false;
        entrada.value = cmd.split(" · ")[0];
        entrada.focus();
      });
    });

    abas.forEach(function (b) {
      b.addEventListener("click", function () {
        mostraAba(b.dataset.arquivo);
      });
    });

    caixa.querySelector("[data-contas-recomecar]").addEventListener("click", comeca);

    function comeca() {
      sistema = sistemaNovo();
      conferiuId = false;
      fichasAntes = {};
      linhasAntes = {};
      saida.innerHTML = "";
      caixa.querySelectorAll(".dica-cmd").forEach(function (d) {
        d.hidden = true;
      });
      escreve("Servidor da Ponto Certo (de mentirinha). Digite ajuda para ver os comandos.", "t-info");
      escreve("📦 Pense num prédio: cada usuário tem um crachá, cada grupo é uma sala, e cada pasta em /home é um armário.", "t-vida");
      totalAntes = -1;
      desenha();
      mostraAba(abaAtual);
    }

    comeca();
  }


  /* =====================================================================
     Painel de permissões (aula 7): nove chaves r w x. Cada chave acesa
     soma 4, 2 ou 1 na coluna; as três somas formam o número do chmod.
     ===================================================================== */

  // quem é quem: a dona do arquivo, alguém do grupo e o resto do mundo
  // na vida real: o arquivo é uma sala do prédio, e o chmod é o chaveiro que decide quem recebe qual chave
  var CLASSES = [
    { nome: "Dono", quem: "ana", vida: "🔑 a chave da dona" },
    { nome: "Grupo", quem: "financeiro", vida: "🔑 a chave da equipe" },
    { nome: "Outros", quem: "todo o resto", vida: "🔑 a chave dos visitantes" }
  ];

  var BITS = [
    { letra: "r", valor: 4, arquivo: "Ler", pasta: "Listar", icone: "👀" },
    { letra: "w", valor: 2, arquivo: "Escrever", pasta: "Criar e apagar", icone: "✏️" },
    { letra: "x", valor: 1, arquivo: "Executar", pasta: "Entrar", icone: "▶️" }
  ];

  var PESSOAS = [
    { nome: "ana", papel: "a dona", classe: 0, emoji: "👩‍💼", cor: "ouro" },
    { nome: "carlos", papel: "da equipe do financeiro", classe: 1, emoji: "👨‍💻", cor: "azul" },
    { nome: "estagiário", papel: "visitante (fora do financeiro)", classe: 2, emoji: "🧑‍🎓", cor: "laranja" }
  ];

  // os desafios: o estudo de caso e mais dois do dia a dia
  var DESAFIOS = [
    {
      arquivo: "salarios.xlsx",
      emoji: "📊",
      pasta: false,
      tamanho: "48K",
      inicio: "777",
      alvo: "640",
      texto: "A planilha de salários da Contábil Exata está com 777. Conserte: a ana lê e escreve, o financeiro só lê e o resto não vê nada.",
      dica: "ana: ler + escrever = 4 + 2 · financeiro: ler = 4 · outros: nada = 0"
    },
    {
      arquivo: "backup.sh",
      emoji: "📜",
      pasta: false,
      tamanho: "2K",
      inicio: "644",
      alvo: "750",
      texto: "O script de backup: a ana faz tudo, o financeiro lê e executa (sem mudar o script) e o resto não toca.",
      dica: "ana: 4 + 2 + 1 · financeiro: ler + executar = 4 + 1 · outros: 0"
    },
    {
      arquivo: "publico",
      emoji: "📁",
      pasta: true,
      tamanho: "4K",
      inicio: "700",
      alvo: "755",
      texto: "A pasta publico: todo mundo entra e vê o que tem dentro, mas só a ana cria e apaga arquivos. Numa pasta, o x quer dizer \"entrar\".",
      dica: "ana: 4 + 2 + 1 · financeiro e outros: listar + entrar = 4 + 1"
    }
  ];

  document.querySelectorAll("[data-permissoes]").forEach(montaPermissoes);

  function montaPermissoes(caixa) {
    var abas = caixa.querySelector(".perm-desafios");
    var missao = caixa.querySelector(".perm-missao");
    var painel = caixa.querySelector(".perm-painel");
    var terminal = caixa.querySelector(".perm-terminal code");
    var numero = caixa.querySelector(".perm-numero input");
    var quem = caixa.querySelector(".perm-quem");
    var sala = caixa.querySelector(".perm-sala");
    var alerta = caixa.querySelector(".perm-alerta");
    var proximo = caixa.querySelector("[data-perm-proximo]");
    var atual = 0;
    var feitos = [false, false, false];
    var mexeu = false;
    // bits[classe][bit]: true = chave acesa
    var bits;

    // ---------- número do chmod <-> chaves ----------
    function deNumero(texto) {
      return texto.split("").map(function (d) {
        var n = Number(d);
        return BITS.map(function (b) {
          return (n & b.valor) > 0;
        });
      });
    }

    function digito(c) {
      return BITS.reduce(function (soma, b, i) {
        return soma + (bits[c][i] ? b.valor : 0);
      }, 0);
    }

    function numeroAtual() {
      return [0, 1, 2].map(digito).join("");
    }

    function textoLs() {
      return bits.map(function (classe) {
        return classe.map(function (aceso, i) {
          return aceso ? BITS[i].letra : "-";
        }).join("");
      }).join("");
    }

    // ---------- monta as três colunas de chaves (uma vez) ----------
    painel.innerHTML = CLASSES.map(function (c, ci) {
      return '<div class="perm-coluna"><h4>' + c.nome + " <small>" + c.quem + '</small><em class="perm-vida">' + c.vida + "</em></h4>" +
        '<div class="perm-chaves">' + BITS.map(function (b, bi) {
          return '<button type="button" data-c="' + ci + '" data-b="' + bi + '" aria-pressed="false" aria-label="' +
            c.nome + ": " + b.arquivo.toLowerCase() + " (" + b.letra + ", vale " + b.valor + ')">' +
            '<span class="led" aria-hidden="true">' + b.letra + '</span><small aria-hidden="true">' + b.icone + " " + b.valor + "</small></button>";
        }).join("") + "</div>" +
        '<span class="perm-digito" aria-live="polite">0</span><span class="perm-conta">0 + 0 + 0</span></div>';
    }).join("");

    painel.querySelectorAll(".perm-chaves button").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = Number(b.dataset.c);
        var i = Number(b.dataset.b);
        bits[c][i] = !bits[c][i];
        mexeu = true;
        desenha(c);
      });
    });

    // digitar o número acende as chaves
    numero.addEventListener("input", function () {
      var v = numero.value.trim();
      if (/[89]/.test(v) || /[^0-7]/.test(v)) {
        alerta.className = "perm-alerta errado";
        alerta.textContent = "Curto-circuito. Cada dígito vai de 0 a 7: 4 + 2 + 1 = 7 é o máximo.";
        return;
      }
      if (v.length !== 3) return;
      bits = deNumero(v);
      mexeu = true;
      desenha(-1, true);
    });

    // ---------- desenhar tudo ----------
    function desenha(mudou, veioDoNumero) {
      var d = DESAFIOS[atual];
      var n = numeroAtual();
      painel.querySelectorAll(".perm-coluna").forEach(function (col, c) {
        col.querySelectorAll("button").forEach(function (b, i) {
          b.setAttribute("aria-pressed", String(bits[c][i]));
        });
        var dig = col.querySelector(".perm-digito");
        dig.textContent = digito(c);
        col.querySelector(".perm-conta").textContent = BITS.map(function (b, i) {
          return bits[c][i] ? b.valor : 0;
        }).join(" + ");
        if (mudou === c || mudou === -1) {
          dig.classList.remove("muda");
          requestAnimationFrame(function () {
            dig.classList.add("muda");
          });
        }
      });
      if (!veioDoNumero) numero.value = n;

      // o terminal: chmod, ls -l e os bits em binário
      var binario = bits.map(function (classe) {
        return classe.map(function (aceso) {
          return aceso ? "<b>1</b>" : "<i>0</i>";
        }).join("");
      }).join(" ");
      terminal.innerHTML =
        '<span class="linha"><span class="ps">ana@contabil:~$</span> chmod ' + n + " " + d.arquivo + "</span>" +
        '<span class="linha"><span class="ps">ana@contabil:~$</span> ls -l' + (d.pasta ? "d " : " ") + d.arquivo + "</span>" +
        '<span class="linha">' + (d.pasta ? "d" : "-") + textoLs() + " 1 ana financeiro " + d.tamanho + " " + d.arquivo + "</span>" +
        '<span class="linha com"># em binário: <span class="bits">' + binario + "</span> = " + n + "</span>";

      // a sala do arquivo: porta escancarada ou trancada do jeito certo
      var aberta = bits[2][1] || (atual === 0 && bits[2][0]);
      var certo = n === d.alvo;
      sala.className = "perm-sala" + (certo ? " certa" : aberta ? " aberta" : "");
      sala.innerHTML = '<span class="perm-sala-emoji" aria-hidden="true">' + d.emoji + "</span>" +
        "<div><b>" + d.arquivo + "</b><span>" + (d.pasta ? "uma pasta: uma sala com coisas dentro" : "um arquivo: uma sala do prédio") + "</span></div>" +
        '<span class="perm-carimbo">' + (certo ? "🔐 TRANCADA CERTO" : aberta ? "🚪 PORTA ESCANCARADA" : "🛠️ ajustando as chaves…") + "</span>";

      // quem consegue o quê: cada pessoa com as chaves que recebeu
      quem.innerHTML = PESSOAS.map(function (p) {
        var alguma = bits[p.classe].some(Boolean);
        return '<div class="perm-pessoa vr-' + p.cor + '"><span class="perm-avatar" aria-hidden="true">' + p.emoji + "</span>" +
          "<div><b>" + p.nome + "</b><span>" + p.papel + "</span>" +
          '<span class="perm-porta">' + (alguma ? "🚪 entra na sala" : "🔒 fica do lado de fora") + "</span></div>" +
          '<div class="perm-acoes">' + BITS.map(function (b, i) {
            var pode = bits[p.classe][i];
            return '<span class="perm-acao' + (pode ? " pode" : "") + '"><span aria-hidden="true">' + b.icone + "</span>" + (d.pasta ? b.pasta : b.arquivo) +
              '<span class="so-leitor">' + (pode ? ": pode" : ": não pode") + "</span></span>";
          }).join("") + "</div></div>";
      }).join("");

      confere(n);
    }

    // ---------- confere o desafio ----------
    function confere(n) {
      var d = DESAFIOS[atual];
      if (!mexeu) {
        alerta.className = "perm-alerta";
        alerta.textContent = "Mexa nas chaves ou digite o número.";
        return;
      }
      if (n === d.alvo) {
        if (!feitos[atual]) festa(sala.parentNode, ["🔑", "✨", "🔐", "⭐"]);
        feitos[atual] = true;
        alerta.className = "perm-alerta certo";
        alerta.textContent = "Compilou de primeira! chmod " + d.alvo + " " + d.arquivo + ": cada um recebeu só a chave de que precisa.";
        proximo.hidden = atual === DESAFIOS.length - 1;
        if (feitos.every(Boolean)) alerta.textContent += " Os três desafios estão prontos. 🎉";
        marcaAbas();
        return;
      }
      proximo.hidden = true;
      alerta.className = "perm-alerta errado";
      if (atual === 0 && bits[2][0]) {
        alerta.textContent = "😬 Assim o estagiário (um visitante) ainda tem a chave de olhar a planilha de salários.";
      } else if (atual === 0 && bits[1][1]) {
        alerta.textContent = "Quase: a equipe do financeiro ainda tem a chave de mexer na planilha. Ela só precisa olhar.";
      } else if (bits[2][1]) {
        alerta.textContent = "Cuidado: com o w em outros, qualquer visitante mexe no arquivo. É porta escancarada.";
      } else {
        alerta.textContent = "Ainda não. Leia a missão de novo, coluna por coluna.";
      }
    }

    // ---------- desafios ----------
    function marcaAbas() {
      abas.querySelectorAll("button").forEach(function (b, i) {
        b.setAttribute("aria-pressed", String(i === atual));
        b.classList.toggle("feito", feitos[i]);
      });
    }

    function abre(i) {
      atual = i;
      mexeu = false;
      var d = DESAFIOS[i];
      bits = deNumero(d.inicio);
      missao.innerHTML = "<p><b>Desafio " + (i + 1) + ":</b> " + d.texto + "</p>" +
        "<p>Hoje está em <code>" + d.inicio + "</code>. Precisa de ajuda? " +
        '<button type="button" class="perm-mostra">Mostrar a conta</button></p>';
      missao.querySelector(".perm-mostra").addEventListener("click", function (e) {
        e.target.parentNode.innerHTML = "Hoje está em <code>" + d.inicio + "</code>. A conta: " + d.dica + ".";
      });
      proximo.hidden = true;
      marcaAbas();
      desenha(-1);
    }

    abas.innerHTML = DESAFIOS.map(function (d, i) {
      return '<button type="button" aria-pressed="false">Desafio ' + (i + 1) + ": " + d.arquivo + "</button>";
    }).join("");
    abas.querySelectorAll("button").forEach(function (b, i) {
      b.addEventListener("click", function () {
        abre(i);
      });
    });

    proximo.addEventListener("click", function () {
      abre(Math.min(atual + 1, DESAFIOS.length - 1));
      abas.querySelectorAll("button")[atual].focus();
    });

    caixa.querySelector("[data-perm-recomecar]").addEventListener("click", function () {
      abre(atual);
    });

    abre(0);
  }


  /* =====================================================================
     A viagem do e-mail (aula 10): o e-mail é uma carta. O SMTP é a agência
     que despacha, o DNS é o guia de CEPs (MX), e o servidor da Maria é a
     portaria do prédio dela, onde o porteiro confere SPF, DKIM e DMARC.
     ===================================================================== */

  var CARTA_PECAS = {
    secretaria: { emoji: "✍️", nome: "Secretaria", vida: "quem escreve a carta", cor: "ouro" },
    smtp: { emoji: "🏤", nome: "SMTP da escola", vida: "a agência que despacha", cor: "azul" },
    dns: { emoji: "📖", nome: "DNS", vida: "o guia de CEPs", cor: "roxo" },
    maria: { emoji: "🏢", nome: "Servidor da Maria", vida: "a portaria do prédio", cor: "azul" },
    celular: { emoji: "📱", nome: "Celular", vida: "nada ainda", cor: "verde" },
    pc: { emoji: "💻", nome: "Computador", vida: "nada ainda", cor: "verde" },
    golpista: { emoji: "🦹", nome: "Golpista", vida: "remetente falso", cor: "laranja" }
  };

  var CARTA_DESENHOS = {
    largo: {
      viewBox: "0 0 760 345",
      pecas: {
        secretaria: [80, 80, 136, 100], smtp: [270, 80, 136, 100], maria: [490, 80, 136, 100],
        dns: [380, 232, 136, 92], celular: [684, 45, 128, 84], pc: [684, 160, 128, 84], golpista: [80, 285, 136, 100]
      },
      trilhas: {
        envio: "M148 80 H202", servidores: "M338 80 H422", mx: "M270 130 V232 H312",
        confere: "M490 130 V232 H448", celular: "M558 68 H592 V45 H620", pc: "M558 92 H592 V160 H620",
        golpe: "M148 300 H530 V130"
      }
    },
    estreito: {
      viewBox: "0 0 340 545",
      pecas: {
        secretaria: [85, 60, 150, 96], golpista: [255, 60, 150, 96], smtp: [85, 200, 150, 96], dns: [255, 200, 150, 96],
        maria: [170, 345, 160, 96], celular: [85, 490, 140, 84], pc: [255, 490, 140, 84]
      },
      trilhas: {
        envio: "M85 108 V152", mx: "M160 200 H180", servidores: "M110 248 V297", confere: "M230 297 V272 H255 V248",
        golpe: "M330 60 H336 V330 H250", celular: "M130 393 V420 H85 V448", pc: "M210 393 V420 H255 V448"
      }
    }
  };

  document.querySelectorAll("[data-email]").forEach(montaEmail);

  function montaEmail(caixa) {
    var palco = caixa.querySelector(".vr-palco");
    var diario = caixa.querySelector(".mail-diario");
    var resultado = caixa.querySelector(".mail-resultado");
    var leitura = caixa.querySelector(".mail-leitura");
    var dicaLeitura = caixa.querySelector(".mail-leitura-dica");
    var enviar = caixa.querySelector("[data-mail-enviar]");
    var ocupado = false;
    var protocolo = "imap";
    var caixas = { maria: [], celular: [], pc: [] };
    var vr = cenaVR(palco, CARTA_DESENHOS, CARTA_PECAS);

    vr.aoRedesenhar = function () {
      var golpe = quem() === "golpe";
      vr.no("golpista").classList.toggle("apagado", !golpe);
      vr.fluxo("golpe").classList.toggle("apagado", !golpe);
      vr.svg.querySelector('.vr-trilhas [data-trilha="golpe"]').classList.toggle("apagado", !golpe);
      desenhaCaixas();
    };

    // uma linha do diário: o que acontece no servidor e na vida real
    function conta(tecnico, vida) {
      var li = document.createElement("li");
      li.innerHTML = tecnico + (vida ? '<span class="na-vida">📦 ' + vida + "</span>" : "");
      diario.appendChild(li);
      return li;
    }

    function registro(nome) {
      return caixa.querySelector('[data-registro="' + nome + '"]').checked;
    }

    function quem() {
      return caixa.querySelector('[name="mail-quem"]:checked').value;
    }

    // ---------- volta tudo ao começo (ao mudar o DNS ou quem envia) ----------
    function limpa() {
      if (ocupado) return;
      diario.innerHTML = "";
      resultado.textContent = "";
      resultado.className = "mail-resultado";
      leitura.hidden = true;
      caixas = { maria: [], celular: [], pc: [] };
      ["maria", "secretaria", "golpista"].forEach(vr.tiraCarimbo);
      enviar.innerHTML = quem() === "golpe" ? "🦹 Enviar a carta falsa" : "✉️ Enviar o boletim";
      vr.aoRedesenhar();
    }

    caixa.querySelectorAll(".mail-controles input").forEach(function (i) {
      i.addEventListener("change", limpa);
    });

    // ---------- a viagem ----------
    enviar.addEventListener("click", function () {
      if (ocupado) return;
      limpa();
      ocupado = true;
      enviar.disabled = true;
      var golpe = quem() === "golpe";
      var reg = { spf: registro("spf"), dkim: registro("dkim"), dmarc: registro("dmarc") };
      var ida;

      if (!golpe) {
        vr.acende("secretaria");
        conta("O programa de e-mail entrega o boletim ao servidor da escola pelo <b>SMTP</b>, porta <code>587</code>, com senha e criptografia.",
          "A secretaria leva a carta até a agência do Correio.");
        ida = vr.voa("envio", "ok", false, "boletim").then(function () {
          vr.acende("smtp");
          conta("Para onde vai <code>@correio.com.br</code>? O servidor pergunta ao <b>DNS</b> o registro <b>MX</b>: <code>correio.com.br. MX 10 mail.correio.com.br.</code>",
            "A agência consulta o guia de CEPs: qual é o endereço do prédio da Maria?");
          return vr.voa("mx", "ok", false, "CEP da Maria?", "❓");
        }).then(function () {
          vr.acende("dns");
          return vr.voa("mx", "servidor", true, "mail.correio.com.br", "📍");
        }).then(function () {
          conta("Servidor conversa com servidor: <b>SMTP</b> de novo, agora na porta <code>25</code>.",
            "O carteiro leva a carta até a portaria do prédio da Maria.");
          return vr.voa("servidores", "ok", false, "porta 25");
        });
      } else {
        vr.acende("golpista");
        conta('O golpista escreve "De: boletim@escola.com.br" e manda do servidor dele, direto para o da Maria.',
          "Qualquer um escreve qualquer remetente no envelope. É só tinta!");
        ida = vr.voa("golpe", "erro", false, "De: escola 😈");
      }

      ida.then(function () {
        vr.acende("maria");
        conta("O servidor da Maria consulta o DNS de <code>escola.com.br</code> para conferir se a mensagem veio mesmo da escola.",
          "O porteiro desconfia e confere no guia: essa carta é mesmo da escola?");
        return vr.voa("confere", "servidor", false, "é da escola?", "🔎");
      }).then(function () {
        vr.acende("dns");
        return vr.voa("confere", "servidor", true, "regras da escola", "📋");
      }).then(function () {
        return julga(golpe, reg);
      }).then(function () {
        ocupado = false;
        enviar.disabled = false;
      });
    });

    // ---------- o porteiro decide: caixa de entrada, spam ou recusa ----------
    function julga(golpe, reg) {
      var spf = !golpe && reg.spf;
      var dkim = !golpe && reg.dkim;
      var dmarcFalha = reg.dmarc && !spf && !dkim;
      var linha = function (ok, texto, vida) {
        return '<li class="' + (ok ? "ok" : "falha") + '">' + (ok ? "✓ " : "✗ ") + texto + ' <span class="na-vida">' + vida + "</span></li>";
      };
      conta("A conferência:<ul class=\"mail-checks\">" +
        linha(spf, reg.spf ? (golpe ? "SPF falhou: o servidor do golpista não está na lista da escola." : "SPF passou: o servidor da escola está na lista.") : "SPF: a escola não tem.",
          reg.spf ? "📋 a lista de carteiros autorizados pela escola" : "📋 sem lista de carteiros autorizados") +
        linha(dkim, reg.dkim ? (golpe ? "DKIM falhou: o golpista não tem a chave da escola." : "DKIM passou: a assinatura confere.") : "DKIM: a mensagem não tem assinatura.",
          reg.dkim ? "🔏 o lacre com a assinatura da escola" : "🔏 envelope sem lacre") +
        linha(reg.dmarc && !dmarcFalha, reg.dmarc ? (dmarcFalha ? "DMARC falhou, e a escola pediu: recusar." : "DMARC passou.") : "DMARC: a escola não tem. O servidor decide sozinho.",
          reg.dmarc ? "👮 a ordem da escola para o porteiro: barrar carta falsa" : "👮 o porteiro não recebeu ordem nenhuma") +
        "</ul>").classList.add("mail-conferencia");

      var destino;
      var texto;
      var bom;
      if (golpe) {
        destino = reg.dmarc ? "recusado" : "spam";
        bom = reg.dmarc;
        texto = reg.dmarc ?
          "🛡️ O golpe não passou! O porteiro seguiu a ordem da escola (DMARC) e devolveu a carta falsa." :
          "😬 Sem DMARC, o porteiro não sabe o que a escola quer. A carta falsa foi para o spam, e num prédio menos cuidadoso iria direto para a caixinha. Ligue o DMARC e tente de novo.";
      } else if (dmarcFalha || (!spf && !dkim)) {
        destino = "recusado";
        bom = false;
        texto = "↩️ Recusado: nada prova que o boletim veio da escola. A carta volta para a secretaria.";
      } else if (spf && dkim && reg.dmarc) {
        destino = "entrada";
        bom = true;
        texto = "Compilou de primeira! 📬 O boletim chegou na caixa de entrada da Maria.";
      } else {
        destino = "spam";
        bom = false;
        var faltam = ["spf", "dkim", "dmarc"].filter(function (r) { return !reg[r]; }).map(function (r) { return r.toUpperCase(); });
        texto = "🗑️ Foi para o spam. Quem manda muito (5.000 ou mais por dia para o Gmail) precisa dos três desde 2024: " +
          (faltam.length > 1 ? "faltam " : "falta ") + faltam.join(" e ") + ".";
      }

      var anda;
      if (destino === "recusado") {
        vr.carimba("maria", "RECUSADO");
        conta("A mensagem volta para quem mandou.", "O porteiro carimba DEVOLVIDO e manda de volta.");
        anda = golpe ? vr.voa("golpe", "erro", true, "DEVOLVIDA") : vr.voa("servidores", "erro", true, "DEVOLVIDA").then(function () {
          return vr.voa("envio", "erro", true, "DEVOLVIDA");
        });
        anda = anda.then(function () {
          vr.carimba(golpe ? "golpista" : "secretaria", "DEVOLVIDO");
        });
      } else {
        vr.carimba("maria", destino === "entrada" ? "ENTREGUE" : "SPAM", destino === "entrada" ? "bom" : "");
        conta("A mensagem fica guardada no servidor da Maria, na pasta " + (destino === "entrada" ? "<b>Caixa de entrada</b>." : "<b>Spam</b>."),
          destino === "entrada" ? "A carta fica na caixinha dela, na portaria." : "A carta vai para a pilha de \"suspeitas\" da portaria.");
        anda = Promise.resolve();
      }

      return anda.then(function () {
        resultado.className = "mail-resultado " + (bom ? "certo" : "errado");
        resultado.textContent = texto;
        if (bom) festa(palco, golpe ? ["🛡️", "✨", "👮", "⭐"] : ["📬", "✨", "🎉", "⭐"]);
        if (!golpe && destino !== "recusado") abreLeitura(destino);
      });
    }

    // ---------- a leitura: IMAP olha a carta na portaria; POP3 leva embora ----------
    function abreLeitura(destino) {
      caixas = { maria: [destino === "entrada" ? "boletim" : "boletim (no spam)"], celular: [], pc: [] };
      dicaLeitura.textContent = "";
      leitura.hidden = false;
      desenhaCaixas();
    }

    function desenhaCaixas() {
      ["celular", "pc"].forEach(function (k) {
        var n = caixas[k].length;
        vr.texto(k, "vida", n ? "📩 " + caixas[k][0] : "nada ainda");
        vr.no(k).classList.toggle("cheia", n > 0);
      });
      caixa.querySelectorAll("[data-caixa]").forEach(function (c) {
        var lista = caixas[c.dataset.caixa];
        c.querySelector("span").textContent = lista.length ? "📩 " + lista[0] : "vazia";
      });
      caixa.querySelectorAll("[data-protocolo]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.protocolo === protocolo));
      });
    }

    caixa.querySelectorAll("[data-protocolo]").forEach(function (b) {
      b.addEventListener("click", function () {
        protocolo = b.dataset.protocolo;
        abreLeitura(caixas.maria[0] && caixas.maria[0].indexOf("spam") > 0 ? "spam" : "entrada");
      });
    });

    caixa.querySelectorAll("[data-abrir]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (ocupado) return;
        var aparelho = b.dataset.abrir;
        var outro = aparelho === "pc" ? "celular" : "computador";
        var nome = aparelho === "pc" ? "computador" : "celular";
        if (caixas[aparelho].length) {
          dicaLeitura.textContent = "O boletim já está no " + nome + ".";
          return;
        }
        if (!caixas.maria.length) {
          dicaLeitura.textContent = "📭 Caixa vazia! O POP3 já levou o boletim para o " + outro + " e ele saiu do servidor. É como retirar a carta da portaria: quem chegar depois não acha.";
          vr.voa(aparelho, "erro", false, "cadê?", "❔");
          return;
        }
        ocupado = true;
        vr.voa(aparelho, "servidor", false, protocolo === "imap" ? "cópia" : "levando", "📩").then(function () {
          vr.acende(aparelho);
          if (protocolo === "imap") {
            caixas[aparelho] = caixas.maria.slice();
            dicaLeitura.textContent = "IMAP: o " + nome + " mostra o boletim, e ele continua no servidor. Como olhar a carta na portaria: de qualquer aparelho você vê a mesma. Abra no outro também.";
          } else {
            caixas[aparelho] = caixas.maria.splice(0);
            dicaLeitura.textContent = "POP3: o " + nome + " baixou o boletim e, em geral, ele sai do servidor. Como retirar a carta da portaria e levar para casa. Tente abrir no outro aparelho.";
          }
          desenhaCaixas();
          ocupado = false;
        });
      });
    });

    limpa();
  }


  /* =====================================================================
     Detetive do log (aula 11): o e-mail é uma carta e o servidor é o
     Correio. O Postfix é a agência, o Dovecot é a portaria do prédio,
     o log é o rastreamento. Um envelope voa pelas trilhas.
     ===================================================================== */

  // o que faz cada programa que aparece no log
  var PROGRAMAS = {
    "postfix/smtpd": "a porta de entrada do Postfix: recebeu a mensagem da gerente.",
    "postfix/cleanup": "arruma a mensagem e dá a ela um número (message-id).",
    "postfix/qmgr": "o gerente da fila: anota quem mandou e decide para onde vai.",
    "postfix/lmtp": "entrega a mensagem ao Dovecot, que guarda nas caixas.",
    "postfix/smtp": "o carteiro para fora: leva a mensagem a outro servidor, pela porta 25.",
    "postfix/bounce": "avisa quem mandou que a mensagem não foi entregue.",
    "dovecot": "o Dovecot: guardou a mensagem na caixa (INBOX)."
  };

  var STATUS = {
    sent: "<b>status=sent</b>: entregue. Missão cumprida.",
    deferred: "<b>status=deferred</b>: adiado. Deu problema temporário; a mensagem fica na fila e o Postfix tenta de novo sozinho.",
    bounced: "<b>status=bounced</b>: devolvido. Erro definitivo; o Postfix desiste e avisa quem mandou."
  };

  // as peças da cena: o nome técnico e a analogia, cada uma com a sua cor
  var PECAS = {
    gerente: { emoji: "👩‍💼", nome: "Gerente", vida: "quem escreve a carta", cor: "ouro" },
    postfix: { emoji: "🏤", nome: "Postfix", vida: "a agência do Correio", cor: "azul" },
    dovecot: { emoji: "🏢", nome: "Dovecot", vida: "a portaria do prédio", cor: "roxo" },
    ana: { emoji: "📭", nome: "ana", vida: "caixinha: 0 cartas", cor: "verde" },
    carlos: { emoji: "📭", nome: "carlos", vida: "caixinha: 0 cartas", cor: "verde" },
    fornecedor: { emoji: "🏭", nome: "Fornecedor", vida: "agência de outra cidade", cor: "laranja" }
  };

  // dois desenhos: deitado (computador) e em pé (celular). [x, y, largura, altura] de cada peça
  var DESENHOS = {
    largo: {
      viewBox: "0 0 760 312",
      pecas: {
        gerente: [80, 92, 136, 100], postfix: [262, 92, 136, 100], dovecot: [444, 92, 136, 100],
        ana: [664, 50, 128, 84], carlos: [664, 164, 128, 84], fornecedor: [444, 254, 136, 100]
      },
      trilhas: {
        envio: "M148 92 H194", lmtp: "M330 92 H376", ana: "M512 80 H560 V50 H600",
        carlos: "M512 104 H560 V164 H600", fora: "M262 142 V254 H376"
      }
    },
    estreito: {
      viewBox: "0 0 340 540",
      pecas: {
        gerente: [92, 60, 148, 100], postfix: [92, 205, 148, 100], dovecot: [256, 205, 136, 100],
        ana: [256, 350, 128, 84], carlos: [256, 478, 128, 84], fornecedor: [92, 478, 148, 100]
      },
      trilhas: {
        envio: "M92 110 V155", lmtp: "M166 205 H188", ana: "M256 255 V308",
        carlos: "M324 222 H334 V478 H320", fora: "M92 255 V428"
      }
    }
  };

  document.querySelectorAll("[data-detetive]").forEach(montaDetetive);

  function montaDetetive(caixa) {
    var palco = caixa.querySelector(".vr-palco");
    var log = caixa.querySelector(".detetive-log");
    var explica = caixa.querySelector(".detetive-explica");
    var solucao = caixa.querySelector(".detetive-solucao");
    var retorno = caixa.querySelector(".detetive-retorno");
    var ligar = caixa.querySelector("[data-detetive-ligar]");
    var missoes = caixa.querySelectorAll(".detetive-missoes li");
    var placar = caixa.querySelector(".detetive-placar");
    var vazioInicial = log.innerHTML;
    var estado;

    function novoEstado() {
      return {
        ocupado: false,
        apelido: false,
        fornecedorAberto: false,
        fila: [],
        caixas: { ana: 0, carlos: 0 },
        relogio: new Date(),
        feitas: [false, false, false, false],
        viuAdiado: false,
        pids: {}
      };
    }

    // a fila do Postfix: uma pílula em cima da agência
    PECAS.postfix.extra = '<g class="vr-fila"><rect x="22" y="-60" width="64" height="22" rx="11"/><text x="54" y="-45">fila: 0</text></g>';
    var vr = cenaVR(palco, DESENHOS, PECAS);
    vr.aoRedesenhar = function () {
      if (estado) atualizaCena();
    };

    function voa(nome, tipo, volta) {
      return vr.voa(nome, tipo, volta);
    }

    function acende(nome) {
      vr.acende(nome);
    }

    // DEVOLVIDO aparece na gerente e some
    function carimba(nome) {
      vr.carimba(nome, "DEVOLVIDO");
    }

    function atualizaCena() {
      ["ana", "carlos"].forEach(function (k) {
        var n = estado.caixas[k];
        vr.texto(k, "emoji", n ? "📬" : "📭");
        vr.texto(k, "vida", "caixinha: " + n + (n === 1 ? " carta" : " cartas"));
        vr.no(k).classList.toggle("cheia", n > 0);
      });
      var fila = vr.svg.querySelector(".vr-fila");
      fila.querySelector("text").textContent = (estado.fila.length ? "⏳ " : "") + "fila: " + estado.fila.length;
      fila.classList.toggle("tem", estado.fila.length > 0);
      vr.no("fornecedor").classList.toggle("fechado", !estado.fornecedorAberto);
      vr.fluxo("fora").classList.toggle("fechado", !estado.fornecedorAberto);
      if (estado.fornecedorAberto) vr.tiraCarimbo("fornecedor");
      else vr.carimba("fornecedor", "FECHADO", "", true);
    }

    // ---------- o log: cada linha técnica com a tradução do rastreamento embaixo ----------
    var MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    function hora() {
      estado.relogio = new Date(estado.relogio.getTime() + 300 + Math.floor(Math.random() * 900));
      var r = estado.relogio;
      var dois = function (n) { return (n < 10 ? "0" : "") + n; };
      return MESES[r.getMonth()] + " " + (r.getDate() < 10 ? " " : "") + r.getDate() + " " +
        dois(r.getHours()) + ":" + dois(r.getMinutes()) + ":" + dois(r.getSeconds());
    }

    function novoId() {
      var letras = "0123456789ABCDEF";
      var id = "";
      for (var i = 0; i < 10; i++) id += letras[Math.floor(Math.random() * 16)];
      return id;
    }

    // cada programa mantém o mesmo número de processo, como no log de verdade
    function pid(programa) {
      if (!estado.pids[programa]) estado.pids[programa] = 2000 + Math.floor(Math.random() * 7000);
      return estado.pids[programa];
    }

    function linha(programa, id, resto, info) {
      return espera(320).then(function () {
        var vazio = log.querySelector(".detetive-vazio");
        if (vazio) vazio.remove();
        var texto = hora() + " logistica " + programa + "[" + pid(programa) + "]: " + (id ? id + ": " : "") + resto;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "detetive-linha chega" + (info.status ? " " + info.status : "");
        b.innerHTML = '<span class="log-tec">' + limpa(texto).replace(/(status=\w+)/, "<b>$1</b>") + "</span>" +
          '<span class="log-vida">' + info.vida + "</span>";
        b.addEventListener("click", function () {
          escolhe(b, programa, id, resto, info);
        });
        log.appendChild(b);
        log.scrollTop = log.scrollHeight;
        setTimeout(function () {
          b.classList.remove("chega");
        }, 1300);
      });
    }

    caixa.querySelector(".detetive-traduz input").addEventListener("change", function (e) {
      log.classList.toggle("com-traducao", e.target.checked);
    });

    // ---------- o aluno clicou numa linha: no servidor e na vida real ----------
    function escolhe(botao, programa, id, resto, info) {
      log.querySelectorAll(".detetive-linha").forEach(function (l) {
        l.classList.toggle("escolhida", l === botao);
      });
      var tec = ["<p><b>" + limpa(programa) + "</b>: " + PROGRAMAS[programa] + "</p>"];
      if (id) tec.push("<p><code>" + id + "</code> é o número da mensagem na fila. Com ele, você acha todas as linhas dela: <code>grep " + id + " /var/log/mail.log</code></p>");
      var para = /to=<([^>]+)>/.exec(resto);
      var orig = /orig_to=<([^>]+)>/.exec(resto);
      if (para) tec.push("<p><code>to=</code> para quem foi: <b>" + limpa(para[1]) + "</b>" + (orig ? ", que veio do apelido <b>" + limpa(orig[1]) + "</b>" : "") + ".</p>");
      if (info.status) tec.push("<p>" + STATUS[info.status] + "</p>");
      if (info.motivo) tec.push("<p>O motivo, entre parênteses: " + info.motivo + "</p>");
      explica.innerHTML = '<div class="explica-lado explica-tec"><h4>🖥️ No servidor</h4>' + tec.join("") + "</div>" +
        '<div class="explica-lado explica-vida"><h4>📦 Na vida real</h4><p>' + info.vida + "</p>" + (info.vidaMais ? "<p>" + info.vidaMais + "</p>" : "") + "</div>";

      if (info.status === "sent" && info.quem === "ana") marca(0);
      if (info.status === "bounced" && info.quem === "diretor") {
        marca(1);
        solucao.hidden = false;
      }
    }

    function marca(i) {
      if (estado.feitas[i]) return;
      estado.feitas[i] = true;
      festa(palco, ["✨", "🎉", "⭐", "💌"]);
      confere();
    }

    function confere() {
      var total = 0;
      estado.feitas.forEach(function (ok, i) {
        missoes[i].classList.toggle("feita", ok);
        if (ok) total++;
      });
      placar.classList.toggle("pronto", total === 4);
      placar.textContent = total === 4 ? "4 de 4: caso encerrado, detetive! 🕵️" : total + " de 4 missões";
    }

    function avisa(tipo, html) {
      retorno.className = "dora-retorno detetive-retorno" + (tipo ? " " + tipo : "");
      retorno.innerHTML = html;
    }

    // ---------- mandar uma carta ----------
    caixa.querySelectorAll("[data-para]").forEach(function (b) {
      b.addEventListener("click", function () {
        if (estado.ocupado) return;
        estado.ocupado = true;
        caixa.setAttribute("aria-busy", "true");
        avisa("", "");
        envia(b.dataset.para).then(function () {
          estado.ocupado = false;
          caixa.removeAttribute("aria-busy");
          atualizaCena();
        });
      });
    });

    function envia(para) {
      var id = novoId();
      acende("gerente");
      return voa("envio", "ok").then(function () {
        acende("postfix");
        return linha("postfix/smtpd", id, "client=localhost[127.0.0.1]",
          { vida: "📥 Objeto postado na agência." });
      }).then(function () {
        return linha("postfix/cleanup", id, "message-id=<" + id.toLowerCase() + "@logistica.local>",
          { vida: "🏷️ Etiqueta colada com o código de rastreio <b>" + id + "</b>.", vidaMais: "O ID da fila é o código de rastreio: com ele você segue a carta do começo ao fim." });
      }).then(function () {
        return linha("postfix/qmgr", id, "from=<gerente@logistica.local>, size=2048, nrcpt=1 (queue active)",
          { vida: "📋 Na triagem: conferindo remetente e destino." });
      }).then(function () {
        if (para === "fornecedor") return paraFora(id);
        return paraDentro(id, para);
      });
    }

    // dentro da empresa: agência (Postfix) -> portaria (Dovecot) -> caixinha
    function paraDentro(id, para) {
      var dono = para === "diretor" ? (estado.apelido ? "carlos" : null) : para;
      return voa("lmtp", "servidor").then(function () {
        acende("dovecot");
        if (!dono) {
          return linha("postfix/lmtp", id, "to=<diretor@logistica.local>, relay=logistica[private/dovecot-lmtp], dsn=5.1.1, status=bounced (User unknown)",
            { status: "bounced", quem: "diretor",
              motivo: "<b>User unknown</b>, usuário desconhecido. Não existe nenhuma caixa chamada diretor neste servidor. A gerente digitou certo; a conta é que não existe.",
              vida: "↩️ Destinatário desconhecido: devolvido ao remetente.",
              vidaMais: "O porteiro procura a caixinha \"diretor\" e não acha: no prédio, o diretor se chama carlos. A carta volta." }).then(function () {
            return voa("lmtp", "erro", true);
          }).then(function () {
            return linha("postfix/bounce", id, "sender non-delivery notification: " + novoId(),
              { vida: "✉️ Aviso de não entrega enviado para a gerente." });
          }).then(function () {
            return voa("envio", "erro", true);
          }).then(function () {
            carimba("gerente");
            avisa("errado", "↩️ Devolvido! Como carta para um apartamento que não existe: o carteiro devolve ao remetente. Clique na linha do log que explica.");
          });
        }
        var orig = para === "diretor" ? ", orig_to=<diretor@logistica.local>" : "";
        return linha("postfix/lmtp", id, "to=<" + dono + "@logistica.local>" + orig + ", relay=logistica[private/dovecot-lmtp], dsn=2.0.0, status=sent (250 2.0.0 Saved)",
          { status: "sent", quem: para,
            motivo: "<b>Saved</b>, o Dovecot respondeu que guardou.",
            vida: "🏠 Entregue na portaria do prédio" + (para === "diretor" ? ", para o carlos (o \"diretor\")." : "."),
            vidaMais: para === "diretor" ? "O aviso na portaria funcionou: \"cartas para o diretor, entregar ao carlos\". É o apelido." : "" }).then(function () {
          return voa(dono, "servidor");
        }).then(function () {
          estado.caixas[dono]++;
          atualizaCena();
          acende(dono);
          return linha("dovecot", null, "lmtp(" + dono + "): msgid=<" + id.toLowerCase() + "@logistica.local>: saved mail to INBOX",
            { vida: "📬 O porteiro guardou a carta na caixinha do " + dono + " (INBOX)." });
        }).then(function () {
          return linha("postfix/qmgr", id, "removed", { vida: "✅ Rastreamento encerrado." });
        }).then(function () {
          if (para === "diretor") {
            marca(2);
            avisa("certo", "Compilou de primeira! 📬 A carta do diretor chegou na caixinha do carlos. No log, repare no <code>orig_to=</code>.");
          } else {
            avisa("certo", "📬 Entregue! Agora ache no log a linha que prova.");
          }
        });
      });
    }

    // para fora: a agência manda para a agência de outra cidade, pela porta 25
    function paraFora(id) {
      return voa("fora", "servidor").then(function () {
        acende("fornecedor");
        if (!estado.fornecedorAberto) {
          estado.fila.push(id);
          estado.viuAdiado = true;
          ligar.hidden = false;
          return linha("postfix/smtp", id, "to=<compras@fornecedor.example>, relay=none, delay=30, dsn=4.4.1, status=deferred (connect to mx.fornecedor.example[203.0.113.25]:25: Connection timed out)",
            { status: "deferred",
              motivo: "<b>Connection timed out</b>: o servidor do fornecedor não respondeu. Pode ser só uma queda: o Postfix guarda e tenta de novo.",
              vida: "⏳ Tentativa de entrega sem sucesso: agência fechada. Nova tentativa em breve.",
              vidaMais: "O carteiro não joga a carta fora nem pede para postar de novo: guarda e volta depois." }).then(function () {
            return voa("fora", "erro", true);
          }).then(function () {
            acende("postfix");
            atualizaCena();
            avisa("", "⏳ Adiado: a carta ficou guardada na agência (fila: 1). Ninguém precisa mandar de novo. Agora abra o fornecedor.");
          });
        }
        return linha("postfix/smtp", id, "to=<compras@fornecedor.example>, relay=mx.fornecedor.example[203.0.113.25]:25, dsn=2.0.0, status=sent (250 2.0.0 Ok: queued as " + novoId() + ")",
          { status: "sent",
            motivo: "<b>250 Ok</b>: o servidor do fornecedor aceitou. Daqui em diante, a entrega é com ele.",
            vida: "🚚 Entregue à agência da outra cidade." }).then(function () {
          return linha("postfix/qmgr", id, "removed", { vida: "✅ Rastreamento encerrado." });
        });
      });
    }

    // o fornecedor abre: a fila anda sozinha
    ligar.addEventListener("click", function () {
      if (estado.ocupado) return;
      estado.ocupado = true;
      estado.fornecedorAberto = true;
      ligar.hidden = true;
      atualizaCena();
      var fila = estado.fila.splice(0);
      var anda = Promise.resolve();
      fila.forEach(function (id) {
        anda = anda.then(function () {
          return linha("postfix/qmgr", id, "from=<gerente@logistica.local>, size=2048, nrcpt=1 (queue active)",
            { vida: "🔁 Nova tentativa de entrega, sem ninguém postar de novo." });
        }).then(function () {
          return paraFora(id);
        });
      });
      anda.then(function () {
        atualizaCena();
        if (estado.viuAdiado && fila.length) marca(3);
        avisa("certo", "🚚 O fornecedor abriu e o Postfix entregou o que estava na fila, sozinho.");
        estado.ocupado = false;
      });
    });

    // ---------- as três saídas do caso ----------
    caixa.querySelectorAll("[data-solucao]").forEach(function (b) {
      b.addEventListener("click", function () {
        var s = b.dataset.solucao;
        if (s === "apelido") {
          estado.apelido = true;
          avisa("certo", "🏷️ Isso! O problema era da TI: o endereço que todo mundo usa não existia. Na vida real, é o aviso na portaria: \"cartas para o diretor, entregar ao carlos\". " +
            "No servidor: <code>echo \"diretor: carlos\" | sudo tee -a /etc/aliases</code> e <code>sudo newaliases</code>. Agora mande de novo para o diretor.");
        } else if (s === "reenviar") {
          avisa("errado", "Curto-circuito. Postar a mesma carta de novo dá o mesmo erro: o apartamento continua não existindo. Pode testar!");
        } else {
          avisa("errado", "Curto-circuito. Reiniciar é fechar e abrir a agência: a caixinha do diretor continua não existindo.");
        }
      });
    });

    caixa.querySelector("[data-detetive-recomecar]").addEventListener("click", comeca);

    function comeca() {
      if (estado && estado.ocupado) return;
      estado = novoEstado();
      log.innerHTML = vazioInicial;
      explica.innerHTML = "<p><b>Clique numa linha do log</b> e eu explico o que ela diz no servidor e na vida real.</p>";
      solucao.hidden = true;
      ligar.hidden = true;
      avisa("", "");
      atualizaCena();
      confere();
    }

    comeca();
  }
})();
