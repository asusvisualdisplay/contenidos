const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; 

const gallery = document.getElementById('gallery');
const navSearchWrapper = document.getElementById('navSearchWrapper');
const searchInput = document.getElementById('modelSearch');
const zipContainer = document.getElementById('zip-button-container');
const heroMain = document.getElementById('hero-main');
const requestSection = document.getElementById('request-section');

function openRequestForm() {
    heroMain.style.display = "none";
    gallery.innerHTML = "";
    zipContainer.innerHTML = "";
    navSearchWrapper.style.display = "none";
    requestSection.style.display = "flex";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function showSection(carpeta) {
    requestSection.style.display = "none";
    heroMain.style.display = "flex";
    navSearchWrapper.style.display = "block";
    gallery.style.minHeight = "100vh";
    window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
    
    gallery.innerHTML = "<div style='text-align:center; width:100%; padding:100px; opacity:0.5; font-size:0.9rem;'>CARGANDO PORTAL INDUSTRIAL...</div>";
    zipContainer.innerHTML = ""; 

    try {
        if (carpeta === 'wallpapers') {
            const res = await fetch(`https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`);
            const files = await res.json();
            if (!Array.isArray(files)) throw new Error();
            
            const listaArchivos = files.filter(f => f.type === "file");

            if (listaArchivos.length > 0) {
                zipContainer.innerHTML = `
                    <button class="btn-download-all" onclick="downloadZip()">
                        📦 DESCARGAR TODO EL PACK (.ZIP)
                    </button>`;
            }

            const datosMapeados = listaArchivos.map(f => ({
                nombre: f.name.split('.')[0].replace(/-/g, ' ').toUpperCase(),
                imagen: f.download_url,
                link: f.download_url,
                archivo_nombre: f.name
            }));

            setupBuscadorAndRender(datosMapeados);
        } 
        else {
            const res = await fetch(`https://raw.githubusercontent.com/${usuario}/${repo}/main/${carpeta}/config.json`);
            const datos = await res.json();

            const datosMapeados = datos.map(item => ({
                nombre: item.nombre.toUpperCase(),
                imagen: item.imagen,
                link: item.link_descarga,
                archivo_nombre: item.nombre
            }));

            setupBuscadorAndRender(datosMapeados);
        }

    } catch (e) {
        gallery.innerHTML = "<div style='text-align:center; width:100%; padding:100px; color:#ff4444; font-size:0.9rem;'>❌ ERROR DE CARGA: Revisa que exista el archivo config.json en tu repositorio.</div>";
    }
}

function setupBuscadorAndRender(items) {
    renderContent(items);
    searchInput.oninput = (e) => {
        const val = e.target.value.toLowerCase();
        const filtrados = items.filter(item => item.nombre.toLowerCase().includes(val));
        renderContent(filtrados);
    };
}

function renderContent(list) {
    gallery.innerHTML = "";
    if (list.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; width:100%; opacity:0.4; padding:60px; font-size:0.9rem;'>No se encontraron registros de este modelo.</p>";
        return;
    }

    list.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <a href="${item.link}" target="_blank" class="img-link-wrapper">
                <img src="${item.imagen}" class="preview-img" loading="lazy" alt="${item.nombre}">
            </a>
            <div class="info">
                <h3>${item.nombre}</h3>
                <a href="${item.link}" data-name="${item.archivo_nombre}" target="_blank" class="download-link">DESCARGAR</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}

async function downloadZip() {
    const btn = document.querySelector('.btn-download-all');
    const links = document.querySelectorAll('.download-link');
    if (!confirm(`Se procesarán y empaquetarán ${links.length} imágenes. ¿Proceder con la descarga masiva?`)) return;

    btn.innerHTML = "🌀 COMPRIMIENDO PAQUETE...";
    btn.disabled = true;

    const zip = new JSZip();
    try {
        const promises = Array.from(links).map(async (link) => {
            const response = await fetch(link.href);
            const blob = await response.blob();
            const name = link.getAttribute('data-name') || "wallpaper.jpg";
            zip.file(name, blob);
        });

        await Promise.all(promises);
        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "Pack_Wallpapers_AsusDisplay.zip";
        a.click();
    } catch (e) {
        alert("Ocurrió un error al compilar los archivos.");
    } finally {
        btn.innerHTML = "📦 DESCARGAR TODO EL PACK (.ZIP)";
        btn.disabled = false;
    }
}

// =========================================================================
// INTERCEPTOR SEGURO CONECTADO DE FORMA PRIVADA A FORMSPREE
// =========================================================================
document.getElementById('wallpaper-form')?.addEventListener('submit', async function(e) {
    e.preventDefault(); 
    
    const btn = this.querySelector('.btn-submit');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "🌀 Enviando datos...";
    btn.disabled = true;

    const formData = new FormData(this);

    // TODO: REEMPLAZA "TU_ID_AQUÍ" CON EL ID QUE TE DA FORMSPREE AL CREAR TU FORMULARIO
    const urlServicio = "https://formspree.io/f/xvzlewvj";

    try {
        const response = await fetch(urlServicio, {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            alert("¡Petición recibida al tiro, compadre! Buscaremos los contenidos para subirlos.");
            location.reload(); 
        } else {
            throw new Error();
        }
    } catch (error) {
        alert("Hubo un detalle al conectar con Formspree. Revisa que tu ID esté bien copiado en el script.js.");
        btn.innerHTML = textoOriginal;
        btn.disabled = false;
    }
});