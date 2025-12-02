// URL del Apps Script de opiniones (WEB APP /exec)
const OPINIONES_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyH1HXBz1Rsw04jKA5xijy_FUWvY4ZXkTTzKCQVpHuTYW4Fm4XQrMqKMMOG2f0NheNyhQ/exec";

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

// FORMULARIO DE OPINIONES con backend (Google Sheets)
const formOpinion = document.getElementById("formOpinion");
const opinionesList = document.getElementById("opinionesList");

// Cambia a true solo cuando tú quieras ver el botón "Eliminar"
window.MODO_ADMIN = false;
// Debe ser la MISMA clave que pusiste en ADMIN_PASS del Apps Script
window.ADMIN_PASS = "ermilo2025Admin";

function crearOpinionElemento(opinion) {
  const article = document.createElement("article");
  article.className = "opinion-card";
  article.dataset.idOpinion = opinion.id;

  const p = document.createElement("p");
  p.textContent = `“${opinion.texto}”`;

  const span = document.createElement("span");
  span.className = "opinion-name";
  span.textContent = `— ${opinion.nombre}`;

  article.appendChild(p);
  article.appendChild(span);

  // Botón borrar solo si estás en modo admin
  if (window.MODO_ADMIN) {
    const btnDelete = document.createElement("button");
    btnDelete.type = "button";
    btnDelete.textContent = "Eliminar";
    btnDelete.className = "btn btn-delete-opinion";
    btnDelete.addEventListener("click", () => {
      if (confirm("¿Eliminar este mensaje?")) {
        eliminarOpinion(opinion.id, article);
      }
    });
    article.appendChild(btnDelete);
  }

  return article;
}

async function cargarOpiniones() {
  if (!opinionesList) return;
  try {
    const res = await fetch(OPINIONES_SCRIPT_URL + "?action=list");
    const data = await res.json();
    if (!data.ok) {
      console.error("Error al cargar opiniones:", data.error);
      return;
    }

    opinionesList.innerHTML = "";
    // Que las más nuevas se vean arriba
    data.opiniones.reverse().forEach((op) => {
      const el = crearOpinionElemento(op);
      opinionesList.appendChild(el);
    });
  } catch (err) {
    console.error("Error de red al cargar opiniones:", err);
  }
}

async function enviarOpinion(nombre, texto) {
  try {
    const res = await fetch(OPINIONES_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, texto }),
    });

    const data = await res.json();

    if (!data.ok) {
      alert("No se pudo guardar tu opinión. Intenta más tarde.");
      console.error("Error al guardar opinión:", data.error);
      return;
    }

    // Crear la opinión con el id que viene del backend
    const opinion = { id: data.id, nombre, texto };
    const el = crearOpinionElemento(opinion);
    // Insertar arriba
    opinionesList.prepend(el);
  } catch (err) {
    alert("Error de conexión al enviar tu opinión.");
    console.error("Error de red al enviar opinión:", err);
  }
}

async function eliminarOpinion(id, articleEl) {
  try {
    const params = new URLSearchParams({
      action: "delete",
      id,
      pass: window.ADMIN_PASS || "",
    });

    const res = await fetch(OPINIONES_SCRIPT_URL + "?" + params.toString());
    const data = await res.json();

    if (!data.ok) {
      alert("No se pudo eliminar. Revisa la clave de admin.");
      console.error("Error al eliminar:", data.error);
      return;
    }

    articleEl.remove();
  } catch (err) {
    alert("Error de conexión al eliminar.");
    console.error("Error de red al eliminar opinión:", err);
  }
}

if (formOpinion && opinionesList) {
  // Cargar las opiniones al abrir la página
  cargarOpiniones();

  formOpinion.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombreOpinion").value.trim();
    const texto = document.getElementById("textoOpinion").value.trim();

    if (!nombre || !texto) return;

    await enviarOpinion(nombre, texto);
    formOpinion.reset();
  });
}

// ===============================
// CARRUSEL DE LA GALERÍA (4 CUADROS, 5 IMÁGENES CADA UNO, DESLIZANDO A LADO)
// ===============================
const galleryItems = document.querySelectorAll("#galleryGrid .gallery-item");

if (galleryItems.length) {
  const galleryData = [
    // Cuadro 1
    [
      { src: "img/imagen3.jpeg", caption: "Festival del Día de las Madres" },
      { src: "img/imagen4.jpeg", caption: "Festival escolar" },
      { src: "img/1.jpeg", caption: "Actividades en el aula" },
      { src: "img/2.jpeg", caption: "Juegos en el patio" },
      { src: "img/imagen3.jpeg", caption: "Momentos en familia" },
    ],
    // Cuadro 2
    [
      { src: "img/imagen4.jpeg", caption: "Honores a la bandera" },
      { src: "img/1.jpeg", caption: "Trabajos de los niños" },
      { src: "img/2.jpeg", caption: "Recreo y convivencia" },
      { src: "img/imagen3.jpeg", caption: "Festival escolar" },
      { src: "img/imagen4.jpeg", caption: "Actos cívicos" },
    ],
    // Cuadro 3
    [
      { src: "img/1.jpeg", caption: "Proyectos en el aula" },
      { src: "img/2.jpeg", caption: "Juegos cooperativos" },
      { src: "img/imagen3.jpeg", caption: "Actividades artísticas" },
      { src: "img/imagen4.jpeg", caption: "Acto cívico" },
      { src: "img/1.jpeg", caption: "Trabajos en equipo" },
    ],
    // Cuadro 4
    [
      { src: "img/2.jpeg", caption: "Juegos en el patio" },
      { src: "img/imagen3.jpeg", caption: "Festival del Día de las Madres" },
      { src: "img/imagen4.jpeg", caption: "Desfile escolar" },
      { src: "img/1.jpeg", caption: "Proyectos y maquetas" },
      { src: "img/2.jpeg", caption: "Convivencia escolar" },
    ],
  ];

  galleryItems.forEach((item, index) => {
    const slides = galleryData[index];
    if (!slides) return;

    const oldImg = item.querySelector("img");
    const caption = item.querySelector("figcaption");
    if (!oldImg || !caption) return;

    // Creamos el contenedor del carrusel
    const slider = document.createElement("div");
    slider.className = "gallery-slider";

    const track = document.createElement("div");
    track.className = "gallery-slider-track";

    // Agregamos las 5 imágenes al track
    slides.forEach((slide) => {
      const img = document.createElement("img");
      img.src = slide.src;
      img.alt = slide.caption;
      track.appendChild(img);
    });

    slider.appendChild(track);

    // Reemplazamos la imagen original por el slider, sin mover el figcaption
    item.insertBefore(slider, oldImg);
    oldImg.remove();

    let current = 0;
    caption.textContent = slides[0].caption;

    setInterval(() => {
      current = (current + 1) % slides.length;
      // Deslizamos el track
      track.style.transform = `translateX(-${current * 100}%)`;
      caption.textContent = slides[current].caption;
    }, 4000); // cada 4 segundos cambia de foto
  });
}
