# language: es
Característica: Explorar películas
  Como cinéfilo
  Quiero ver un listado de películas
  Para descubrir qué ver y abrir su ficha

  Escenario: Abrir la aplicación
    Cuando entro en la raíz de la aplicación
    Entonces se abre la página de exploración en /explorar

  Escenario: Ver las películas más populares
    Dado que estoy en la página de exploración
    Cuando TMDB devuelve las películas más populares
    Entonces veo una tarjeta por película
    Y cada tarjeta muestra título, póster, año y puntuación de TMDB
    Y el título enlaza a la ficha /peliculas/:id

  Escenario: Esperar los resultados
    Dado que estoy en la página de exploración
    Mientras la petición está en curso
    Entonces veo un mensaje de carga

  Escenario: No hay películas
    Cuando TMDB devuelve una lista vacía
    Entonces veo un mensaje de que no hay películas que mostrar

  Escenario: Reintentar tras un error
    Dado que TMDB no responde
    Cuando veo el mensaje de error
    Y pulso «Reintentar»
    Entonces se repite la petición
    Y veo las películas si esta vez responde

  Escenario: Datos ausentes en una película
    Dado una película sin póster, sin fecha y sin votos
    Cuando se muestra su tarjeta
    Entonces veo «Póster no disponible», «Fecha desconocida» y «Sin votos»
