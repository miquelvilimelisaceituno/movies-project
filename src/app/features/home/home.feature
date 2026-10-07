# language: es
Característica: Página de bienvenida
  Como cinéfilo
  Quiero ver una bienvenida con las películas en tendencia
  Para empezar a descubrir películas o ir directamente a explorar

  Escenario: Abrir la aplicación
    Cuando entro en la raíz de la aplicación
    Entonces veo la página de bienvenida en /
    Y se piden a TMDB las tendencias de la semana
    Y mientras llegan veo un mensaje de carga

  Escenario: Ir a explorar
    Dado que estoy en la página de bienvenida
    Cuando pulso «Explorar películas»
    Entonces se abre la página de exploración en /explorar

  Escenario: Ver las tendencias de la semana
    Dado que TMDB devuelve las películas en tendencia
    Entonces veo una tarjeta por película
    Y el título de cada tarjeta enlaza a su ficha /peliculas/:id

  Escenario: Sin tendencias
    Dado que TMDB no devuelve ninguna película
    Entonces veo el mensaje «No hay tendencias que mostrar.»

  Escenario: Reintentar tras un error
    Dado que TMDB no responde
    Cuando veo el mensaje de error
    Y pulso «Reintentar»
    Entonces se repite la petición
    Y veo las tendencias si esta vez responde
