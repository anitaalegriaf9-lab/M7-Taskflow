class Tarea {
  constructor(
    id,
    descripcion,
    estado = "pendiente",
    fechaCreacion = new Date().toLocaleString()
  ) {
    this.id = id;
    this.descripcion = descripcion;
    this.estado = estado;
    this.fechaCreacion = fechaCreacion;
  }

  cambiarEstado() {
    this.estado = this.estado === "pendiente" ? "completada" : "pendiente";
  }

  editarDescripcion(nuevaDescripcion) {
    this.descripcion = nuevaDescripcion;
  }
}

class GestorTareas {
  constructor() {
    this.tareas = [];
  }

  agregarTarea(descripcion) {
    const nuevaTarea = new Tarea(Date.now(), descripcion);
    this.tareas.push(nuevaTarea);
    this.guardarEnLocalStorage();
  }

  eliminarTarea(id) {
    this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
    this.guardarEnLocalStorage();
  }

  cambiarEstadoTarea(id) {
    const tarea = this.tareas.find((tarea) => tarea.id === id);
    if (tarea) {
      tarea.cambiarEstado();
      this.guardarEnLocalStorage();
    }
  }

  editarTarea(id, nuevaDescripcion) {
    const tarea = this.tareas.find((tarea) => tarea.id === id);
    if (tarea) {
      tarea.editarDescripcion(nuevaDescripcion);
      this.guardarEnLocalStorage();
    }
  }

  guardarEnLocalStorage() {
    localStorage.setItem("tareas", JSON.stringify(this.tareas));
  }

  cargarDesdeLocalStorage() {
    const tareasGuardadas = JSON.parse(localStorage.getItem("tareas")) || [];
    this.tareas = tareasGuardadas.map(
      (tarea) =>
        new Tarea(
          tarea.id,
          tarea.descripcion,
          tarea.estado,
          tarea.fechaCreacion
        )
    );
  }
}

const gestor = new GestorTareas();
gestor.cargarDesdeLocalStorage();

const formulario = document.getElementById("form-tarea");
const inputTarea = document.getElementById("input-tarea");
const listaTareas = document.getElementById("lista-tareas");
const mensaje = document.getElementById("mensaje");
const contadorTareas = document.getElementById("contador-tareas");
const listaApi = document.getElementById("lista-api");

const mostrarMensaje = (texto) => {
  mensaje.textContent = texto;

  setTimeout(() => {
    mensaje.textContent = "";
  }, 2000);
};

const mostrarTareas = () => {
  listaTareas.innerHTML = ""; 
  contadorTareas.textContent = `Total de tareas: ${gestor.tareas.length}`;
  
  gestor.tareas.forEach(({ id, descripcion, estado, fechaCreacion }) => {
    const li = document.createElement("li");

    const info = document.createElement("div");
    info.innerHTML = `
      <strong class="${estado === "completada" ? "completada" : ""}">
        ${descripcion}
      </strong>
      <br>
      <small>Estado: ${estado} | Creada: ${fechaCreacion}</small>
    `;

    const acciones = document.createElement("div");
    acciones.classList.add("acciones");

    const btnEstado = document.createElement("button");
    btnEstado.textContent = "Estado";
    btnEstado.addEventListener("click", () => {
      gestor.cambiarEstadoTarea(id);
      mostrarTareas();
    });

    const btnEditar = document.createElement("button");
    btnEditar.textContent = "Editar";
    btnEditar.addEventListener("click", () => {
      const nuevaDescripcion = prompt("Editar tarea:", descripcion);
      if (nuevaDescripcion && nuevaDescripcion.trim() !== "") {
        gestor.editarTarea(id, nuevaDescripcion.trim());
        mostrarTareas();
      }
    });

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.addEventListener("click", () => {
      gestor.eliminarTarea(id);
      mostrarTareas();
    });

    acciones.appendChild(btnEstado);
    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    li.appendChild(info);
    li.appendChild(acciones);

    li.addEventListener("mouseover", () => {
      li.style.backgroundColor = "#ddd";
    });

    li.addEventListener("mouseout", () => {
      li.style.backgroundColor = "#eeeeee";
    });

    listaTareas.appendChild(li);
  });
};

formulario.addEventListener("submit", (e) => {
  e.preventDefault();

  const descripcion = inputTarea.value.trim();

  if (descripcion === "") return;

mostrarMensaje("Agregando tarea...");

setTimeout(() => {
  gestor.agregarTarea(descripcion);
  mostrarTareas();
  formulario.reset();
  mostrarMensaje("Tarea agregada con éxito");
}, 2000);
});

inputTarea.addEventListener("keyup", () => {
  mensaje.textContent = `Escribiendo: ${inputTarea.value}`;
});

setInterval(() => {
  console.log(`Cantidad actual de tareas: ${gestor.tareas.length}`);
}, 5000);


const obtenerTareasAPI = async () => {
  try {
    const respuesta = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=5"
    );

    if (!respuesta.ok) {
      throw new Error("No se pudieron obtener los datos");
    }

    const datos = await respuesta.json();

    listaApi.innerHTML = "";

    datos.forEach((tarea) => {
      const li = document.createElement("li");
      li.textContent = tarea.title;
      listaApi.appendChild(li);
    });
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    mostrarMensaje("Hubo un error al cargar tareas desde la API");
  }
};

mostrarTareas();
obtenerTareasAPI();
