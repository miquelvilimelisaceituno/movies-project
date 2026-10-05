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

  Escenario: Buscar por título
    Dado que estoy en la página de exploración
    Cuando escribo «Alien» en el buscador y dejo de escribir
    Entonces la URL pasa a ser /explorar?q=Alien
    Y veo los resultados de la búsqueda con el título «Resultados para «Alien»»
    Y los filtros quedan desactivados porque TMDB no los admite al buscar por título

  Escenario: No repetir búsquedas mientras se escribe
    Cuando escribo «A», «Ali» y «Alien» seguidos
    Entonces solo se busca «Alien», 400 ms después de dejar de escribir
    Y si pulso Intro se busca enseguida

  Escenario: Filtrar por género, puntuación mínima y orden
    Dado que estoy en la página 4 de la exploración
    Cuando elijo el género «Comedia»
    Entonces la URL pasa a ser /explorar?genero=35
    Y vuelvo a la página 1 con las comedias más populares

  Escenario: Ordenar por nota o por fecha
    Cuando elijo «Mejor valoradas» o «Más recientes»
    Entonces solo se muestran películas con al menos 100 votos en TMDB

  Escenario: Restablecer los filtros
    Dado que he filtrado por género y puntuación mínima
    Cuando pulso «Restablecer filtros»
    Entonces la URL vuelve a /explorar y veo las películas más populares

  Escenario: Pasar de página
    Dado que hay más de una página de resultados
    Cuando pulso «Siguiente»
    Entonces la URL añade pagina=2 y conserva los filtros
    Y el foco pasa al título de los resultados
    Y «Anterior» está desactivado en la primera página y «Siguiente» en la última

  Escenario: Recuperar la exploración desde la URL
    Dado que abro /explorar?genero=878&nota=7&orden=vote_average.desc&pagina=2
    Entonces los filtros muestran esos valores y veo la página 2
    Y si vuelvo atrás desde una ficha recupero la misma búsqueda o los mismos filtros

  Escenario: Valores no válidos en la URL
    Cuando abro /explorar?genero=-3&nota=50&orden=titulo&pagina=abc
    Entonces se ignoran y veo las películas más populares en la página 1
