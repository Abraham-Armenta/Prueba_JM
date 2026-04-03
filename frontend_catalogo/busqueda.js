    // 1. Configuración básica (Ajusta la URL si es necesario)
    const STRAPI_URL = "https://dbpinturasjm.onrender.com";

    async function ejecutarBusqueda() {
        // 2. Obtener el término de búsqueda de la URL (?query=lo-que-sea)
        const urlParams = new URLSearchParams(window.location.search);
        const terminoBusqueda = urlParams.get('query');
        
        const contenedor = document.getElementById('lista-resultados');
        const titulo = document.getElementById('titulo-busqueda');

        if (!terminoBusqueda) {
            titulo.innerText = "No se ingresó ninguna búsqueda.";
            return;
        }

        titulo.innerText = `Resultados "${terminoBusqueda}"`;

        try {
            // 3. Consultar a Strapi usando el filtro containsi (ignora mayúsculas/minúsculas)
            const endpoint = `${STRAPI_URL}/api/pinturas?filters[Nombre][$containsi]=${terminoBusqueda}&populate=*`;
            const respuesta = await fetch(endpoint);
            const datos = await respuesta.json();
            const pinturas = datos.data;

            contenedor.innerHTML = ""; // Limpiar el "Cargando..."

            if (!pinturas || pinturas.length === 0) {
                contenedor.innerHTML = `<div class="col-12 text-center py-5"><h3 class="text-muted">No encontramos productos que coincidan con "${terminoBusqueda}".</h3></div>`;
                return;
            }

            // 4. Formateador de moneda (para que el precio se vea bien)
            const formateador = new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN',
            });

            // 5. Dibujar cada tarjeta
            pinturas.forEach(p => {
                const pintura = p.attributes || p;
                
                // 1. Imagen (mismo que ya tienes)
                const imgObj = pintura.Imagen?.data?.attributes || pintura.Imagen;
                const fotoUrl = imgObj ? `${STRAPI_URL}${imgObj.url}` : 'https://via.placeholder.com/200';

                // 2. Precio (Corregido para soportar P mayúscula o p minúscula)
                const valorPrecio = pintura.Precio || pintura.precio;
                const precioFinal = valorPrecio ? formateador.format(valorPrecio) : 'Precio no disponible';

                // 3. ID (mismo que ya tienes)
                const idProd = p.documentId || p.id;
                const detalleUrl = `detalle.html?id=${idProd}`;

                // 4. HTML (mismo que ya tienes)
                contenedor.innerHTML += `
                    <div class="col-12 col-md-6 col-lg-4 mb-4 px-3"> 
                        <div class="card h-100 shadow-sm border-0 position-relative overflow-hidden">
                            <img src="${fotoUrl}" class="card-img-top" alt="${pintura.Nombre}" 
                                style="height: 250px; object-fit: contain; padding: 15px;"> 
                            <div class="card-body d-flex flex-column p-3"> 
                                <h5 class="card-title text-center fw-bold mb-2">${pintura.Nombre}</h5>
                                <p class="card-text text-center fw-bold precio-catalogo fs-5 mt-auto" style="color: #2f357d;">
                                    ${precioFinal}
                                </p>
                                <a href="${detalleUrl}" class="stretched-link"></a> 
                            </div>
                        </div>
                    </div>`;
            });

            } catch (error) {
                console.error("Error en la búsqueda:", error);
                contenedor.innerHTML = "<p class='text-danger'>Hubo un error al conectar con el servidor.</p>";
            }
        }

        // Ejecutar la función en cuanto cargue la página
        document.addEventListener('DOMContentLoaded', ejecutarBusqueda);

        // Opcional: Hacer que el buscador del navbar también funcione desde aquí
        const formBusqueda = document.getElementById('form-busqueda');
        if (formBusqueda) {
            formBusqueda.addEventListener('submit', (e) => {
                e.preventDefault();
                const valor = document.getElementById('input-busqueda').value.trim();
                if (valor) window.location.href = `busqueda.html?query=${encodeURIComponent(valor)}`;
            });
        }