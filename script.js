const usuario = "asusvisualdisplay"; 
const repo = "contenidos"; 

const gallery = document.getElementById('gallery');
const navSearchWrapper = document.getElementById('navSearchWrapper');
const searchInput = document.getElementById('modelSearch');

async function showSection(carpeta) {
    navSearchWrapper.style.display = "block";
    gallery.style.minHeight = "100vh";
    window.scrollTo({ top: window.innerHeight - 80, behavior: 'smooth' });
    
    gallery.innerHTML = "<p style='text-align:center; width:100%; padding:50px; opacity:0.5;'>Cargando portal...</p>";

    try {
        const res = await fetch(`https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`);
        const files = await res.json();
        const listaArchivos = files.filter(f => f.type === "file");

        let extraHTML = "";
        if (carpeta === 'wallpapers' && listaArchivos.length > 0) {
            extraHTML = `
                <div class="download-all-container">
                    <button class="btn-download-all" onclick="downloadZip()">
                        📦 Descarga Todos Los Wallpapers (.ZIP)
                    </button>
                </div>`;
        }

        render(listaArchivos, carpeta, extraHTML);

        searchInput.oninput = (e) => {
            const val = e.target.value.toLowerCase();
            const filtrados = listaArchivos.filter(f => f.name.toLowerCase().includes(val));
            render(filtrados, carpeta, extraHTML);
        };

    } catch (e) {
        gallery.innerHTML = "<p style='text-align:center; color:red; padding:50px;'>Error de conexión.</p>";
    }
}

async function downloadZip() {
    const btn = document.querySelector('.btn-download-all');
    const links = document.querySelectorAll('.download-link');
    if (links.length === 0) return;

    if (!confirm(`Se comprimirán ${links.length} imágenes. Esto tomará un momento.`)) return;

    btn.innerHTML = "🌀 Comprimiendo...";
    btn.disabled = true;

    const zip = new JSZip();
    try {
        const promises = Array.from(links).map(async (link) => {
            const res = await fetch(link.href);
            const blob = await res.blob();
            const name = link.getAttribute('data-name') || "img_" + Math.random().toString(36).substr(2, 5) + ".jpg";
            zip.file(name, blob);
        });

        await Promise.all(promises);
        const content = await zip.generateAsync({ type: "blob" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(content);
        a.download = "Pack_Wallpapers_AsusVisualDisplay.zip";
        a.click();
    } catch (e) {
        alert("Error al crear el ZIP.");
    } finally {
        btn.innerHTML = "📦 Descarga Todos Los Wallpapers (.ZIP)";
        btn.disabled = false;
    }
}

function render(list, type, extraHTML) {
    gallery.innerHTML = extraHTML;
    list.forEach(file => {
        const card = document.createElement('div');
        card.className = 'card';
        const name = file.name.split('.')[0].replace(/-/g, ' ').toUpperCase();
        
        let visual = (type === 'wallpapers') 
            ? `<img src="${file.download_url}" class="preview-img" loading="lazy">`
            : `<div style="font-size:50px; padding:50px; text-align:center; background:#050505;">📄</div>`;

        card.innerHTML = `
            ${visual}
            <div class="info">
                <h3>${name}</h3>
                <a href="${file.download_url}" data-name="${file.name}" class="download-link">DESCARGAR</a>
            </div>`;
        gallery.appendChild(card);
    });
}