const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; 

const gallery = document.getElementById('gallery');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('modelSearch');

async function showSection(carpeta) {
    // Desplazamiento suave a la galería
    gallery.style.minHeight = "100vh";
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    
    searchContainer.style.display = "flex";
    gallery.innerHTML = "<p style='text-align:center; width:100%;'>Loading resources...</p>";

    try {
        const res = await fetch(`https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`);
        const files = await res.json();

        if (!Array.isArray(files)) throw new Error();

        render(files, carpeta);

        // Buscador en tiempo real
        searchInput.oninput = (e) => {
            const filtered = files.filter(f => f.name.toLowerCase().includes(e.target.value.toLowerCase()));
            render(filtered, carpeta);
        };

    } catch (e) {
        gallery.innerHTML = "<p style='text-align:center; width:100%;'>Error: Carpeta no encontrada o repo privado.</p>";
    }
}

function render(list, type) {
    gallery.innerHTML = "";
    list.forEach(file => {
        if (file.type !== "file") return;
        
        const card = document.createElement('div');
        card.className = 'card';
        const cleanName = file.name.split('.')[0].replace(/-/g, ' ');

        let media = (type === 'wallpapers') 
            ? `<img src="${file.download_url}" class="preview-img" loading="lazy">`
            : `<div style="font-size:40px; padding:40px; text-align:center;">📄</div>`;

        card.innerHTML = `
            ${media}
            <div class="info">
                <h3 style="font-size:0.8rem; text-transform:uppercase; opacity:0.7;">${cleanName}</h3>
                <a href="${file.download_url}" download class="download-link">DOWNLOAD</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}