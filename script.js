// CONFIGURACIÓN DE TU REPOSITORIO
const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; 

const gallery = document.getElementById('gallery');
const navSearchWrapper = document.getElementById('navSearchWrapper');
const searchInput = document.getElementById('modelSearch');
const zipContainer = document.getElementById('zip-button-container');

async function showSection(carpeta) {
    // Activar buscador en Navbar
    navSearchWrapper.style.display = "block";
    
    // Scroll suave hacia abajo para mostrar resultados
    gallery.style.minHeight = "100vh";
    window.scrollTo({ 
        top: window.innerHeight - 80, 
        behavior: 'smooth' 
    });
    
    gallery.innerHTML = "<div style='text-align:center; width:100%; padding:100px; opacity:0.5;'>Cargando portal...</div>";

    try {
        const res = await fetch(`https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`);
        const files = await res.json();

        if (!Array.isArray(files)) throw new Error();

        const listaArchivos = files.filter(f => f.type === "file");

        // Lógica del botón ZIP (SÓLO para wallpapers)
        if (carpeta === 'wallpapers' && listaArchivos.length > 0) {
            zipContainer.innerHTML = `
                <button class="btn-download-all" onclick="downloadZip()">
                    📦 DESCARGAR TODO EL PACK (.ZIP)
                </button>`;
        } else {
            // Limpiar si no es wallpapers para evitar descuadres
            zipContainer.innerHTML = "";
        }

        renderContent(listaArchivos, carpeta);

        // Buscador vinculado a la Navbar
        searchInput.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            const filtrados = listaArchivos.filter(f => f.name.toLowerCase().includes(val));
            renderContent(filtrados, carpeta);
        };

    } catch (e) {
        gallery.innerHTML = "<div style='text-align:center; width:100%; padding:100px; color:#ff4444;'>❌ Error de conexión con el repositorio.</div>";
    }
}

async function downloadZip() {
    const btn = document.querySelector('.btn-download-all');
    const links = document.querySelectorAll('.download-link');
    if (!confirm(`Se comprimirán ${links.length} archivos. ¿Deseas continuar?`)) return;

    btn.innerHTML = "🌀 Procesando ZIP...";
    btn.disabled = true;

    const zip = new JSZip();
    try {
        const promises = Array.from(links).map(async (link) => {
            const response = await fetch(link.href);
            const blob = await response.blob();
            // Asegurarnos de usar el nombre del atributo data-name
            const name = link.getAttribute('data-name') || "archivo.jpg";
            zip.file(name, blob);
        });

        await Promise.all(promises);
        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "AsusVisualDisplay_Pack.zip";
        a.click();
    } catch (e) {
        alert("Error al generar el ZIP.");
    } finally {
        btn.innerHTML = "📦 DESCARGAR TODO EL PACK (.ZIP)";
        btn.disabled = false;
    }
}

function renderContent(list, type) {
    gallery.innerHTML = "";
    
    if (list.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; width:100%; opacity:0.5; padding:50px;'>No se encontraron resultados.</p>";
        return;
    }

    list.forEach(file => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Limpiar el nombre para el título
        const cleanName = file.name.split('.')[0].replace(/-/g, ' ').toUpperCase();

        let mediaHTML = "";
        if (type === 'wallpapers') {
            mediaHTML = `<img src="${file.download_url}" class="preview-img" loading="lazy">`;
        } else {
            mediaHTML = `<div style="font-size:50px; padding:50px; text-align:center;">📄</div>`;
        }

        card.innerHTML = `
            ${mediaHTML}
            <div class="info">
                <h3>${cleanName}</h3>
                <a href="${file.download_url}" data-name="${file.name}" class="download-link">DESCARGAR</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}