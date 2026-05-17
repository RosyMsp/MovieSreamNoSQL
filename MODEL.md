**Propuesta de modelo NoSQL en MongoDB para MovieStream** 
Aunque el modelo SQL original contiene más tablas, el model NoSQL se enfocará unicamente en las tablas que se han utilizado con mayor frecuencia en actividades anteriores: __CUSTSALES__, __CUSTOMER__, __MOVIE__, __GENRE__ y __ACTIVITY__. Estas tablas tienen las infomación principal sobre clientes, ventas, peliculas géneros y la activida de compra de cada cliente, por lo que son suficinetes para demostrar el funcionamiento del sistema y la base de datos.

En el modelo relacional, las tablas se conectan mediante llaves primarias y llaves foraneas. Sin embargo en el modelo NoSQL, la información se representa mediante colecciones y documentos. Para este caso decidí utilizar referencias, porque algunas tablas pueden crecer considerablemente (como la de CUSTSALES), por lo que no es conveniente embeber todas las ventas dentro del documento de cada cliente, ya que un cliente podria tener muchas ventas y el documento se haría poco manejable.

Cada venta se almacenará como un documento independiente dentro de la colección custsales, manteniendo referencias hacia el cliente, la película, el género y la actividad correspondiente. La unica relación que decidí embeber fue la de GENRE con MOVIE, ya que el género es un dato pequeño y que se relaciona directamente con la descripción de la película, por lo que no es necesario tener una colección separada de géneros si solamnte se utilizará para mostrar o identificar el género de cada película.

**Colecciones finales**
El modelo quedaría compuesto por 4 colecciones
- customers
- custsales
- movies
- activites

__Colección customers__
Guardará la información general del cliente
Ejemplo: 
{
  "_id": 1392835,
  "lastName": "García",
  "firstName": "Ana",
  "email": "ana@email.com",
  "streetAddress": "Av. Principal 123",
  "postalCode": "64000",
  "city": "Monterrey",
  "stateProvince": "Nuevo León",
  "country": "México",
  "countryCode": "MX",
  "continent": "América",
  "yrsCustomer": 3,
  "promotionResponse": 1,
  "locLat": 25.6866,
  "locLong": -100.3161,
  "age": 28,
  "commuteDistance": 10,
  "creditBalance": 5000,
  "education": "Universidad",
  "fullTime": "Yes",
  "gender": "F",
  "householdSize": 4,
  "income": 25000,
  "incomeLevel": "Medio",
  "insuffFundsIncidents": 0,
  "jobType": "Empleado",
  "lateMortRentPmts": 0,
  "maritalStatus": "Single",
  "mortgageAmt": 0,
  "numCars": 1,
  "numMortgages": 0,
  "pet": "No",
  "rentOwn": "Rent",
  "segmentId": 2,
  "workExperience": 5,
  "yrsCurrentEmployer": 2,
  "yrsResidence": 4
}

__Colección movies__
Almacenará la información de las películas
{
  "_id": 87,
  "sku": "MOV87",
  "title": "Example Movie",
  "cast": "Actor 1, Actor 2",
  "crew": "Director Example",
  "year": 2020,
  "genre": {
    "genreId": 1,
    "name": "Action"
  },
  "gross": "1500000",
  "views": 50000,
  "awards": "None",
  "budget": "500000",
  "studio": "Example Studio",
  "runtime": "120 min",
  "summary": "Movie summary example",
  "imageUrl": "https://example.com/movie.jpg",
  "listPrice": 199,
  "nominations": "None",
  "mainSubject": "Adventure",
  "openingDate": "2020-01-10",
  "wikiArticle": "https://example.com",
  "createdAt": "2026-01-01"
}

__Colección custsales__
Almacena las ventas realizadas por cliente. Cuando la venta proviene de una actividad de tipo purchase, se embebe un pequeño objeto llamado activityContext, que guarda el contexto de la compra
{
  "_id": "sale001",
  "dayId": "2026-01-10",
  "custId": 1392835,
  "movieId": 87,
  "app": "chrome",
  "device": "mac",
  "os": "macos",
  "paymentMethod": "credit card",
  "listPrice": 199,
  "discountType": "promotion",
  "discountPercent": 10,
  "actualPrice": 179.1,
  "activityContext": {
    "activity": "purchase",
    "activityTime": "2026-01-10T18:30:00",
    "app": "chrome",
    "device": "mac",
    "os": "macos"
  }
}

__Colección activites__
Almacena las actividades generales del usuario dentro de la plataforma, se mantiene como colección independiente porque puede contener muchas acciones que no necesariamente terminan en una venta, por ejemplo reproducciones, búsquedas, vistas, pausas o interacciones.
{
  "_id": "activity001",
  "custId": 1392835,
  "movieId": 87,
  "activity": "play",
  "activityTime": "2026-01-10T17:45:00",
  "app": "chrome",
  "device": "mac",
  "os": "macos"
}

**Decisiones por relación**
-Se referencia desde custsales hacia customer
-Se referencia desde custsales hacia movie
-Se embebe genre dentro de movies
-Se referencia desde activites hacia costumer y movies
-Se embebe activites en custsales cuando la actividad es purchase.

<!-- TODO terminar consultas -->
*CONSULTAS*
Consultar películas con su género.
Consultar ventas con método de pago, precio y contexto de compra.
Consultar compras realizadas desde cierto dispositivo o sistema operativo.
Consultar ventas por cliente usando custId.
Consultar actividades generales por cliente usando custId.




