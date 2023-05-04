function pintarTarjetas(productos, contenedorTarjetas, templateTarjetas, carrito, carritoDOM) {

  // inicializar fragmento para evitar reflow
  const fragmento = document.createDocumentFragment()

  // limpiar interfaz
  contenedorTarjetas.textContent = ''

  // procesar los productos y pintarlos
  productos.forEach(producto => {
    const clon = templateTarjetas.cloneNode(true)
    clon.querySelector('.card .card-img-top').src = producto.img
    clon.querySelector('.card .card-body .card-title').textContent = `$ ${producto.precio}`
    clon.querySelectorAll('.card .card-body .card-text')[0].textContent = producto.nombre
    clon.querySelector('.card .card-body .btn').setAttribute('id', `btn-${producto.id}`)
    clon.querySelector('.card .card-body .card-text span').textContent = producto.stock
    clon.querySelector('.card .card-body .card-text span').classList.add(`stock-${producto.id}`)
    fragmento.appendChild(clon)

    // capturar evento del boton y agregar al carrito
    const botonAgregar = fragmento.getElementById(`btn-${producto.id}`)
    botonAgregar.addEventListener("click", (e) => agregarAlCarrito(e, productos, carrito, carritoDOM))
  })

  // agregar el fragmento al contenedor
  contenedorTarjetas.appendChild(fragmento)
}


function filtrarProductos(productos, buscadorInput, contenedorTarjetas, templateTarjetas, carrito, carritoDOM) {
  buscadorInput.addEventListener('input', () => {
    const prodFiltrados = productos.filter(producto => producto.nombre.toLowerCase().includes(buscadorInput.value))
    pintarTarjetas(prodFiltrados, contenedorTarjetas, templateTarjetas, carrito, carritoDOM)
  })
}


function agregarAlCarrito(e, productos, carrito, carritoDOM) {
  let posBuscado = productos.findIndex(producto => producto.id == Number(e.target.id.slice(4)))
  if (productos[posBuscado].stock > 0) {
    lanzarAlerta('success', 'Producto agregado!', 1000, false)
    let spanStock = document.querySelector(`.stock-${e.target.id.slice(4)}`)
    productos[posBuscado].stock--
    spanStock.textContent = productos[posBuscado].stock
    
    let posEnCarrito = carrito.findIndex(producto => producto.id == productos[posBuscado].id)
    if (posEnCarrito !== -1) {
      carrito[posEnCarrito].unidades++
      carrito[posEnCarrito].subtotal = carrito[posEnCarrito].precio * carrito[posEnCarrito].unidades
    } else {
      carrito.push({
        id: productos[posBuscado].id,
        nombre: productos[posBuscado].nombre,
        precio: productos[posBuscado].precio,
        unidades: 1,
        subtotal: productos[posBuscado].precio
      })
    }
    
    // guardar el carrito en LS
    localStorage.setItem('carrito', JSON.stringify(carrito))

    // pintar el carrito
    pintarCarrito(carrito, carritoDOM)
  } else {
    lanzarAlerta('error', 'Sin stock!', 0, true)
  }
}


function pintarCarrito(carrito, carritoDOM) {
  // inicializar fragmento para evitar reflow
  let fragmento = ''

  carrito.forEach(producto => {
    fragmento += 
    `<div class="item-carrito d-flex align-items-center justify-content-between">
        <p class="nombre-item">${producto.nombre}</p>
        <p class="cantidad-item">${producto.unidades}</p>
        <p class="precio-unitario-item">${producto.precio}</p>
        <p class="precio-total-item">$ ${producto.subtotal}</p>
    </div>`
  })
  
  // agregar boton al final
  fragmento += `<button id=comprar class="btn btn-secondary">Finalizar compra</button>`

  // agregar el fragmento al carrito(DOM)
  carritoDOM.innerHTML = fragmento

  let botonComprar = document.getElementById("comprar")
  botonComprar.addEventListener("click", () => finalizarCompra(carritoDOM))
}


function checkCarritoLS(carrito, carritoDOM) {
  if (localStorage.getItem('carrito')) {
    carrito = JSON.parse(localStorage.getItem('carrito'))
    pintarCarrito(carrito, carritoDOM)
  }
}


function finalizarCompra(carritoDOM) {
  alert("Muchas gracias por su compra")
  localStorage.removeItem("carrito")
  /* localStorage.setItem("carrito", [])
  localStorage.clear() // se vacia el storage, no solo elimina carrito */
  carritoDOM.innerHTML = ''
}


function filtrarPorCategoria(inputs, productos, contenedorTarjetas, templateTarjetas, carrito, carritoDOM) {
  for (const input of inputs) {
    input.addEventListener('click', (e) => {
      let filtros = []
      for (const input of inputs) {
        if (input.checked) {
          filtros.push(input.id)
        }
      }
      let arrayFiltrado = productos.filter(producto => filtros.includes(producto.categoria))
      if (arrayFiltrado.length > 0) {
        pintarTarjetas(arrayFiltrado, contenedorTarjetas, templateTarjetas, carrito, carritoDOM)
      } else {
        pintarTarjetas(productos, contenedorTarjetas, templateTarjetas, carrito, carritoDOM)
      }
    })
  }

}


function lanzarAlerta(icon, title, timer, showConfirmButton) {
  Swal.fire({
    icon: icon,
    title: title,
    timer: timer,
    showConfirmButton: showConfirmButton,
  })
}


function tienda(prod) {
  let productos = [...prod]

  // array de carrito
  const carrito = []

  // elementos capturados del DOM
  const contenedorTarjetas = document.querySelector('.contenedor-tarjetas')
  const templateTarjetas = document.getElementById('template-tarjetas').content
  const carritoDOM = document.getElementById('carrito')
  let buscadorInput = document.getElementById('buscar-input')
  let inputs = document.getElementsByClassName('input')

  // chequear si existe algun carrito previo en LS
  checkCarritoLS(carrito, carritoDOM)

  // renderizar productos
  pintarTarjetas(productos, contenedorTarjetas, templateTarjetas, carrito, carritoDOM)

  // buscador de productos
  filtrarProductos(productos, buscadorInput, contenedorTarjetas, templateTarjetas, carrito, carritoDOM)

  // filtrar por categorias
  filtrarPorCategoria(inputs, productos, contenedorTarjetas, templateTarjetas, carrito, carritoDOM)
}


function main() {
  fetch("./data.json")
  .then( (respuesta) => respuesta.json())
  .then( prod => {
    tienda(prod)
  })
}


main()