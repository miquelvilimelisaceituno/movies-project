import unittest
from unittest.mock import Mock, patch

import requests

from app import create_app


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.app = create_app({"TESTING": True, "TMDB_READ_ACCESS_TOKEN": "test-token"})
        self.client = self.app.test_client()
        patcher = patch("app.requests.get")
        self.get = patcher.start()
        self.addCleanup(patcher.stop)
        self.get.return_value = Mock(status_code=200)
        self.get.return_value.json.return_value = {"results": []}

    def test_all_routes_forward_to_fixed_tmdb_host(self):
        routes = [
            "discover/movie?page=2&with_genres=878&vote_average.gte=7",
            "search/movie?query=Alien&page=1",
            "search/person?query=Scott",
            "search/keyword?query=space",
            "genre/movie/list",
            "trending/movie/week",
            "movie/550",
            "person/287",
        ]
        for route in routes:
            with self.subTest(route=route):
                response = self.client.get("/api/tmdb/" + route)
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json, {"results": []})
                args, kwargs = self.get.call_args
                self.assertEqual(args[0], "https://api.themoviedb.org/3/" + route.split("?")[0])
                self.assertEqual(kwargs["headers"]["Authorization"], "Bearer test-token")
                self.assertEqual(kwargs["timeout"], (3.05, 10))
                self.assertFalse(kwargs["allow_redirects"])
                self.assertNotIn("test-token", response.get_data(as_text=True))

    def test_details_include_related_data(self):
        for route, append in [("movie/550", "credits,videos"), ("person/287", "movie_credits")]:
            self.client.get("/api/tmdb/" + route)
            self.assertEqual(self.get.call_args.kwargs["params"]["append_to_response"], append)

    def test_search_preserves_text_and_defaults(self):
        self.client.get("/api/tmdb/search/movie", query_string={"query": " Amélie & Alien ", "page": "2"})
        self.assertEqual(self.get.call_args.kwargs["params"], {
            "query": "Amélie & Alien", "page": "2", "language": "es-ES", "include_adult": "false",
        })

    def test_invalid_parameters_never_reach_tmdb(self):
        routes = [
            "discover/movie?page=0", "discover/movie?page=501", "discover/movie?page=abc",
            "discover/movie?page=1&page=2", "discover/movie?vote_average.gte=11",
            "discover/movie?vote_average.gte=nan", "discover/movie?with_genres=-1",
            "discover/movie?sort_by=unknown", "discover/movie?url=https://example.com",
            "search/movie?query=", "search/movie", "search/movie?query=x&with_genres=1",
            "movie/0", "movie/1?api_key=secret", "movie/1?append_to_response=account_states",
            "trending/movie/year", "genre/movie/list?language=bad",
        ]
        for route in routes:
            with self.subTest(route=route):
                self.assertEqual(self.client.get("/api/tmdb/" + route).status_code, 400)
        self.get.assert_not_called()

    def test_unknown_route_and_write_are_rejected(self):
        self.assertEqual(self.client.get("/api/tmdb/account").status_code, 404)
        self.assertEqual(self.client.post("/api/tmdb/movie/550").status_code, 405)
        self.get.assert_not_called()

    def test_missing_token(self):
        self.app.config["TMDB_READ_ACCESS_TOKEN"] = ""
        self.assertEqual(self.client.get("/api/tmdb/movie/550").status_code, 503)
        self.get.assert_not_called()

    def test_upstream_errors_are_sanitized(self):
        for upstream, expected in [(401, 502), (403, 502), (404, 404), (429, 429), (500, 502), (302, 502)]:
            with self.subTest(upstream=upstream):
                self.get.return_value.status_code = upstream
                self.get.return_value.json.return_value = {"secret": "private-upstream-detail"}
                response = self.client.get("/api/tmdb/movie/550")
                self.assertEqual(response.status_code, expected)
                self.assertIn("message", response.json["error"])
                self.assertNotIn("private-upstream-detail", response.get_data(as_text=True))

    def test_network_errors_and_invalid_json(self):
        for exception, status in [(requests.Timeout(), 504), (requests.ConnectionError(), 502)]:
            self.get.side_effect = exception
            self.assertEqual(self.client.get("/api/tmdb/movie/550").status_code, status)
        self.get.side_effect = None
        self.get.return_value.json.side_effect = ValueError()
        self.assertEqual(self.client.get("/api/tmdb/movie/550").status_code, 502)


if __name__ == "__main__":
    unittest.main()
