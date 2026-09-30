"""API de lectura del catálogo. Las preferencias de usuarios se implementan aparte."""

import os
import re
from pathlib import Path

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException

TMDB_URL = "https://api.themoviedb.org/3"
COMMON_PARAMS = {"language", "page"}
DISCOVER_PARAMS = COMMON_PARAMS | {
    "with_genres", "vote_average.gte", "primary_release_year", "sort_by",
    "with_keywords", "with_cast",
}


def create_app(test_config=None):
    load_dotenv(Path(__file__).with_name(".env"))
    app = Flask(__name__)
    app.config["TMDB_READ_ACCESS_TOKEN"] = os.getenv("TMDB_READ_ACCESS_TOKEN", "")
    if test_config:
        app.config.update(test_config)

    def error(message, status):
        return jsonify(error={"message": message}), status

    @app.errorhandler(HTTPException)
    def http_error(exc):
        return error(exc.description, exc.code)

    def params_for(allowed, search=False):
        params = {"language": "es-ES"} if "language" in allowed else {}
        for key in request.args:
            if key not in allowed or len(request.args.getlist(key)) != 1:
                raise ValueError("Parámetro no permitido o repetido: " + key)
            value = request.args[key].strip()
            if key == "language" and not re.fullmatch(r"[a-z]{2}-[A-Z]{2}", value):
                raise ValueError("El idioma debe tener el formato es-ES.")
            if key in {"page", "primary_release_year"}:
                maximum = 500 if key == "page" else 9999
                if not value.isascii() or not value.isdigit() or not 1 <= int(value) <= maximum:
                    raise ValueError(f"{key} debe estar entre 1 y {maximum}.")
            if key == "vote_average.gte":
                if not re.fullmatch(r"\d+(\.\d+)?", value) or not 0 <= float(value) <= 10:
                    raise ValueError("La puntuación debe estar entre 0 y 10.")
            if key in {"with_genres", "with_keywords", "with_cast"}:
                if len(value) > 200 or not re.fullmatch(r"[1-9][0-9]*(,[1-9][0-9]*)*", value):
                    raise ValueError(f"{key} debe contener IDs positivos separados por comas.")
            if key == "sort_by" and value not in {
                "popularity.desc", "popularity.asc", "vote_average.desc",
                "vote_average.asc", "primary_release_date.desc", "primary_release_date.asc",
            }:
                raise ValueError("Ordenación no permitida.")
            if key == "query" and not 1 <= len(value) <= 200:
                raise ValueError("La búsqueda debe contener entre 1 y 200 caracteres.")
            params[key] = value
        if search and not params.get("query"):
            raise ValueError("Falta el texto de búsqueda.")
        return params

    def forward(path, allowed, *, search=False, extra=None):
        try:
            params = params_for(allowed, search)
        except ValueError as exc:
            return error(str(exc), 400)
        params.update(extra or {})
        token = app.config["TMDB_READ_ACCESS_TOKEN"].strip()
        if not token:
            return error("Falta configurar el token de TMDB en el servidor.", 503)
        try:
            response = requests.get(
                f"{TMDB_URL}/{path}",
                params=params,
                headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
                timeout=(3.05, 10),
                allow_redirects=False,
            )
        except requests.Timeout:
            return error("TMDB ha tardado demasiado en responder. Inténtalo de nuevo.", 504)
        except requests.RequestException:
            return error("No se ha podido conectar con TMDB.", 502)

        if response.status_code == 404:
            return error("No se ha encontrado el contenido solicitado.", 404)
        if response.status_code == 429:
            return error("Se ha alcanzado el límite de consultas. Inténtalo más tarde.", 429)
        if response.status_code != 200:
            # No reenviar errores internos ni credenciales del proveedor al navegador.
            return error("No se ha podido obtener información de TMDB.", 502)
        try:
            return jsonify(response.json())
        except ValueError:
            return error("TMDB ha devuelto una respuesta no válida.", 502)

    @app.get("/api/tmdb/discover/movie")
    def discover_movies():
        return forward("discover/movie", DISCOVER_PARAMS, extra={"include_adult": "false"})

    @app.get("/api/tmdb/search/movie")
    def search_movies():
        return forward("search/movie", COMMON_PARAMS | {"query"}, search=True,
                       extra={"include_adult": "false"})

    @app.get("/api/tmdb/search/person")
    def search_people():
        return forward("search/person", COMMON_PARAMS | {"query"}, search=True,
                       extra={"include_adult": "false"})

    @app.get("/api/tmdb/search/keyword")
    def search_keywords():
        return forward("search/keyword", {"query", "page"}, search=True)

    @app.get("/api/tmdb/genre/movie/list")
    def genres():
        return forward("genre/movie/list", {"language"})

    @app.get("/api/tmdb/trending/movie/<window>")
    def trending_movies(window):
        if window not in {"day", "week"}:
            return error("El periodo debe ser day o week.", 400)
        return forward(f"trending/movie/{window}", {"language"})

    @app.get("/api/tmdb/movie/<int:movie_id>")
    def movie_details(movie_id):
        if movie_id < 1:
            return error("El ID debe ser positivo.", 400)
        return forward(f"movie/{movie_id}", {"language"},
                       extra={"append_to_response": "credits,videos"})

    @app.get("/api/tmdb/person/<int:person_id>")
    def person_details(person_id):
        if person_id < 1:
            return error("El ID debe ser positivo.", 400)
        return forward(f"person/{person_id}", {"language"},
                       extra={"append_to_response": "movie_credits"})

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(port=5001)
