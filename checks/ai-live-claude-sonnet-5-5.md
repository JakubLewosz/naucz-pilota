# Test live: Claude Sonnet 5.5, prompt 2.1.0 („Piko uczy się od gracza”)

Data: 22 listopada 2026. Model `claude-sonnet-5-5`, wysiłek `medium`. Od promptu 2.0.0 Piko w locie nie dostaje kanonicznej zasady, tylko notatki z lekcji gracza i własne przekonanie zapisane w lekcji (`pikoBeliefPL`).

## Zestaw standardowy (22 tury)

`npm run test:ai:live -- --allow-paid --max-calls 44`, surowy zapis: [ai-live-results.json](ai-live-results.json).

| Wynik | Wartość |
|---|---|
| Tury zgodne ze schematem i fazą gry | 22/22, jedno żądanie na turę |
| Przekonania Piko wiernie oddają słowa gracza | tak, także błędne: SEM04 „nawias (x+1) przesuwa w prawo” zapisane jako błędne przekonanie; puste wyjaśnienia dają „Jeszcze nie wiem…” |
| Loty Piko z poprawnymi lekcjami wzorcowymi | 5/6 udanych; w M06 lekcja nie mówiła, jak dobrać współczynnik a, i Piko go zgadł |
| Mediana czasu odpowiedzi | ok. 4,0 s |

## Czy lot zależy od lekcji? (M04, ta sama trasa)

| Lekcja gracza | Wzór Piko | Wynik gry |
|---|---|---|
| „Nawias (x+1) zeruje się dla x=-1, więc wierzchołek w lewo…” | `0.25*(x-2)^2` | udany lot |
| „Plus w nawiasie przesuwa w prawo, minus w lewo” | `0.25(x+2)^2` | rozbicie (START_MISS) |
| „Trzeba zmienić minus na plus” | `0.25*(x+2)^2`, „w lekcji zabrakło mi, skąd wziąć liczbę” | rozbicie |
| Błędna lekcja bez rozmowy z Piko | `0.25(x+2)^2` | rozbicie |

W interfejsie (M01) błędna lekcja „liczba bez x mówi, o ile tor jest niżej od 4” dała wzór `1` i rozbicie. Po „Popraw lekcję” i poprawnym wyjaśnieniu Piko zaproponował `3` i przeleciał.

Wcześniejsze wyniki (prompt 1.3.1, gdy Piko w locie znał kanoniczną zasadę): 22/22 i 6/6 lotów niezależnie od jakości lekcji. Ta niezależność była powodem zmiany.

## Prompt 2.1.0: lekcja bez treści nie pozwala zgadywać z planszy

W 2.0.0 Piko przy bzdurnej lekcji w M01 odczytywał wysokość wprost z planszy i przelatywał. Od 2.1.0 przy lekcji pustej, niezrozumiałej lub o czymś innym zostaje przy wzorze początkowym i mówi, czego zabrakło.

| Lekcja | Wzór Piko | Wynik |
|---|---|---|
| M01 „Banany są żółte, a niebo niebieskie.” | `1` | rozbicie |
| M01 „Trzeba zmienić wzór i będzie dobrze.” | `1` | rozbicie |
| M01 „Liczba bez x to wysokość całego toru.” | `3` | udany lot |
| M04 lekcja pełna | `0.25*(x-2)^2` | udany lot |
| M04 „Plus przesuwa w prawo” | `0,25(x+2)^2` | rozbicie |

Zestaw standardowy na 2.1.0: 22/22 tur poprawnych, 5/6 lotów z lekcjami wzorcowymi (M06: lekcja nie mówi, jak dobrać współczynnik a).
