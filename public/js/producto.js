export class Producto {
    // Atributos privados (ES2022)
    #id;
    #nombre;
    #precio;
    #descripcion;
    #imagen;

    constructor(nombre, precio, descripcion, imagen = null) {
        // Generar ID único hasheando el nombre + timestamp
        this.#id = this.#generarHash(nombre + precio + descripcion);
        this.#nombre = nombre;
        this.#precio = precio;
        this.#descripcion = descripcion;
        // Si no hay imagen, usar una por defecto
        this.#imagen = imagen || '../imagenes/sin-imagen.png';
    }

    // Método privado para generar hash
    #generarHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        return Math.abs(hash).toString(16);
    }

    // Getter para ID (solo lectura, sin setter)
    get id() {
        return this.#id;
    }

    // Getters y Setters para nombre
    get nombre() {
        return this.#nombre;
    }

    set nombre(value) {
        this.#nombre = value;
    }

    // Getters y Setters para precio
    get precio() {
        return this.#precio;
    }

    set precio(value) {
        this.#precio = value;
    }

    // Getters y Setters para descripción
    get descripcion() {
        return this.#descripcion;
    }

    set descripcion(value) {
        this.#descripcion = value;
    }

    // Getters y Setters para imagen
    get imagen() {
        return this.#imagen;
    }

    set imagen(value) {
        this.#imagen = value || '../imagenes/sin-imagen.png';
    }
}