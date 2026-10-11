# language: es
Característica: Ficha de película
  Como cinéfilo
  Quiero ver la información completa de una película
  Para decidir si verla y descubrir a sus actores y directores

  Escenario: Abrir la ficha desde su URL
    Cuando entro en /peliculas/348
    Entonces se piden a TMDB los datos de la película 348
    Y mientras llegan veo un mensaje de carga

  Escenario: Ver los datos de la película
    Dado que TMDB devuelve la película
    Entonces veo título, póster, sinopsis, fecha de estreno, duración y géneros
    Y veo la puntuación de TMDB con su número de votos
    Y veo el título original si es distinto del título

  Escenario: Ver la dirección y el reparto
    Dado que TMDB devuelve los créditos de la película
    Entonces veo quién la dirige
    Y veo los 10 primeros actores con su personaje y su foto
    Y cada persona enlaza a su ficha /personas/:id

  Escenario: Ver el tráiler
    Dado que la película tiene un tráiler en YouTube
    Entonces veo un enlace que abre el tráiler en una pestaña nueva

  Escenario: Datos ausentes
    Dado una película sin póster, sinopsis, fecha, duración, géneros, votos, reparto ni tráiler
    Cuando se muestra su ficha
    Entonces veo el texto «no disponible» correspondiente en cada dato

  Escenario: Identificador no válido
    Cuando entro en /peliculas/abc
    Entonces no se hace ninguna petición
    Y veo un mensaje de dirección no válida con un enlace para volver a explorar

  Escenario: Reintentar tras un error
    Dado que TMDB no responde
    Cuando veo el mensaje de error
    Y pulso «Reintentar»
    Entonces se repite la petición
    Y veo la película si esta vez responde

  Escenario: Pasar de una película a otra
    Dado que estoy en la ficha de la película 348
    Cuando navego a /peliculas/679
    Entonces se cargan los datos de la película 679 sin recargar la aplicación

  Escenario: Invitar a iniciar sesión para guardar favoritas
    Dado que no he iniciado sesión
    Cuando abro la ficha de la película 348
    Entonces veo un enlace para iniciar sesión
    Y al iniciar sesión vuelvo a /peliculas/348

  Escenario: Marcar y desmarcar una favorita
    Dado que he iniciado sesión
    Y la película 348 no es favorita
    Cuando pulso «Favorita»
    Entonces se guarda con su título, póster y fecha de estreno
    Y el botón aparece pulsado
    Cuando lo pulso otra vez
    Entonces deja de ser favorita

  Escenario: Esperar a que carguen mis favoritas
    Dado que he iniciado sesión
    Y mis favoritas todavía están cargando
    Entonces el botón «Favorita» está desactivado

  Escenario: No se puede guardar el cambio
    Dado que he iniciado sesión
    Cuando pulso «Favorita» y Firestore rechaza el cambio
    Entonces veo «No se ha podido guardar el cambio. Inténtalo de nuevo.»
