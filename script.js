const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; // Asegúrate de que este sea el nombre exacto de tu repo

const gallery = document.getElementById('gallery');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('modelSearch');

async function showSection(carpeta) {
    searchContainer.style.display = "flex";
    gallery.style.minHeight = "100vh";
    window.scrollTo({ top: window.innerHeight - 50, behavior: 'smooth' });
    
    gallery.innerHTML = "<p style='text-align:center; width:100%; opacity:0.6;'>Cargando archivos...</p>";

    try {
        const res = await fetch(`https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`);
        const files = await res.json();

        if (!Array.isArray(files)) throw new Error();

        const listaFiltrada = files.filter(f => f.type === "file");
        render(listaFiltrada, carpeta);

        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = listaFiltrada.filter(f => f.name.toLowerCase().includes(term));
            render(filtered, carpeta);
        };

    } catch (e) {
        gallery.innerHTML = "<p style='text-align:center; width:100%; color:#e74c3c;'>Error: Revisa que la carpeta '" + carpeta + "' exista y el repo sea público.</p>";
    }
}

function render(list, type) {
    gallery.innerHTML = "";
    if (list.length === 0) {
        gallery.innerHTML = "<p style='text-align:center; width:100%; opacity:0.5;'>No hay archivos aquí.</p>";
        return;
    }

    list.forEach(file => {
        const card = document.createElement('div');
        card.className = 'card';
        const cleanName = file.name.split('.')[0].replace(/-/g, ' ');

        let media = (type === 'wallpapers') 
            ? `<img src="${file.download_url}" class="preview-img" loading="lazy">`
            : `<div style="font-size:50px; padding:50px; text-align:center;">📄</div>`;

        card.innerHTML = `
            ${media}
            <div class="info">
                <h3 style="font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">${cleanName}</h3>
                <a href="${file.download_url}" download class="download-link">DESCARGAR</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}