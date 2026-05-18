# MovieStream NoSQL

## Descripción del proyecto

MovieStream NoSQL es una aplicación web desarrollada con Node.js, Express y MongoDB que permite interactuar con una base de datos basada en el dominio de una plataforma de películas.

El proyecto parte de un modelo relacional de MovieStream y lo adapta a un modelo NoSQL en MongoDB. La aplicación permite visualizar el modelo en acción mediante una interfaz web sencilla, sin autenticación y sin manejo de usuarios, enfocada en operaciones CRUD sobre distintas colecciones.

La aplicación permite trabajar con:

Películas

Ventas

Feedback de clientes

El modelo documental utiliza referencias y documentos embebidos según el tipo de relación. Por ejemplo, las ventas guardan referencias hacia clientes y películas mediante `custId` y `movieId`, mientras que el género se encuentra embebido dentro de cada película. Además, en ventas se embebe `activityContext` para guardar el contexto de la compra.

## Funcionalidades principales

La aplicación permite:

Listar documentos de las colecciones principales.

Buscar películas por título o género.

Crear, editar y eliminar películas.

Crear películas con género embebido.

Crear nuevos géneros desde el formulario de películas cuando se selecciona la opción "Otro".

Listar ventas con datos relacionados de cliente y película.

Buscar ventas por nombre de cliente, título de película o método de pago.

Crear, editar y eliminar ventas.

Seleccionar clientes y películas por nombre al crear ventas, sin escribir sus IDs manualmente.

Listar feedbacks de clientes.

Filtrar feedbacks por nombre de cliente, sentimiento o ciudad.

Crear, editar y eliminar feedbacks.

## Modelo NoSQL usado

El modelo final incluye las siguientes colecciones:

```text
customers
movies
custsales
activities
customerFeedback

## Para mas información del modelo esta el archivo __MODEL.md__

## Para probar la base de datos esta el archivo __seed.js__


## Stack Tecnológico

Se utilizarón estas herramientas para hacer una aplicación sencilla y son en las que tengo más conocimiento.

Node.js

Se usó Node.js para ejecutar JavaScript del lado del servidor y construir la lógica backend de la aplicación.

Express

Se usó Express para crear el servidor web y definir las rutas de la API. Express permite organizar endpoints para películas, ventas y feedback de forma sencilla.

MongoDB Atlas

Se usó MongoDB Atlas como base de datos en la nube por requisito de la aplicación.

Driver oficial de MongoDB

Se usó el driver oficial de MongoDB para conectar Node.js con MongoDB. Esto permite trabajar directamente con colecciones, documentos, consultas, insertOne, updateOne, deleteOne, aggregate y $lookup.

HTML, CSS y JavaScript

El frontend se hizo con HTML, CSS y JavaScript puro para mantener la aplicación sencilla. No se usó React ni autenticación, porque el objetivo del proyecto es interactuar con la base de datos y visualizar el modelo NoSQL en acción.

Render

Se usó Render para publicar la aplicación Node.js con Express y servir el frontend desde la carpeta public.

## Cómo correr el proyecto desde cero

1. Clonar el repositorio
git clone https://github.com/RosyMsp/MovieSreamNoSQL.git
cd MovieSreamNoSQL

2. Instalar dependencias

npm install

3. Crear archivo de variables de entorno

Crea un archivo llamado .env en la raíz del proyecto.

Dentro del archivo agrega tu cadena de conexión de MongoDB Atlas:

MONGODB_URI=mongodb+srv://USUARIO:PASSWORD@cluster0.xxxxx.mongodb.net/moviestream?retryWrites=true&w=majority
PORT=3000

El archivo .env no debe subirse a GitHub.

4. Configurar MongoDB Atlas

En MongoDB Atlas se debe tener un cluster activo.

También se debe crear un usuario de base de datos con permisos de lectura y escritura.

En Network Access se debe permitir la conexión desde tu IP

Esto permite que la aplicación pueda conectarse tu computadora local.

5. Cargar datos de prueba

El proyecto incluye un script seed.js que borra y vuelve a crear los datos de prueba.

Para ejecutarlo:

npm run seed

Este comando crea y llena las colecciones:

customers
movies
custsales
activities
customerFeedback

Los datos incluyen al menos:

20 películas

5 géneros embebidos en películas

10 actores distribuidos en el campo cast

15 usuarios

Interacciones en activities

Ventas en custsales

Feedbacks de clientes

6. Correr la aplicación localmente
npm start

Después abre en el navegador:

http://localhost:3000

Si usas nodemon para desarrollo, puedes correr:

npm run dev

Scripts disponibles
{
  "start": "node server.js",
  "dev": "nodemon server.js",
  "seed": "node seed.js"
}
npm start

Inicia la aplicación usando server.js.

npm run dev

Inicia la aplicación con nodemon para desarrollo local.

npm run seed

Recrea la base de datos desde cero con datos de prueba.
