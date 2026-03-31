// 1. Configuración de tu repo
const usuario = "TU_USUARIO_DE_GITHUB"; 
const repo = "NOMBRE_DE_TU_REPOSITORIO";
const carpeta = "wallpapers";

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('modelSearch');

// 2. Función para obtener archivos automáticamente desde la API de GitHub
async function cargarWallpapers() {
    const url = `https://api.github.com/repos/${usuario}/${repo}/contents/${carpeta}`;
    
    try {
        const respuesta = await fetch(url);
        const archivos = await respuesta.json();

        // Filtramos para que solo lea imágenes (jpg, png, webp)
        const imagenes = archivos.filter(archivo => 
            archivo.name.match(/\.(jpg|jpeg|png|webp)$/i)
        );

        renderGallery(imagenes);

        // Escuchar el buscador
        searchInput.addEventListener('input', (e) => {
            const filtrados = imagenes.filter(img => 
                img.name.toLowerCase().includes(e.target.value.toLowerCase())
            );
            renderGallery(filtrados);
        });

    } catch (error) {
        console.error("Error al cargar los archivos:", error);
        gallery.innerHTML = "<p>Error al conectar con la galería.</p>";
    }
}

// 3. Función para dibujar las tarjetas
function renderGallery(lista) {
    gallery.innerHTML = "";
    
    lista.forEach(img => {
        // Limpiamos el nombre del archivo para que se vea bien (quitamos el .jpg)
        const nombreLimpio = img.name.split('.')[0].replace(/-/g, ' ');

        const card = document.createElement('div');
        card.className = 'wallpaper-card';
        card.innerHTML = `
            <img src="${img.download_url}" alt="${nombreLimpio}" class="preview-img" loading="lazy">
            <div class="info">
                <h3 class="model-name">${nombreLimpio}</h3>
                <p>Calidad: Alta Resolución</p>
                <a href="${img.download_url}" download class="download-link">Descargar</a>
            </div>
        `;
        gallery.appendChild(card);
    });
}

// Iniciar proceso
cargarWallpapers();