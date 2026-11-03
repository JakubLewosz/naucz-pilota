#!/usr/bin/env python3
"""Audyt 24 scen Naucz Pilota. Python >= 3.10, bez zewnętrznych zależności.

Uruchom z katalogu projektu: python3 tools/validate_missions.py
Opcjonalnie: python3 tools/validate_missions.py /ścieżka/missions.v1.json
To walidator danych projektowych i niezależna referencja matematyczna, nie backend gry.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Any

EPS = 1e-9
RADIUS = 0.12
MAX_COEFFICIENT = 10000
MAX_RATIONAL_BITS = 2048
ROLES = ("practice", "teach", "robot_transfer", "human_check")
ERROR_CODES = (
    "FAMILY_MISMATCH", "CONSTRAINT_VIOLATION", "START_MISS",
    "OUT_OF_BOUNDS", "OBSTACLE_COLLISION", "GATE_MISS",
)
SKILLS = (
    "line_intercept", "line_slope", "quadratic_vertical_shift",
    "quadratic_horizontal_shift", "quadratic_curvature", "combine_transformations",
)
RULES = (
    "RULE_LINE_INTERCEPT", "RULE_LINE_SLOPE", "RULE_QUAD_VERTICAL",
    "RULE_QUAD_HORIZONTAL", "RULE_QUAD_CURVATURE", "RULE_COMBINE",
)


class ExpressionError(ValueError):
    def __init__(self, code: str, detail: str):
        super().__init__(f"{code}: {detail}")
        self.code = code


@dataclass(frozen=True)
class PolyNode:
    # Wewnętrznie kolejność rosnąca: c0, c1, c2.
    coefficients: tuple[Fraction, Fraction, Fraction]
    depth: int


class PolynomialParser:
    """Ograniczony parser rekurencyjny. Nigdy nie wykonuje kodu użytkownika."""

    def __init__(self, expression: str):
        if not isinstance(expression, str) or not expression.strip():
            raise ExpressionError("EMPTY_EXPRESSION", "Wpisz wzór.")
        if len(expression) > 120:
            raise ExpressionError("EXPRESSION_TOO_COMPLEX", "Limit 120 znaków.")
        source = expression.strip().replace("−", "-").replace("×", "*").replace("²", "^2")
        source = re.sub(r"(?<=\d),(?=\d)", ".", source)
        source = re.sub(r"^(?:y|f\s*\(\s*x\s*\))\s*=\s*", "", source)
        self.tokens: list[tuple[str, str]] = []
        pos = 0
        while pos < len(source):
            if source[pos].isspace():
                pos += 1
                continue
            match = re.match(r"(?:\d+(?:\.\d*)?|\.\d+)", source[pos:])
            if match:
                token = match.group(0)
                self.tokens.append(("NUMBER", token))
                pos += len(token)
                continue
            match = re.match(r"[A-Za-z_][A-Za-z_0-9]*", source[pos:])
            if match:
                token = match.group(0)
                if token != "x":
                    raise ExpressionError("UNSUPPORTED_TOKEN", f"Nieobsługiwana nazwa: {token}.")
                self.tokens.append(("X", "x"))
                pos += 1
                continue
            char = source[pos]
            if char not in "+-*/^()":
                raise ExpressionError("UNSUPPORTED_TOKEN", f"Nieobsługiwany znak: {char!r}.")
            self.tokens.append((char, char))
            pos += 1
        self.tokens.append(("END", ""))
        self.index = 0
        self.nodes = 0
        self.parenthesis_depth = 0

    def peek(self) -> str:
        return self.tokens[self.index][0]

    def pop(self, expected: str | None = None) -> tuple[str, str]:
        token = self.tokens[self.index]
        if expected is not None and token[0] != expected:
            raise ExpressionError("SYNTAX_ERROR", f"Oczekiwano {expected}, otrzymano {token[0]}.")
        self.index += 1
        return token

    def node(self, coefficients: list[Fraction] | tuple[Fraction, ...], depth: int) -> PolyNode:
        self.nodes += 1
        if self.nodes > 64 or depth > 16:
            raise ExpressionError("EXPRESSION_TOO_COMPLEX", "Limit 64 węzłów lub głębokości 16.")
        values = tuple(coefficients) + (Fraction(0),) * max(0, 3 - len(coefficients))
        if any(value != 0 for value in values[3:]):
            raise ExpressionError("DEGREE_LIMIT", "Dozwolony jest wielomian stopnia najwyżej 2.")
        values = values[:3]
        for value in values:
            if abs(value) > MAX_COEFFICIENT:
                raise ExpressionError("COEFFICIENT_LIMIT", "Współczynnik przekracza 10000.")
            if max(abs(value.numerator).bit_length(), value.denominator.bit_length()) > MAX_RATIONAL_BITS:
                raise ExpressionError("EXPRESSION_TOO_COMPLEX", "Zbyt złożona arytmetyka wymierna.")
        return PolyNode(values, depth)  # type: ignore[arg-type]

    def binary(self, operator: str, left: PolyNode, right: PolyNode) -> PolyNode:
        a, b = left.coefficients, right.coefficients
        depth = 1 + max(left.depth, right.depth)
        if operator == "+":
            values = [a[i] + b[i] for i in range(3)]
        elif operator == "-":
            values = [a[i] - b[i] for i in range(3)]
        elif operator == "*":
            values = [Fraction(0) for _ in range(5)]
            for i in range(3):
                for j in range(3):
                    values[i + j] += a[i] * b[j]
        else:
            if b[1] != 0 or b[2] != 0:
                raise ExpressionError("NON_CONSTANT_DIVISOR", "Dzielić można tylko przez stałą.")
            if b[0] == 0:
                raise ExpressionError("DIVISION_BY_ZERO", "Dzielenie przez zero.")
            values = [value / b[0] for value in a]
        return self.node(values, depth)

    def parse(self) -> tuple[float, float, float]:
        result = self.sum()
        if self.peek() != "END":
            raise ExpressionError("SYNTAX_ERROR", "Nadmiarowe znaki lub brak działania.")
        c0, c1, c2 = result.coefficients
        converted = tuple(float(c) for c in (c2, c1, c0))
        if any(exact != 0 and approximate == 0 for exact, approximate in zip((c2, c1, c0), converted)):
            raise ExpressionError("COEFFICIENT_UNDERFLOW", "Niezerowy współczynnik jest zbyt mały dla float64.")
        if not all(math.isfinite(c) for c in converted):
            raise ExpressionError("COEFFICIENT_LIMIT", "Współczynnik musi być skończony.")
        return converted  # type: ignore[return-value]

    def sum(self) -> PolyNode:
        left = self.product()
        while self.peek() in ("+", "-"):
            operator = self.pop()[0]
            left = self.binary(operator, left, self.product())
        return left

    def product(self) -> PolyNode:
        left = self.unary()
        while True:
            if self.peek() in ("*", "/"):
                operator = self.pop()[0]
                left = self.binary(operator, left, self.unary())
            elif self.peek() in ("X", "("):
                # 2x, 2(x+1), x(x+1), (x+1)(x-1).
                left = self.binary("*", left, self.unary())
            else:
                return left

    def unary(self) -> PolyNode:
        if self.peek() in ("+", "-"):
            operator = self.pop()[0]
            self.parenthesis_depth += 1
            if self.parenthesis_depth > 16:
                raise ExpressionError("EXPRESSION_TOO_COMPLEX", "Za głęboko zagnieżdżony wzór.")
            value = self.unary()
            self.parenthesis_depth -= 1
            sign = -1 if operator == "-" else 1
            return self.node([sign * c for c in value.coefficients], value.depth + 1)
        return self.power()

    def power(self) -> PolyNode:
        value = self.atom()
        if self.peek() != "^":
            return value
        self.pop("^")
        token = self.pop("NUMBER")
        if token[1] not in ("0", "1", "2"):
            raise ExpressionError("UNSUPPORTED_EXPONENT", "Wykładnik musi być cyfrą 0, 1 lub 2.")
        exponent = int(token[1])
        # Wykładnik jest literalnym liściem AST, a potęgowanie oddzielnym węzłem.
        self.node([Fraction(exponent)], 1)
        if exponent == 0:
            if all(c == 0 for c in value.coefficients):
                raise ExpressionError("UNDEFINED_POWER", "Wyrażenie 0^0 jest niedozwolone.")
            return self.node([Fraction(1)], value.depth + 1)
        if exponent == 1:
            return self.node(value.coefficients, value.depth + 1)
        return self.binary("*", value, value)

    def atom(self) -> PolyNode:
        token = self.peek()
        if token == "NUMBER":
            return self.node([Fraction(self.pop()[1])], 1)
        if token == "X":
            self.pop()
            return self.node([Fraction(0), Fraction(1)], 1)
        if token == "(":
            self.pop()
            self.parenthesis_depth += 1
            if self.parenthesis_depth > 16:
                raise ExpressionError("EXPRESSION_TOO_COMPLEX", "Za dużo nawiasów.")
            result = self.sum()
            self.pop(")")
            self.parenthesis_depth -= 1
            return result
        raise ExpressionError("SYNTAX_ERROR", "Oczekiwano liczby, x lub nawiasu.")


def parse_expression(expression: str) -> tuple[float, float, float]:
    return PolynomialParser(expression).parse()


def value_at(coefficients: tuple[float, float, float], x: float) -> float:
    c2, c1, c0 = coefficients
    return (c2 * x + c1) * x + c0


def polynomial_range(coefficients: tuple[float, float, float], lo: float, hi: float) -> tuple[float, float]:
    if lo > hi:
        raise ValueError("Pusty przedział.")
    c2, c1, _ = coefficients
    points = [lo, hi]
    # Każdy rzeczywiście niezerowy c2; epsilon służy do porównania wyników, nie usuwania krzywizny.
    if c2 != 0:
        vertex_x = -c1 / (2 * c2)
        if lo <= vertex_x <= hi:
            points.append(vertex_x)
    values = [value_at(coefficients, x) for x in points]
    return min(values), max(values)


def family_of(coefficients: tuple[float, float, float]) -> str:
    c2, c1, _ = coefficients
    if c2 != 0:
        return "quadratic"
    return "linear" if c1 != 0 else "constant"


def fits_portal(coefficients: tuple[float, float, float], portal: dict[str, Any]) -> bool:
    y = value_at(coefficients, portal["x"])
    return portal["yMin"] + RADIUS - EPS <= y <= portal["yMax"] - RADIUS + EPS


def evaluate_scene(scene: dict[str, Any], coefficients: tuple[float, float, float]) -> str:
    """Zwraca pierwszą kategorię według uzgodnionego priorytetu, albo SUCCESS."""
    c2, c1, c0 = coefficients
    if family_of(coefficients) not in scene["allowedFamilies"]:
        return "FAMILY_MISMATCH"
    for name, value in scene["coefficientLocks"].items():
        if abs({"c2": c2, "c1": c1, "c0": c0}[name] - value) > EPS:
            return "CONSTRAINT_VIOLATION"
    if "vertexLock" in scene:
        if c2 == 0:
            return "CONSTRAINT_VIOLATION"
        vertex_x = -c1 / (2 * c2)
        vertex_y = value_at(coefficients, vertex_x)
        for axis, locked in scene["vertexLock"].items():
            if abs({"x": vertex_x, "y": vertex_y}[axis] - locked) > EPS:
                return "CONSTRAINT_VIOLATION"
    if not fits_portal(coefficients, scene["start"]):
        return "START_MISS"
    domain = scene["domain"]
    low, high = polynomial_range(coefficients, domain["xMin"], domain["xMax"])
    if low < domain["yMin"] + RADIUS - EPS or high > domain["yMax"] - RADIUS + EPS:
        return "OUT_OF_BOUNDS"
    for obstacle in scene["obstacles"]:
        lo = max(domain["xMin"], obstacle["xMin"] - RADIUS)
        hi = min(domain["xMax"], obstacle["xMax"] + RADIUS)
        if lo > hi + EPS:
            continue
        if lo > hi:  # Bezpieczna obsługa granic rozchodzących się jedynie o epsilon.
            lo = hi = (lo + hi) / 2
        bottom, top = polynomial_range(coefficients, lo, hi)
        if top >= obstacle["yMin"] - RADIUS - EPS and bottom <= obstacle["yMax"] + RADIUS + EPS:
            return "OBSTACLE_COLLISION"
    for portal in [*scene["gates"], scene["goal"]]:
        if not fits_portal(coefficients, portal):
            return "GATE_MISS"
    return "SUCCESS"


def require(condition: bool, message: str) -> None:
    if not condition:
        raise AssertionError(message)


def finite_number(value: Any) -> bool:
    return type(value) in (int, float) and math.isfinite(value)


def validate_json_schema(value: Any, schema: dict[str, Any], root: dict[str, Any], path: str = "$") -> None:
    """Bez zależności sprawdza cały użyty podzbiór JSON Schema z dołączonego pliku.

    Obsługiwane słowa: $ref, const, enum, type, required, properties,
    additionalProperties, items, min/maxItems, uniqueItems, min/maxProperties,
    min/maxLength, pattern, minimum, maximum. Metadane schematu są pomijane.
    """
    if "$ref" in schema:
        reference = schema["$ref"]
        require(reference.startswith("#/"), f"{path}: tylko lokalne $ref.")
        target: Any = root
        for segment in reference[2:].split("/"):
            target = target[segment.replace("~1", "/").replace("~0", "~")]
        validate_json_schema(value, target, root, path)
        return
    if "const" in schema:
        require(type(value) is type(schema["const"]) and value == schema["const"], f"{path}: niezgodne const.")
    if "enum" in schema:
        require(value in schema["enum"], f"{path}: wartość poza enum.")
    expected = schema.get("type")
    predicates = {
        "object": lambda v: type(v) is dict,
        "array": lambda v: type(v) is list,
        "string": lambda v: type(v) is str,
        "number": finite_number,
        "integer": lambda v: type(v) is int,
        "boolean": lambda v: type(v) is bool,
    }
    if expected:
        require(predicates[expected](value), f"{path}: oczekiwano {expected}.")
    if isinstance(value, dict):
        for key in schema.get("required", []):
            require(key in value, f"{path}: brak {key}.")
        properties = schema.get("properties", {})
        if schema.get("additionalProperties") is False:
            require(set(value) <= set(properties), f"{path}: nieznane pola {set(value) - set(properties)}.")
        require(len(value) >= schema.get("minProperties", 0), f"{path}: za mało pól.")
        require(len(value) <= schema.get("maxProperties", math.inf), f"{path}: za dużo pól.")
        for key, item in value.items():
            if key in properties:
                validate_json_schema(item, properties[key], root, f"{path}.{key}")
    elif isinstance(value, list):
        require(len(value) >= schema.get("minItems", 0), f"{path}: za mało elementów.")
        require(len(value) <= schema.get("maxItems", math.inf), f"{path}: za dużo elementów.")
        if schema.get("uniqueItems"):
            require(len({json.dumps(v, sort_keys=True) for v in value}) == len(value), f"{path}: duplikaty.")
        for index, item in enumerate(value):
            validate_json_schema(item, schema.get("items", {}), root, f"{path}[{index}]")
    elif isinstance(value, str):
        require(len(value) >= schema.get("minLength", 0), f"{path}: zbyt krótki tekst.")
        require(len(value) <= schema.get("maxLength", math.inf), f"{path}: zbyt długi tekst.")
        if "pattern" in schema:
            require(re.search(schema["pattern"], value) is not None, f"{path}: niezgodny wzorzec tekstu.")
    elif finite_number(value):
        require(value >= schema.get("minimum", -math.inf), f"{path}: poniżej minimum.")
        require(value <= schema.get("maximum", math.inf), f"{path}: powyżej maksimum.")


def check_formula(item: dict[str, Any], where: str) -> tuple[float, float, float]:
    coefficients = parse_expression(item["expression"])
    declared = tuple(item[key] for key in ("c2", "c1", "c0"))
    require(all(abs(a - b) <= EPS for a, b in zip(coefficients, declared)), f"{where}: tekst wzoru i współczynniki różnią się: {coefficients} vs {declared}.")
    return coefficients


def self_checks() -> int:
    count = 0
    good = {
        "2x+1": (0, 2, 1),
        "f(x)=0.25(x-2)²+1": (0.25, -1, 2),
        "-x^2": (-1, 0, 0),
        "(-x)^2": (1, 0, 0),
        "(x+1)(x-1)": (1, 0, -1),
        "x/(2+2)": (0, 0.25, 0),
        "y = .5*x - 2": (0, 0.5, -2),
        "(x-x+2)^2": (0, 0, 4),
        "1/(0.1x+0.2x-0.3x+1)": (0, 0, 1),
        "x^0": (0, 0, 1),
        "2^1": (0, 0, 2),
        "x+(-x)": (0, 0, 0),
        "0,5x+1,25": (0, 0.5, 1.25),
    }
    for expression, expected in good.items():
        require(parse_expression(expression) == expected, f"self-check parser {expression}")
        count += 1
    bad = [
        "", "sin(x)", "x^3", "x*x*x", "1/x", "1/0", "x/0.0000000001x",
        "x^2^2", "x^-1", "window.alert(1)", "__import__('os')", "x;y", "NaN", "Infinity",
        "10001*x", "10000*10000", "x,2", "x2", "0^0", "(" * 17 + "x" + ")" * 17,
        "-" * 17 + "x", "x" * 121,
        "1,2,3", "(" * 7 + "0.0001" + ")^2" * 7,
    ]
    for expression in bad:
        try:
            parse_expression(expression)
        except ExpressionError:
            count += 1
        else:
            raise AssertionError(f"Nie odrzucono niepoprawnego wzoru {expression!r}.")
    require(polynomial_range((1, -2, 0), 0, 2) == (-1, 0), "Wewnętrzny wierzchołek musi być uwzględniony.")
    count += 1
    # Kontakty i bardzo wąska przeszkoda między dowolnymi punktami próbkowania.
    base = {
        "domain": {"xMin": 0, "xMax": 4, "yMin": -2, "yMax": 3},
        "allowedFamilies": ["constant", "linear", "quadratic"], "coefficientLocks": {},
        "start": {"x": 0, "yMin": -0.5, "yMax": 0.5},
        "goal": {"x": 4, "yMin": -0.5, "yMax": 0.5}, "gates": [], "obstacles": [],
    }
    base["obstacles"] = [{"id": "thin", "xMin": 1.500001, "xMax": 1.500002, "yMin": 0.12, "yMax": 1}]
    require(evaluate_scene(base, (0, 0, 0)) == "OBSTACLE_COLLISION", "Dotknięcie cienkiej przeszkody musi być kolizją.")
    count += 1
    base["obstacles"][0]["yMin"] = 0.120001
    require(evaluate_scene(base, (0, 0, 0)) == "SUCCESS", "Dodatni odstęp od przeszkody nie jest kolizją.")
    count += 1
    base["obstacles"] = []
    base["start"] = {"x": 0, "yMin": -0.12, "yMax": 0.12}
    require(evaluate_scene(base, (0, 0, 0)) == "SUCCESS", "Dokładne zmieszczenie w bramce jest dozwolone.")
    count += 1
    base["start"] = {"x": 0, "yMin": -0.5, "yMax": 0.5}
    base["domain"]["yMin"] = -0.8
    require(evaluate_scene(base, (0.25, -1, 0)) == "OUT_OF_BOUNDS", "Wewnętrzne wyjście poza planszę nie może umknąć testowi końców.")
    count += 1
    return count


def validate_package(missions_path: Path) -> tuple[int, int, int]:
    data = json.loads(missions_path.read_text(encoding="utf-8"))
    schema_path = missions_path.with_name("missions.schema.json")
    schema = json.loads(schema_path.read_text(encoding="utf-8"))
    validate_json_schema(data, schema, schema)
    skills_doc = json.loads(missions_path.with_name("skills.v1.json").read_text(encoding="utf-8"))
    require(skills_doc["schemaVersion"] == "1.0.0", "Niezgodna wersja skills.")
    skills = {skill["id"]: skill for skill in skills_doc["skills"]}
    require(len(skills_doc["skills"]) == 6 and set(skills) == set(SKILLS), "Niezgodny słownik 6 umiejętności.")
    seen_scene_ids: set[str] = set()
    failures = 0
    scenes = 0
    for index, mission in enumerate(data["missions"]):
        expected_id = f"M{index+1:02d}"
        require(mission["id"] == expected_id and mission["order"] == index + 1, f"Błędna kolejność {expected_id}.")
        require(mission["skillId"] == SKILLS[index], f"Błędna umiejętność {expected_id}.")
        require(mission["canonicalRuleId"] == RULES[index], f"Błędna reguła {expected_id}.")
        skill = skills[mission["skillId"]]
        require(skill["canonicalRuleId"] == mission["canonicalRuleId"], f"Słownik reguł {expected_id}.")
        require(skill["canonicalRuleText"] == mission["ruleText"], f"Tekst reguły kanonicznej {expected_id}.")
        require(skill["misconceptionId"] == mission["misconceptionId"], f"Słownik błędów {expected_id}.")
        for role in ROLES:
            scene = mission["scenes"][role]
            sid = scene["id"]
            require(sid == f"{expected_id}-{role}" and scene["role"] == role, f"Id/rola {sid}.")
            require(sid not in seen_scene_ids, f"Powtórzone ID {sid}.")
            seen_scene_ids.add(sid)
            d = scene["domain"]
            require(d["xMin"] < d["xMax"] and d["yMin"] < d["yMax"], f"{sid}: pusty obszar.")
            require(abs(scene["start"]["x"] - d["xMin"]) <= EPS, f"{sid}: start musi leżeć na lewej krawędzi dziedziny.")
            require(abs(scene["goal"]["x"] - d["xMax"]) <= EPS, f"{sid}: meta musi leżeć na prawej krawędzi dziedziny.")
            local_ids = ["start", "goal"]
            last_x = d["xMin"]
            for gate in scene["gates"]:
                require(last_x < gate["x"] < d["xMax"], f"{sid}: bramki muszą być uporządkowane i wewnątrz dziedziny.")
                last_x = gate["x"]
                local_ids.append(gate["id"])
            for portal in [scene["start"], *scene["gates"], scene["goal"]]:
                require(portal["yMax"] - portal["yMin"] >= 2 * RADIUS - EPS, f"{sid}: przejście węższe niż robot.")
                require(d["yMin"] <= portal["yMin"] < portal["yMax"] <= d["yMax"], f"{sid}: przejście poza widokiem.")
            for obstacle in scene["obstacles"]:
                local_ids.append(obstacle["id"])
                require(d["xMin"] <= obstacle["xMin"] < obstacle["xMax"] <= d["xMax"], f"{sid}: błędna przeszkoda x.")
                require(d["yMin"] <= obstacle["yMin"] < obstacle["yMax"] <= d["yMax"], f"{sid}: błędna przeszkoda y.")
            require(len(set(local_ids)) == len(local_ids), f"{sid}: powtórzone ID bramek/przeszkód.")
            parse_expression(scene["initialExpression"])
            witness = check_formula(scene["witness"], f"{sid}.witness")
            require(evaluate_scene(scene, witness) == "SUCCESS", f"{sid}: rozwiązanie referencyjne nie przechodzi: {evaluate_scene(scene, witness)}.")
            for j, wrong in enumerate(scene["knownFailures"]):
                coefficients = check_formula(wrong, f"{sid}.knownFailures[{j}]")
                outcome = evaluate_scene(scene, coefficients)
                require(outcome == wrong["expectedCode"], f"{sid}: błąd {wrong['expression']!r}: oczekiwano {wrong['expectedCode']}, otrzymano {outcome}.")
                failures += 1
            scenes += 1
        transfer = mission["scenes"]["robot_transfer"]
        human = mission["scenes"]["human_check"]
        require(tuple(transfer["witness"][key] for key in ("c2", "c1", "c0")) != tuple(human["witness"][key] for key in ("c2", "c1", "c0")), f"{expected_id}: samodzielna próba kopiuje wzór transferu robota.")
        require(evaluate_scene(human, parse_expression(human["initialExpression"])) != "SUCCESS", f"{expected_id}: początkowy wzór rozwiązuje samodzielną próbę.")
        require(any(transfer[key] != human[key] for key in ("domain", "gates", "obstacles", "start", "goal")), f"{expected_id}: samodzielna próba kopiuje planszę transferu robota.")
    require(scenes == 24, "Wymagane dokładnie 24 sceny.")
    return len(data["missions"]), scenes, failures


def main() -> int:
    parser = argparse.ArgumentParser(description="Sprawdź schemat JSON, matematykę 24 scen i parser Naucz Pilota.")
    parser.add_argument("missions_path", nargs="?", type=Path, default=Path(__file__).resolve().parents[1] / "content" / "missions.v1.json", help="Plik missions.v1.json; schemat i skills.v1.json muszą leżeć obok niego.")
    parser.add_argument("--json-report", type=Path, help="Zapisz zwięzły maszynowo czytelny raport w podanym pliku.")
    args = parser.parse_args()
    path = args.missions_path
    try:
        checks = self_checks()
        missions, scenes, failures = validate_package(path)
    except (AssertionError, ExpressionError, ValueError, KeyError, OSError) as error:
        if args.json_report:
            args.json_report.parent.mkdir(parents=True, exist_ok=True)
            args.json_report.write_text(json.dumps({"ok": False, "error": str(error)}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"BŁĄD: {error}", file=sys.stderr)
        return 1
    if args.json_report:
        args.json_report.parent.mkdir(parents=True, exist_ok=True)
        args.json_report.write_text(json.dumps({"ok": True, "schemaVersion": "1.0.0", "missions": missions, "scenes": scenes, "successfulWitnesses": scenes, "checkedKnownFailures": failures, "parserAndGeometryChecks": checks, "schemaValid": True, "expressionsMatchCoefficients": True, "humanChecksDistinctFromRobotTransfer": True}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"OK: {missions} misji; {scenes} scen; {scenes} rozwiązań witness; {failures} znanych błędów; {checks} kontroli parsera i geometrii.")
    print("JSON Schema: OK. Równania = współczynniki: OK. Wszystkie tory witness: SUCCESS. Transfer robota i human_check: odrębne.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
