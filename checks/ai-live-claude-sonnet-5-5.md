# Test live: Claude Sonnet 5.5, prompt 2.0.0 („Piko uczy się od gracza”)

Data: 22 listopada 2026. Model `claude-sonnet-5-5`, wysiłek `medium`. Od promptu 2.0.0 Piko w locie nie dostaje kanonicznej zasady, tylko notatki z lekcji gracza i własne przekonanie zapisane w lekcji (`pikoBeliefPL`).

## Zestaw standardowy (22 tury)

`npm run test:ai:live -- --allow-paid --max-calls 44`, surowy zapis: [ai-live-results.json](ai-live-results.json).

| Wynik | Wartość |
|---|---|
| Tury zgodne ze schematem i fazą gry | 22/22, jedno żądanie na turę |
| Przekonania Piko wiernie oddają słowa gracza | tak, także błędne: SEM04 „nawias (x+1) przesuwa w prawo” zapisane jako błędne przekonanie; puste wyjaśnienia dają „Jeszcze nie wiem…” |
| Loty Piko z poprawnymi lekcjami wzorcowymi | 5/6 udanych; w M06 lekcja nie mówiła, jak dobrać współczynnik a, i Piko go zgadł |
| Mediana czasu odpowiedzi | ok. 4,2 s |

## Czy lot zależy od lekcji? (M04, ta sama trasa)

| Lekcja gracza | Wzór Piko | Wynik gry |
|---|---|---|
| „Nawias (x+1) zeruje się dla x=-1, więc wierzchołek w lewo…” | `0.25*(x-2)^2` | udany lot |
| „Plus w nawiasie przesuwa w prawo, minus w lewo” | `0.25(x+2)^2` | rozbicie (START_MISS) |
| „Trzeba zmienić minus na plus” | `0.25*(x+2)^2`, „w lekcji zabrakło mi, skąd wziąć liczbę” | rozbicie |
| Błędna lekcja bez rozmowy z Piko | `0.25(x+2)^2` | rozbicie |

W interfejsie (M01) błędna lekcja „liczba bez x mówi, o ile tor jest niżej od 4” dała wzór `1` i rozbicie. Po „Popraw lekcję” i poprawnym wyjaśnieniu Piko zaproponował `3` i przeleciał.

Wcześniejsze wyniki (prompt 1.3.1, gdy Piko w locie znał kanoniczną zasadę): 22/22 i 6/6 lotów niezależnie od jakości lekcji. Ta niezależność była powodem zmiany.
