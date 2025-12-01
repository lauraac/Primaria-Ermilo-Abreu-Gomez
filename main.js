// MENU MOBILE
const navToggle = document.getElementById("navToggle");
const nav = document.getElementById("nav");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("nav--open");
  });

  // Cerrar menú al dar clic en un link
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("nav--open");
    });
  });
}

// AÑO EN FOOTER
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// CONTADOR DE CUPOS (animación numérica)
const cuposElemento = document.getElementById("cuposNumero");
const CUPOS_META = 100; // Cambia este número según tus lugares

if (cuposElemento) {
  let actual = 0;
  const paso = Math.max(1, Math.round(CUPOS_META / 60)); // frames
  const interval = setInterval(() => {
    actual += paso;
    if (actual >= CUPOS_META) {
      actual = CUPOS_META;
      clearInterval(interval);
    }
    cuposElemento.textContent = actual;
  }, 40);
}

// CHIP DEL HERO CON FRASES ROTATIVAS
const heroChipText = document.getElementById("heroChipText");
const frasesChip = [
  "Inscripciones abiertas",
  "Cupos disponibles · ¡Te esperamos!",
  "Lugar seguro y cercano",
];

let idxFrase = 0;

if (heroChipText) {
  setInterval(() => {
    idxFrase = (idxFrase + 1) % frasesChip.length;
    heroChipText.classList.add("fade-out");
    setTimeout(() => {
      heroChipText.textContent = frasesChip[idxFrase];
      heroChipText.classList.remove("fade-out");
      heroChipText.classList.add("fade-in");
      setTimeout(() => heroChipText.classList.remove("fade-in"), 250);
    }, 220);
  }, 3500);
}

// SCROLL REVEAL CON INTERSECTION OBSERVER
const animatedElements = document.querySelectorAll("[data-animate]");

if ("IntersectionObserver" in window && animatedElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  animatedElements.forEach((el) => observer.observe(el));
} else {
  // Fallback por si el navegador es viejito
  animatedElements.forEach((el) => el.classList.add("is-visible"));
}

// FORMULARIO DE OPINIONES (sin backend, solo en pantalla)
const formOpinion = document.getElementById("formOpinion");
const opinionesList = document.getElementById("opinionesList");

if (formOpinion && opinionesList) {
  formOpinion.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreOpinion").value.trim();
    const texto = document.getElementById("textoOpinion").value.trim();

    if (!nombre || !texto) return;

    const article = document.createElement("article");
    article.className = "opinion-card";

    const p = document.createElement("p");
    p.textContent = `“${texto}”`;

    const span = document.createElement("span");
    span.className = "opinion-name";
    span.textContent = `— ${nombre}`;

    article.appendChild(p);
    article.appendChild(span);

    opinionesList.prepend(article); // la nueva opinión aparece hasta arriba

    formOpinion.reset();
  });
}
