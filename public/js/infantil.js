import { Producto } from './producto.js';

export class Infantil extends Producto {
    #edadRecomendada;

    constructor(nombre, precio, descripcion, imagen, edadRecomendada) {
        super(nombre, precio, descripcion, imagen);
        this.#edadRecomendada = edadRecomendada;
    }

    get edadRecomendada() {
        return this.#edadRecomendada;
    }

    set edadRecomendada(value) {
        this.#edadRecomendada = value;
    }
}