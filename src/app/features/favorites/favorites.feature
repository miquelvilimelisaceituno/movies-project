# language: es
Característica: Página de favoritas
  Como usuario con sesión iniciada
  quiero ver mis películas favoritas en una página
  para volver a ellas y quitar las que ya no me interesen

  Escenario: Sin sesión no se puede entrar
    Dado que no he iniciado sesión
    Cuando abro /favoritos
    Entonces voy a la página de inicio de sesión
    Y al iniciar sesión vuelvo a /favoritos

  Escenario: Mientras cargan mis favoritas
    Dado que he iniciado sesión
    Y mis favoritas todavía están cargando
    Entonces veo «Cargando tus favoritas…»

  Escenario: No tengo favoritas
    Dado que he iniciado sesión
    Y no tengo películas favoritas
    Entonces veo «Todavía no tienes películas favoritas.»
    Y un enlace para explorar películas

  Escenario: Ver mis favoritas
    Dado que he iniciado sesión
    Y «Dune» y «La llegada» son mis favoritas
    Entonces veo las dos películas con su póster y su año
    Y cada título enlaza a la ficha de la película

  Escenario: Quitar una favorita
    Dado que he iniciado sesión
    Y «Dune» es una de mis favoritas
    Cuando pulso «Quitar» en «Dune»
    Entonces «Dune» deja de ser favorita

  Escenario: No se puede quitar
    Dado que he iniciado sesión
    Cuando pulso «Quitar» y Firestore rechaza el cambio
    Entonces veo «No se ha podido quitar la película. Inténtalo de nuevo.»
