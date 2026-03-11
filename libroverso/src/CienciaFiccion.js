import { Producto } from './Producto.js';

export class CienciaFiccion extends Producto {
    #campo;

    constructor(nombre, precio, descripcion, imagen, campo) {
        super(nombre, precio, descripcion, imagen);
        this.#campo = campo;
    }

    get campo() {
        return this.#campo;
    }

    set campo(value) {
        this.#campo = value;
    }
}