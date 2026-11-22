# Test live: Claude Sonnet 5.5 (prompt 1.3.0)

Data: 22 listopada 2026. Model `claude-sonnet-5-5`, wysiłek rozumowania `medium`, limit 8192 tokenów.
Polecenie: `npm run test:ai:live -- --allow-paid --max-calls 44`. Surowy zapis: [ai-live-results.json](ai-live-results.json).

| Wynik | Wartość |
|---|---|
| Tury (10 semantycznych + 6 lekcji + 6 transferów) | 22/22 PASS strukturalnie, 1 żądanie na turę, bez ponowień |
| Loty transferowe Piko zaliczone przez silnik gry | **6/6** (M01–M06) |
| Mediana czasu odpowiedzi | 3,9 s (maks. 7,0 s) |
| Zużycie | 109 321 tokenów wejścia, 8 457 wyjścia, ok. 0,30 USD za cały zestaw |
| Żargon techniczny w wypowiedziach do gracza | brak („silnik”, „fakt”, „JSON”, identyfikatory) |

Porównanie z wcześniejszymi próbami (te same 22 tury): GPT-5.4 mini z promptem 1.0.2 zaliczał 2/6 transferów;
GPT-6 Luna Extra High miał medianę odpowiedzi ok. 16,5 s.

Przykład transferu M06: „Biorę z notatki to, że w y=a(x-p)^2+q wierzchołek to (p,q) … ustawiam tam wierzchołek: p=-2, q=1 … Proponuję ten wzór, a grę poproszę o sprawdzenie.” Wzór `0.25*(x+2)^2+1`, silnik: bezpieczny lot.

Ocena jakości dialogu przez człowieka (rubryka w raporcie JSON) pozostaje do wykonania.
