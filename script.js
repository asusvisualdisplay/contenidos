// CONFIGURACIÓN DE TU REPOSITORIO
const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; 

const gallery = document.getElementById('gallery');
const navSearchWrapper = document.getElementById('navSearchWrapper');
const searchInput = document.getElementById('modelSearch');

async function showSection(carpeta) {
    // Activar buscador en Navbar
    navSearchWrapper.style.display = "block";
    
    // Scroll suave hacia abajo para mostrar resultados
    gallery.style.minHeight = "100vh";
    window.scrollTo({ 
        top: window.innerHeight - 80, 
        behavior: 'smooth' 
    });
    
    gallery.innerHTML = "<div style='text-align:center; width:100%; padding:100px; opacity:0.5;'>Sincronizando con el servidor industrial...</div>";

    try {
        const res = await fetch(`https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`);
        const files = await res.json();

        if (!Array.isArray(files)) throw new Error();

        const listaArchivos = files.filter(f => f.type === "file");
        renderContent(listaArchivos, carpeta);

        // Buscador vinculado a la Navbar
        searchInput.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            const filtrados = listaArchivos.filter(f => f.name.toLowerCase().includes(val));
            renderContent(filtrados, carpeta);
        };

    } catch (e) {
        gallery.innerHTML = "<div style='text-align:center; width:100%; padding:100px; color:#ff4444;'>❌ Error: Asegúrate de que la carpeta exista en GitHub.</div>";
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
            let icon = (type === 'demos') ? "💾" : "📄";
            mediaHTML = `<div style="font-size:60px; padding:60px; text-align:center; background:#050505;">${icon}</div>`;
        }

        card.innerHTML = `
            ${mediaHTML}
            <div class="info">
                <h3>${cleanName}</h3>
                <a href="${file.download_url}" download="${file.name}" class="download-link">DESCARGAR</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}