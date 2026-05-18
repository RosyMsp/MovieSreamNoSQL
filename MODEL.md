# Propuesta de modelo NoSQL en MongoDB para MovieStream

El modelo propuesto para MovieStream NoSQL se conforma de colecciones, documentos, referencias y datos embebidos. Aunque el modelo SQL original contiene más tablas, inicialmente se tomaron como base las tablas que se utilizaron con mayor frecuencia en actividades anteriores: **CUSTOMER**, **CUSTSALES**, **MOVIE**, **GENRE** y **ACTIVITY**, ya que concentran la información principal sobre clientes, ventas, películas, géneros y actividades de los usuarios dentro de la plataforma.

Posteriormente, se decidió ampliar el modelo incluyendo otras tablas relacionadas con **CUSTOMER**, como **CUSTOMER_CONTACT**, **CUSTOMER_DEMOGRAPHICS**, **CUSTOMER_EXTENSION**, **CUSTOMER_SEGMENT** y **CUSTOMER_SURVEY**. Estas tablas funcionan como extensiones del perfil del cliente, por lo que en el modelo NoSQL se integraron directamente dentro de la colección `customers` como documentos embebidos. Esta decisión permite consultar la información completa del cliente en un solo documento, sin tener que hacer varias uniones como ocurriría en SQL.

De esta forma, la colección `customers` no solo almacena los datos básicos del cliente, sino también su información de contacto, datos demográficos, segmento y respuestas de encuesta. Por ejemplo, los datos de contacto se guardan dentro de `contact`, los datos demográficos dentro de `demographics`, la clasificación del cliente dentro de `segment` y la información de encuesta dentro de `survey`. Esto hace que el documento del cliente sea más completo y facilita las consultas relacionadas con su perfil.

También se agregó la colección `customerFeedback`, ya que los comentarios de los clientes pueden repetirse a lo largo del tiempo. A diferencia de los datos de contacto o demográficos, el feedback no se embebió dentro de `customers`, porque un mismo cliente puede generar varios comentarios en distintas fechas. Por esta razón, se decidió manejarlo como una colección independiente que referencia al cliente mediante `custId`.

En el modelo relacional, las tablas se conectan mediante llaves primarias y llaves foráneas. En MongoDB, estas relaciones se representan mediante referencias o documentos embebidos, dependiendo del tipo de dato y de cuánto puede crecer la información. Para este caso, se decidió utilizar referencias en las relaciones que pueden crecer considerablemente, como las ventas, actividades o feedbacks de los clientes. Por ejemplo, no sería conveniente embeber todas las ventas dentro del documento de cada cliente, ya que un cliente podría tener muchas compras y el documento se volvería poco manejable.

Por eso, cada venta se almacena como un documento independiente dentro de la colección `custsales`. Esta colección mantiene referencias hacia `customers` mediante `custId` y hacia `movies` mediante `movieId`. No se embebe todo el cliente ni toda la película dentro de la venta, porque eso duplicaría información y haría más difícil mantener los datos actualizados. Sin embargo, sí se embebe `activityContext` dentro de `custsales`, porque representa el contexto específico de la compra, como la app, el dispositivo, el sistema operativo y la actividad de tipo `purchase`.

La relación entre **GENRE** y **MOVIE** fue la única que se decidió embeber directamente en la colección `movies`. Esto se debe a que el género es un dato pequeño, estable y directamente relacionado con la descripción de la película. Por lo tanto, no es necesario mantener una colección separada de géneros si solamente se utilizará para mostrar o identificar el género de cada película. En este modelo, cada documento de `movies` contiene un objeto `genre` con `genreId` y `name`.

En resumen, el modelo NoSQL combina referencias y datos embebidos según la naturaleza de cada relación. Todo lo que describe directamente al cliente se embebe dentro de `customers`, mientras que los registros que pueden crecer con el tiempo, como ventas, actividades y feedbacks, se manejan como colecciones independientes con referencias. Esta estructura permite conservar una lógica similar al modelo relacional, pero adaptada a la flexibilidad y funcionamiento de MongoDB.

Para las colecciones de customer y movie se uso la funcion buildCustomer y buildMovie correspondientemente para tener datos preterminados y no tener que reescribir todos los datos dentro del seed.js cada vez que se hacia una dato nuevo.

## **Colecciones finales**

El modelo quedaría compuesto por 4 colecciones
- customers
- custsales
- movies
- activites
- feedback

### __Colección customers__

Guardará la información  del cliente
Ejemplo: 
{
  "_id": 14,
  "firstName": "Emilio",
  "lastName": "Ortega",
  "email": "emilio@email.com",

  "contact": {
    "streetAddress": "Av. Principal 123",
    "postalCode": "64000",
    "city": "Chihuahua",
    "stateProvince": "Chihuahua",
    "country": "México",
    "countryCode": "MX",
    "continent": "América",
    "yrsCustomer": 3,
    "promotionResponse": 1,
    "locLat": 28.6353,
    "locLong": -106.0889
  },

  "demographics": {
    "age": 31,
    "commuteDistance": 8,
    "creditBalance": 4500,
    "education": "Universidad",
    "fullTime": "Yes",
    "gender": "M",
    "householdSize": 3,
    "income": 28000,
    "incomeLevel": "Medio",
    "insuffFundsIncidents": 0,
    "jobType": "Empleado",
    "lateMortRentPmts": 0,
    "maritalStatus": "Married",
    "mortgageAmt": 0,
    "numCars": 1,
    "numMortgages": 0,
    "pet": "No",
    "rentOwn": "Rent",
    "workExperience": 7,
    "yrsCurrentEmployer": 3,
    "yrsResidence": 5
  },

  "segment": {
    "segmentId": 2,
    "name": "DINKS - Double Income Kids - 21<AGE<40, Married, Household_size=2",
    "shortName": "DINKS"
  },

  "survey": {
    "completedSurvey": "Yes",
    "rating": 4,
    "wouldRecommend": "Yes",
    "interestedInPremiumTier": "Yes",
    "interestedInExclusiveOfferings": "No",
    "mobileDevice": "Yes",
    "television": "Yes"
  }
}

### __Colección feedback__
Almacenara los feedback del usuario de la app en general 
{
  "_id": "feedback001",
  "custId": 14,
  "day": "2026-05-17",
  "userId": "USR014",
  "email": "emilio@email.com",
  "location": {
    "city": "Chihuahua",
    "stateProvince": "Chihuahua",
    "country": "México",
    "continent": "América"
  },
  "customerComments": "La plataforma es fácil de usar, pero me gustaría tener mejores recomendaciones de películas.",
  "sentiment": "neutral"
}

### __Colección movies__

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

### __Colección custsales__

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

### __Colección activites__

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

## **Decisiones por relación**

-Se referencia desde custsales hacia customer
-Se referencia desde custsales hacia movie
-Se embebe genre dentro de movies
-Se referencia desde activites hacia costumer y movies
-Se embebe activites en custsales cuando la actividad es purchase.
-Se referencia customer dentro de feedback.

## **CONSULTAS** 

¿Qué consultas se vuelven más fáciles? ¿Cuáles más difíciles?
Las consultas que se hicieron más fáciles fueron las que tenían las tablas embebidas, como por ejemplo el genero de la pelicula o el segmento del cliente y las que se hicieron más dificiles fueron las de referencia como por ejemplo el nombre del cliente o el titulo de la pelicula en ventas, especialmente por el formato en que se hacen y que no es un simple JOIN como en SQL.





