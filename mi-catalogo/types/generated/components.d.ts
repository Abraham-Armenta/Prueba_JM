import type { Schema, Struct } from '@strapi/strapi';

export interface ProductoColores extends Struct.ComponentSchema {
  collectionName: 'components_producto_colores';
  info: {
    displayName: 'Colores';
    icon: 'brush';
  };
  attributes: {
    Activo: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    CodigoHex: Schema.Attribute.String;
    NombreColor: Schema.Attribute.String;
    precio: Schema.Attribute.Decimal;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'producto.colores': ProductoColores;
    }
  }
}
