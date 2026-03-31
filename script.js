// CONFIGURACIÓN DE TU REPOSITORIO
const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; // Asegúrate que este nombre sea el exacto de tu repo en GitHub

const gallery = document.getElementById('gallery');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('modelSearch');

let currentFiles = []; // Memoria temporal para la búsqueda

async function showSection(carpeta) {
    gallery.innerHTML = "<div class='welcome-msg'><h3>Cargando archivos de " + carpeta + "...</h3></div>";
    searchBar.style.display = "block";
    
    // URL de la API de GitHub
    const url = `https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();

        if (response.status === 200) {
            currentFiles = data.filter(item => item.type === "file");
            renderList(currentFiles, carpeta);

            // Activar buscador para esta sección específica
            searchInput.oninput = (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = currentFiles.filter(f => f.name.toLowerCase().includes(term));
                renderList(filtered, carpeta);
            };
        } else {
            throw new Error();
        }
    } catch (error) {
        gallery.innerHTML = "<div class='welcome-msg'><h3>❌ Error</h3><p>No se pudo acceder a la carpeta '" + carpeta + "'. Revisa que el nombre del repo y carpeta sean correctos.</p></div>";
    }
}

function renderList(list, type) {
    gallery.innerHTML = "";
    if (list.length === 0) {
        gallery.innerHTML = "<div class='welcome-msg'><p>No hay archivos en esta sección.</p></div>";
        return;
    }

    list.forEach(file => {
        const cleanName = file.name.split('.')[0].replace(/-/g, ' ');
        const card = document.createElement('div');
        card.className = 'card';

        // Si es wallpaper muestra imagen, si no, muestra icono
        let visualHTML = "";
        if (type === 'wallpapers') {
            visualHTML = `<img src="${file.download_url}" class="preview-img" loading="lazy">`;
        } else {
            let icon = (type === 'demos') ? "⚙️" : "📕";
            visualHTML = `<div class="icon-placeholder">${icon}</div>`;
        }

        card.innerHTML = `
            ${visualHTML}
            <div class="info">
                <h3 style="text-transform: uppercase; font-size: 1rem;">${cleanName}</h3>
                <a href="${file.download_url}" download class="download-link">DESCARGAR</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}