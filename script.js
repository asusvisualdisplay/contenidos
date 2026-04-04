// CONFIGURACIÓN - IMPORTANTE: AJUSTA ESTOS DOS NOMBRES
const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; 

const gallery = document.getElementById('gallery');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('modelSearch');

let allFiles = []; 

async function showSection(carpeta) {
    gallery.innerHTML = "<div class='welcome-msg'><h3>Cargando " + carpeta + "...</h3></div>";
    searchBar.style.display = "block";
    
    const url = `https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`;
    
    try {
        const res = await fetch(url);
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error();

        allFiles = data.filter(f => f.type === "file");
        renderContent(allFiles, carpeta);

        // Buscador filtrando en vivo
        searchInput.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            const filtered = allFiles.filter(f => f.name.toLowerCase().includes(val));
            renderContent(filtered, carpeta);
        };

    } catch (e) {
        gallery.innerHTML = `<div class='welcome-msg'><h3>❌ Error</h3><p>No se encontró la carpeta '${carpeta}'. Asegúrate de que exista en GitHub y tenga archivos.</p></div>`;
    }
}

function renderContent(list, type) {
    gallery.innerHTML = "";
    if (list.length === 0) {
        gallery.innerHTML = "<p class='welcome-msg'>Carpeta vacía.</p>";
        return;
    }

    list.forEach(file => {
        const cleanName = file.name.split('.')[0].replace(/-/g, ' ');
        const card = document.createElement('div');
        card.className = 'card';

        // Lógica de Imagen vs Icono
        let visual = "";
        if (type === 'wallpapers') {
            // INTENTO DE MINIATURA: Busca en carpeta 'thumbs' si existe, si no usa el original
            const thumbUrl = file.download_url.replace('/wallpapers/', '/thumbs/');
            visual = `<img src="${thumbUrl}" onerror="this.src='${file.download_url}'" class="preview-img" loading="lazy">`;
        } else {
            let icon = (type === 'demos') ? "💾" : "📕";
            visual = `<div style="font-size:50px; padding:30px; background:#f9f9f9; text-align:center">${icon}</div>`;
        }

        card.innerHTML = `
            ${visual}
            <div class="info">
                <h3 style="font-size:0.9rem; margin:0">${cleanName}</h3>
                <a href="${file.download_url}" download class="download-link">DESCARGAR</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}