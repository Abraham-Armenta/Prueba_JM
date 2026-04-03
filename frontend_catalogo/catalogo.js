const API_URL = "http://localhost:1337/api/pinturas?populate=*";
let todosLosProductos = []; 


// --- BLOQUE 1: GENERADOR DE HTML ---
function crearTemplateTarjeta(pintura, fotoUrl, precioFormateado, detalleUrl) {


    /* 
    Aqui irían las constantes de la descripción y la disponibilidad.
    También irían los html entre nombre y precio formato.
    */
    return `
    <div class="col-12 col-md-6 col-lg-4 mb-4 px-3"> 
            <div class="card h-100 shadow-sm border-0 position-relative">

            <img src="${fotoUrl}" 
                class="card-img-top" 
                alt="${pintura.Nombre}" 
                style="height: 250px; object-fit: contain; padding: 15px;"> 

            <div class="card-body d-flex flex-column p-3"> <h5 class="card-title text-center fw-bold mb-2">${pintura.Nombre}</h5>
                
                <p class="card-text text-center fw-bold precio-catalogo fs-5 mt-auto">
                    ${precioFormateado}
                </p>
                
                <a href="${detalleUrl}" class="stretched-link"></a> 
            </div>

            </div>
    </div>
    `;
}

// --- BLOQUE 2: OBTENCIÓN DE DATOS ---
async function obtenerDatos() {
    try {
        const respuesta = await fetch(API_URL);
        const json = await respuesta.json();
        todosLosProductos = json.data; 
        mostrarProductos(todosLosProductos);
    } catch (error) {
        console.error("Error conectando a Strapi:", error);
        document.getElementById('lista-pinturas').innerHTML = 
            "<p class='text-danger text-center w-100'>No se pudo conectar con el catálogo.</p>";    
    }
}

// --- BLOQUE 3: LÓGICA DE RENDERIZADO (Pintar en pantalla) ---
function mostrarProductos(lista) {
    const contenedor = document.getElementById('lista-pinturas');
    contenedor.innerHTML = ""; 

    if (lista.length === 0) {
        contenedor.innerHTML = "<p class='text-center w-100'>No hay productos en esta categoría.</p>";
        return;
    }

    const formateador = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    });

    lista.forEach(pintura => {
        // 1. Manejo de la Imagen
        const fotoUrl = pintura.Imagen 
            ? `http://localhost:1337${pintura.Imagen.url}` 
            : 'https://via.placeholder.com/200';

        // 2. Manejo del Precio
        const precioFormateado = pintura.precio 
            ? formateador.format(pintura.precio) 
            : 'Precio no disponible';

        // 3. URL de detalle
        const idParaURL = pintura.documentId || pintura.id; // Priorizamos documentId de v5
        const detalleUrl = `detalle.html?id=${idParaURL}`;

        // 4. Llamamos a la función del BLOQUE 1 y sumamos al contenedor
        contenedor.innerHTML += crearTemplateTarjeta(pintura, fotoUrl, precioFormateado, detalleUrl);
    });
}



// 1. Función para obtener valores marcados (Se mantiene igual)
const obtenerMarcados = (idContenedor) => {
    const checkboxes = document.querySelectorAll(`#${idContenedor} .form-check-input:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
};

// 2. Escuchamos cambios en la columna lateral
document.querySelector('.col-lg-3').addEventListener('change', () => {
    const categoriasSeleccionadas = obtenerMarcados('filtros-categoria');
    const proveedoresSeleccionados = obtenerMarcados('filtros-proveedor');

    console.log("Categorías marcadas:", categoriasSeleccionadas);
    console.log("Proveedores marcados:", proveedoresSeleccionados);

    // Si no hay nada marcado, mostramos todo
    if (categoriasSeleccionadas.length === 0 && proveedoresSeleccionados.length === 0) {
        mostrarProductos(todosLosProductos);
        return;
    }

    const filtrados = todosLosProductos.filter(p => {
        // IMPORTANTE: Verifica en tu consola si p.categoriaAccesorio existe
        // o si Strapi lo está mandando dentro de p.attributes.categoriaAccesorio
        
        const valorCategoria = p.categoriaAccesorio; 
        const valorProveedor = p.categoriaProveedores;

        // Si el filtro está vacío, cuenta como que "coincide"
        const coincideCategoria = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(valorCategoria);
        const coincideProveedor = proveedoresSeleccionados.length === 0 || proveedoresSeleccionados.includes(valorProveedor);

        return coincideCategoria && coincideProveedor;
    });

    mostrarProductos(filtrados);
});


// Arrancamos
obtenerDatos();


//5--Barra de navegación
document.getElementById('form-busqueda').addEventListener('submit', function(e) {
    e.preventDefault(); // Evitamos que la página se refresque sola
    
    const busqueda = document.getElementById('input-busqueda').value.trim();
    
    if (busqueda.length > 0) {
        // Redirige a tu nueva página pasando el texto en la URL
        // Ejemplo: busqueda.html?query=montana
        window.location.href = `busqueda.html?query=${encodeURIComponent(busqueda)}`;
    }
});

async function cargarResultados() {
    // 1. Obtener el texto de la URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get('query');
    
    if (!query) return;

    document.getElementById('titulo-busqueda').innerText = `Resultados para: "${query}"`;

    try {
        // 2. Pedir a Strapi productos que coincidan con el nombre
        // Usamos el filtro $containsi (que no distingue mayúsculas/minúsculas)
        const url = `http://localhost:1337/api/pinturas?filters[Nombre][$containsi]=${query}&populate=*`;
        
        const response = await fetch(url);
        const data = await response.json();
        const pinturas = data.data;

        const contenedor = document.getElementById('lista-resultados');
        contenedor.innerHTML = ''; // Limpiar carga

        if (pinturas.length === 0) {
            contenedor.innerHTML = `<div class="col-12 text-center"><h3>No se encontraron productos.</h3></div>`;
            return;
        }

        // 3. Dibujar las tarjetas (puedes reutilizar tu función crearTemplateTarjeta)
        pinturas.forEach(p => {
            const pintura = p.attributes;
            // Aquí llamas a tu función que genera el HTML de la card
            // const cardHTML = crearTemplateTarjeta(pintura, ...);
            // contenedor.innerHTML += cardHTML;
        });

    } catch (error) {
        console.error("Error en la búsqueda:", error);
    }
}

// Ejecutar al cargar la página
cargarResultados();










































/*
                --Esto se puede reintroducir en el bloque 1 para incertar descripción y disponibilidad

                const descripcion = pintura.Descripcion?.[0]?.children?.[0]?.text || 'Sin descripción';
                
                const disponibilidad = pintura.Disponibilidad ? 'Disponible' : 'No disponible';


                <p class="card-text text-center text-secondary small mb-2 descripcion-corta">
                    ${descripcion}
                </p>

                <p class="card-text text-center small mb-2">
                    <i class="bi bi-info-circle me-1"></i> ${disponibilidad}
                </p>


*/ 

                

