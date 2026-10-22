/* Piá Importados: comportamento do site (menu, WhatsApp, cores, cookies, mapa e animações). */
(() => {
  const C = window.PIA || {};
  const raiz = document.documentElement;
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ponteiroFino = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const guardar = (k, v) => { try { v === undefined ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  const ler = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };

  /* Refração do Liquid Glass: só o Chromium aplica filtro SVG no backdrop-filter */
  if (navigator.userAgentData && CSS.supports("backdrop-filter", "url(#refracao)")) raiz.classList.add("refrata");

  /* Dados da configuração */
  $$("[data-link]").forEach((a) => { if (C[a.dataset.link]) a.href = C[a.dataset.link]; });
  $$("[data-whatsapp-exibicao]").forEach((el) => { if (C.whatsappExibicao) el.textContent = C.whatsappExibicao; });
  $$("[data-razao-social]").forEach((el) => { if (C.razaoSocial) el.textContent = C.razaoSocial; });
  $$("[data-cnpj]").forEach((el) => { if (C.cnpj) el.textContent = C.cnpj; });
  $$("[data-email-privacidade]").forEach((el) => { if (C.emailPrivacidade) { el.textContent = C.emailPrivacidade; el.href = "mailto:" + C.emailPrivacidade; } });
  $$("[data-ano]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* Aba atual: destaca a página aberta no menu, na gaveta e na barra de abas */
  const paginaAtual = (location.pathname.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  $$("[data-pagina]").forEach((a) => { if (a.dataset.pagina === paginaAtual) a.setAttribute("aria-current", "page"); });

  /* UTM: guardada na sessão para acompanhar o visitante entre páginas */
  const utmUrl = new URLSearchParams(location.search);
  let utm = { fonte: utmUrl.get("utm_source"), campanha: utmUrl.get("utm_campaign") };
  try {
    if (utm.fonte || utm.campanha) sessionStorage.setItem("pia-utm", JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem("pia-utm") || "{}");
  } catch (e) {}

  /* Medição (só após consentimento) */
  const consentido = () => ler("pia-cookies-v1") === "aceito";
  const medir = (origem) => {
    if (!consentido()) return;
    if (window.gtag) window.gtag("event", "generate_lead", { origem });
    if (window.fbq) window.fbq("track", "Lead", { content_name: origem });
  };
  function carregarMedicao() {
    if (C.ga4Id && !window.gtag) {
      const s = document.createElement("script");
      s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=" + C.ga4Id;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag("js", new Date()); window.gtag("config", C.ga4Id, { anonymize_ip: true });
    }
    if (C.metaPixelId && !window.fbq) {
      /* Código padrão do Pixel da Meta */
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
      window.fbq("init", C.metaPixelId); window.fbq("track", "PageView");
    }
  }

  /* WhatsApp com mensagem pronta */
  const linkWhats = (mensagem) => {
    let texto = mensagem || "Olá! Vim pelo site da Piá.";
    const ref = [utm.fonte, utm.campanha].filter(Boolean).join(" / ");
    if (ref) texto += "\n\n(ref: " + ref + ")";
    return "https://wa.me/" + (C.whatsapp || "5531987795212") + "?text=" + encodeURIComponent(texto);
  };
  let corAtual = "Burgundy";
  const msgCor = () => "Olá! Vim pelo site e quero saber o preço do iPhone 18 Pro na cor " + corAtual + ".";
  function atualizarWhats() {
    $$("[data-wa]").forEach((a) => { a.href = linkWhats(a.dataset.wa); });
    $$("[data-wa-cor]").forEach((a) => { a.href = linkWhats(msgCor()); });
  }
  atualizarWhats();
  $$("[data-wa], [data-wa-cor]").forEach((a) => {
    a.target = "_blank"; a.rel = "noopener";
    a.addEventListener("click", () => medir(a.dataset.waOrigem || "whatsapp"));
  });

  /* Aviso de cookies */
  const aviso = $("[data-cookies]");
  function mostrarAviso() {
    if (!aviso) return;
    aviso.hidden = false; aviso.classList.add("is-entrando");
    requestAnimationFrame(() => requestAnimationFrame(() => aviso.classList.remove("is-entrando")));
  }
  function decidir(valor) {
    guardar("pia-cookies-v1", valor);
    if (aviso) aviso.hidden = true;
    if (valor === "aceito") carregarMedicao();
  }
  if (aviso) {
    $("[data-cookies-aceitar]", aviso).addEventListener("click", () => decidir("aceito"));
    $("[data-cookies-recusar]", aviso).addEventListener("click", () => decidir("recusado"));
    const temMedicao = C.ga4Id || C.metaPixelId;
    const escolha = ler("pia-cookies-v1");
    if (escolha === "aceito") carregarMedicao();
    else if (!escolha && temMedicao) setTimeout(mostrarAviso, 1200);
  }
  $$("[data-abrir-cookies]").forEach((b) => b.addEventListener("click", mostrarAviso));

  /* Topo: reforça o vidro depois do início da página */
  const topo = $("[data-topo]");
  const aoRolar = () => topo && topo.classList.toggle("topo--rolado", scrollY > 8);
  addEventListener("scroll", aoRolar, { passive: true }); aoRolar();

  /* Submenus (desktop) */
  const gatilhos = $$("[data-gatilho]");
  const fecharTodos = (exceto) => gatilhos.forEach((g) => { if (g !== exceto) { g.setAttribute("aria-expanded", "false"); $("#" + g.getAttribute("aria-controls")).classList.remove("is-aberto"); } });
  const abrir = (g, abre) => {
    fecharTodos(abre ? g : null);
    g.setAttribute("aria-expanded", String(abre));
    $("#" + g.getAttribute("aria-controls")).classList.toggle("is-aberto", abre);
  };
  gatilhos.forEach((g) => {
    const item = g.closest(".menu__item");
    let timer;
    g.addEventListener("click", () => abrir(g, g.getAttribute("aria-expanded") !== "true"));
    if (ponteiroFino) {
      item.addEventListener("pointerenter", () => { clearTimeout(timer); timer = setTimeout(() => abrir(g, true), 60); });
      item.addEventListener("pointerleave", () => { clearTimeout(timer); timer = setTimeout(() => abrir(g, false), 180); });
    }
  });
  document.addEventListener("click", (e) => { if (!e.target.closest(".menu__item")) fecharTodos(); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const aberto = gatilhos.find((g) => g.getAttribute("aria-expanded") === "true");
    if (aberto) { abrir(aberto, false); aberto.focus(); }
    if (gaveta && !gaveta.hidden) { fecharGaveta(); botaoGaveta.focus(); }
  });

  /* Gaveta (celular) */
  const gaveta = $("[data-gaveta]");
  const botaoGaveta = $("[data-abrir-menu]");
  function fecharGaveta() { gaveta.hidden = true; botaoGaveta.setAttribute("aria-expanded", "false"); }
  if (gaveta && botaoGaveta) {
    botaoGaveta.addEventListener("click", () => {
      if (!gaveta.hidden) return fecharGaveta();
      gaveta.hidden = false; gaveta.classList.add("is-entrando");
      botaoGaveta.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => requestAnimationFrame(() => gaveta.classList.remove("is-entrando")));
    });
    $$("a", gaveta).forEach((a) => a.addEventListener("click", fecharGaveta));
  }

  /* Reflexo especular do vidro segue o cursor */
  if (ponteiroFino && !reduzido) {
    $$(".vidro").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        el.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* Seletor de cores do iPhone 18 Pro */
  const fotoIphone = $("[data-iphone]");
  const botoesCor = $$("[data-cor]");
  const nomeCor = $("[data-cor-atual]");
  botoesCor.forEach((b) => { const i = new Image(); i.src = "assets/img/iphone18-" + b.dataset.cor + "-1400.webp"; });
  botoesCor.forEach((b) => b.addEventListener("click", () => {
    if (b.getAttribute("aria-pressed") === "true") return;
    botoesCor.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
    corAtual = b.dataset.nome;
    if (nomeCor) nomeCor.textContent = corAtual;
    atualizarWhats();
    if (!fotoIphone) return;
    fotoIphone.classList.add("is-trocando");
    setTimeout(() => {
      fotoIphone.src = "assets/img/iphone18-" + b.dataset.cor + "-1400.webp";
      fotoIphone.alt = "iPhone 18 Pro na cor " + corAtual + ", visto de costas";
      fotoIphone.decode().catch(() => {}).then(() => fotoIphone.classList.remove("is-trocando"));
    }, reduzido ? 0 : 160);
  }));

  /* Mapa do Google: só carrega quando o visitante pede */
  $$("[data-carregar-mapa]").forEach((b) => b.addEventListener("click", () => {
    const caixa = b.closest("[data-mapa]");
    caixa.innerHTML = "";
    const f = document.createElement("iframe");
    f.src = C.mapaEmbed; f.title = "Mapa: Piá Importados, Rua São Paulo, 818, Centro, Belo Horizonte";
    f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade";
    caixa.appendChild(f); caixa.classList.add("is-carregado");
  }));

  /* Passos da experiência: troca a foto conforme o passo no centro da tela */
  const passos = $$("[data-passo]");
  if (passos.length) {
    const fotos = $$("[data-passo-foto]");
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        const n = en.target.dataset.passo;
        passos.forEach((p) => p.classList.toggle("is-ativo", p === en.target));
        fotos.forEach((f) => f.classList.toggle("is-ativa", f.dataset.passoFoto === n));
      });
    }, { rootMargin: "-45% 0px -45% 0px" });
    passos.forEach((p) => io.observe(p));
    passos[0].classList.add("is-ativo");
  }

  /* Navegação interna das páginas de categoria */
  const subLinks = $$("[data-subnav] a");
  if (subLinks.length) {
    const alvos = subLinks.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        subLinks.forEach((a) => a.setAttribute("aria-current", String(a.getAttribute("href") === "#" + en.target.id)));
        const ativo = subLinks.find((a) => a.getAttribute("aria-current") === "true");
        if (ativo) ativo.scrollIntoView({ block: "nearest", inline: "center", behavior: reduzido ? "auto" : "smooth" });
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    alvos.forEach((s) => io.observe(s));
  }

  /* Contadores */
  function contar(el) {
    const alvo = parseFloat(el.dataset.contar);
    const casas = parseInt(el.dataset.decimais || "0", 10);
    const fmt = (v) => v.toFixed(casas).replace(".", ",");
    if (reduzido) { el.textContent = fmt(alvo); return; }
    const inicio = performance.now(), dur = 1100;
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / dur);
      const e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(alvo * e);
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  /* Fim da entrada: marca o elemento e devolve transform/filter ao CSS (hover e toque voltam a valer) */
  function revelado(el) {
    el.setAttribute("data-revelado", "");
    if (window.gsap) window.gsap.set(el, { clearProps: "transform,filter,opacity" });
    else { el.style.transition = ""; el.style.opacity = ""; el.style.transform = ""; el.style.filter = ""; }
  }

  /* Sublinks com efeito Dock (mesma física do componente Dock: massa 0.1, rigidez 150, amortecimento 12).
     Cada texto cresce até 1.18x conforme a distância do cursor (200px). Só com mouse e sem "reduzir movimento". */
  function dock(barra) {
    const links = $$("a", barra);
    const MAX = 1.18, DIST = 200, K = 150, C = 12, M = 0.1;
    const estado = links.map(() => ({ s: 1, v: 0 }));
    let centros = [], mx = null, rodando = false, ultimo = 0;
    const medir = () => { centros = links.map((a) => { const r = a.getBoundingClientRect(); return r.left + r.width / 2; }); };
    function quadro(t) {
      const dt = Math.min(0.032, ultimo ? (t - ultimo) / 1000 : 0.016); ultimo = t;
      const passos = Math.ceil(dt / 0.004), h = dt / passos;
      let ativo = false;
      estado.forEach((o, i) => {
        const alvo = mx === null ? 1 : 1 + (MAX - 1) * Math.max(0, 1 - Math.abs(mx - centros[i]) / DIST);
        for (let p = 0; p < passos; p++) { const a = (-K * (o.s - alvo) - C * o.v) / M; o.v += a * h; o.s += o.v * h; }
        if (Math.abs(o.s - alvo) > 0.0005 || Math.abs(o.v) > 0.001) ativo = true;
        links[i].style.transform = o.s === 1 ? "" : `scale(${o.s.toFixed(4)})`;
      });
      if (ativo) requestAnimationFrame(quadro);
      else { rodando = false; ultimo = 0; if (mx === null) links.forEach((a) => { a.style.transform = ""; }); barra.classList.toggle("is-dock", mx !== null); }
    }
    const iniciar = () => { if (!rodando) { rodando = true; barra.classList.add("is-dock"); requestAnimationFrame(quadro); } };
    barra.addEventListener("pointerenter", () => { medir(); });
    barra.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; if (!centros.length) medir(); mx = e.clientX; iniciar(); });
    barra.addEventListener("pointerleave", () => { mx = null; iniciar(); });
    barra.addEventListener("scroll", medir, { passive: true });
    addEventListener("resize", medir);
  }
  if (ponteiroFino && !reduzido) $$("[data-subnav]").forEach(dock);

  /* Animações de scroll (GSAP + ScrollTrigger). Sem GSAP, cai no plano B. */
  function semGsap() {
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.style.transition = "opacity 700ms cubic-bezier(0.23, 1, 0.32, 1), transform 700ms cubic-bezier(0.23, 1, 0.32, 1), filter 700ms cubic-bezier(0.23, 1, 0.32, 1)";
        el.style.opacity = "1"; el.style.transform = "none"; el.style.filter = "none";
        setTimeout(() => revelado(el), 720);
        $$("[data-contar]", el).forEach(contar);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    $$("[data-revelar], [data-ponto]").forEach((el) => io.observe(el));
  }

  function comGsap() {
    const { gsap, ScrollTrigger, CustomEase } = window;
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    CustomEase.create("saida", "0.23, 1, 0.32, 1");
    CustomEase.create("movimento", "0.77, 0, 0.175, 1");

    /* Revelar ao entrar na tela (scroll-triggered, uma vez só) */
    ScrollTrigger.batch("[data-revelar]", {
      start: "top 90%",
      once: true,
      onEnter: (lote) => {
        gsap.to(lote, {
          opacity: 1, y: 0, filter: "blur(0px)", duration: reduzido ? 0.3 : 0.7, ease: "saida", stagger: 0.06, overwrite: true,
          onComplete: () => lote.forEach(revelado),
        });
        lote.forEach((el) => $$("[data-contar]", el).forEach(contar));
      },
    });

    const mm = gsap.matchMedia();

    mm.add({ sempre: "(min-width: 0px)", movimento: "(prefers-reduced-motion: no-preference)", largo: "(min-width: 861px)" }, (ctx) => {
      const { movimento, largo } = ctx.conditions;

      /* Hero: entrada dos iPhones e leque ligado ao scroll */
      const fones = $$(".hero__iphone");
      if (fones.length === 3) {
        gsap.set(fones[0], { rotation: -9 });
        gsap.set(fones[1], { rotation: -2 });
        gsap.set(fones[2], { rotation: 7 });
        if (movimento) {
          gsap.from(fones, { y: 90, opacity: 0, duration: 1.1, ease: "saida", stagger: 0.09, delay: 0.1 });
          gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 0.6 } })
            .to(fones[0], { xPercent: -16, yPercent: -4, rotation: -15, ease: "none" }, 0)
            .to(fones[1], { yPercent: -12, rotation: 0, ease: "none" }, 0)
            .to(fones[2], { xPercent: 16, yPercent: -2, rotation: 13, ease: "none" }, 0)
            .to(".hero__texto", { yPercent: -14, opacity: 0.25, ease: "none" }, 0);
        }
      }

      /* iPhone 18 Pro: seção fixa (pin) com o aparelho crescendo e girando no scroll */
      const fixo = $("[data-fixar]");
      if (fixo) {
        const pontos = $$("[data-ponto]", fixo);
        if (movimento && largo) {
          gsap.timeline({ scrollTrigger: { trigger: fixo, start: "top top", end: "+=110%", pin: true, scrub: 0.6, anticipatePin: 1 } })
            .fromTo(".destaque__iphone", { scale: 0.78, rotation: -8, yPercent: 10 }, { scale: 1, rotation: 0, yPercent: 0, ease: "none", duration: 1 }, 0)
            .fromTo(".destaque__brilho", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, ease: "none", duration: 0.8 }, 0)
            .to(pontos, { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.18, duration: 0.3, ease: "none" }, 0.25);
        } else {
          gsap.to(pontos, { opacity: 1, y: 0, filter: "blur(0px)", duration: movimento ? 0.7 : 0.3, ease: "saida", stagger: 0.06, scrollTrigger: { trigger: fixo, start: "top 70%", once: true }, onComplete: () => pontos.forEach(revelado) });
          if (movimento) gsap.fromTo(".destaque__iphone", { scale: 0.86 }, { scale: 1, ease: "none", scrollTrigger: { trigger: fixo, start: "top bottom", end: "center center", scrub: 0.6 } });
        }
      }

      /* Parallax nas fotos reais (scroll-linked) */
      if (movimento) {
        $$("[data-parallax]").forEach((img) => {
          gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
        });
        $$("[data-parallax-forte]").forEach((img) => {
          gsap.fromTo(img, { yPercent: -14 }, { yPercent: 4, ease: "none", scrollTrigger: { trigger: img.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
        });
      }
    });

    addEventListener("load", () => ScrollTrigger.refresh());
  }

  function iniciarAnimacoes() {
    if (window.gsap && window.ScrollTrigger && window.CustomEase) comGsap();
    else semGsap();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciarAnimacoes);
  else iniciarAnimacoes();
})();
