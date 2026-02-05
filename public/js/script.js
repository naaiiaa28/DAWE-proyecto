document.addEventListener("DOMContentLoaded", () => {
    const tipoLibro = document.getElementById("tipo-libro");
    const campoExtra = document.getElementById("campo-extra");
    const inputExtra = document.getElementById("extra");
    const formLibro = document.getElementById("form-libro");
    const dropZone = document.getElementById("drop-zone");

    if(tipoLibro){
        tipoLibro.addEventListener("change", () => {
            const valor = tipoLibro.value;

            if (valor === "") {
                campoExtra.classList.add("d-none");
                inputExtra.value = "";
            } else {
                campoExtra.classList.remove("d-none");

                switch (valor) {
                    case "novela":
                    case "ciencia":
                        inputExtra.placeholder = "Autor";
                        break;
                    case "ensayo":
                        inputExtra.placeholder = "Editor";
                        break;
                    case "infantil":
                        inputExtra.placeholder = "Edad recomendada";
                        break;
                    default:
                        inputExtra.placeholder = "Campo extra";
                }
            }
        });
    }

    // Drag & Drop
    if(dropZone){
        const textoOriginal = dropZone.textContent;

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("dragover");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("dragover");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("dragover");

            dropZone.textContent = "Imagen añadida correctamente ✔";

            setTimeout(() => {
                dropZone.textContent = textoOriginal;
            }, 1500);
        });
    }

    // Previene envío real (para pruebas)
    if(formLibro){
        formLibro.addEventListener("submit", (e) => {
            e.preventDefault();
            alert("Libro añadido (simulación) ✅");
            formLibro.reset();
            campoExtra.classList.add("d-none");
        });
    }
});

