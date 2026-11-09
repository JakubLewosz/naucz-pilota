# Odbiór live M04 A/B/C — 9 listopada 2026

**Pełny przepływ działa. Transfer wymaga poprawy przed pokazem jury jako dowód zastosowania lekcji na nowej planszy.** Piko rozróżnił trzy wyjaśnienia w rozmowie. Na nowej planszy tylko w A odwołał się do konkretnego fragmentu wyjaśnienia. Wszystkie trzy propozycje minęły start.

## Warunki

- Gałąź `codex/jury-readiness`, commit `a751a1cd8ceb98d89410571e9076b194652f0493`, prompt `1.1.0`, macOS arm64, Node `24.11.0`, lokalny backend z Chromium. Żądania Responses API zwróciły snapshot `gpt-5.4-mini-2026-03-17` dla aliasu `gpt-5.4-mini`.
- M01–M03 przeszły w demo w ramach przygotowania stanu. Każdy wariant wystartował w trybie live z identycznego zapisu przeglądarki tuż po sprawdzeniu wzoru `0.25(x+1)^2` i dwóch prognoz `0.25` w M04. W stanie startowym brakowało wyjaśnienia, zapisanej reguły M04 i cookie sesji. Trzy nowe sesje miały różne identyfikatory. Żądania teach miały te same dane poza tekstem i identyfikatorami, a żądania transferu różniły się notatką i identyfikatorami.
- Po prawdziwej odpowiedzi kliknięto „Zapisz tę zasadę dla Piko”. W A, B i C notatka `RULE_QUAD_HORIZONTAL` zawierała dosłowny tekst gracza i pierwszą wypowiedź Piko przytoczoną poniżej. We wszystkich przypadkach zapis miał `source: live` i `confirmation: saved_by_player`. Po odświeżeniu ta sama notatka trafiła do żądania OpenAI jako cytat w roli `user`. Kanoniczna reguła trafiła w kontekście `developer`.
- Wykorzystano **6 z 12** dopuszczonych żądań HTTP, bez ponowień. Dziennik odnotował 6 rezerwacji i 6 odpowiedzi HTTP 200. Limit działa przed wysłaniem żądania i liczy ponowienia. W osobnej próbie technicznej z atrapą celowo błędna pierwsza odpowiedź zwiększyła licznik do siedmiu prób, przy zerze wywołań OpenAI.
- [Surowy raport runnera](ai-live-m04-abc-1.1.0.json) zawiera niezmienione odpowiedzi modelu, koperty aplikacji, notatki, identyfikatory i dane o zużyciu. `PASS` w raporcie oznacza poprawny przebieg techniczny, w tym zgodność faktycznego wyniku lotu z silnikiem. Ocena semantyczna poniżej pochodzi z lektury transkryptów przez Codex. Odbiór przez człowieka pozostaje **NOT REVIEWED**.

## A — poprawne wyjaśnienie

**Gracz** „Dla x = −1 nawias x + 1 jest równy zero, więc tam leży wierzchołek. Plus w nawiasie oznacza przesunięcie w lewo.”

**Piko w teach, zapisane jako parafraza**

> Rozumiem: dla x = -1 rzeczywiście x + 1 daje 0, więc wierzchołek jest przy x = -1. Znak plus w nawiasie przesuwa parabolę w lewo.

> Czy mam też wskazać, jak z tego odczytać punkt startu i bramki?

**Piko na nowej planszy**

> Spróbuję użyć przesunięcia w lewo zgodnie z nawiasem, ale na tej trasie nie jestem pewien, czy to wystarczy.

**Lot** `0.25(x+2)^2` → `START_MISS`. Dla `x=-1` wzór daje `y=0.25`, poniżej zakresu startu `[1.87, 2.63]`.

**Ocena** W teach Piko trafnie parafrazuje zerowanie nawiasu i położenie wierzchołka (`sound`). Pytanie o to, czy ma coś wskazać, słabiej pasuje do roli ucznia niż pytanie o rozumowanie gracza. W transferze Piko przywołuje przesunięcie w lewo, lecz przepisuje wzór początkowy nowej planszy. Powiązanie słowne z lekcją jest widoczne. Zastosowanie jej do geometrii nowej trasy jest niewystarczające.

## B — błąd matematyczny

**Gracz** „Plus w nawiasie przesuwa parabolę w prawo.”

**Piko w teach, zapisane jako parafraza**

> Widzę sprzeczność: tutaj „plus w nawiasie” daje przesunięcie w lewo, nie w prawo. Chodzi mi o znak przy x, więc poprawiłbym to na zgodne z regułą poziomego przesunięcia.

> Czy mam sprawdzić to na przykładzie wzoru z kandydatem?

**Piko na nowej planszy**

> Spróbuję przesunąć parabolę tak, by przeszła przez bramki i ominęła przeszkodę, zachowując ten sam kształt.

**Lot** `0.25(x-1)^2` → `START_MISS`. Dla `x=-1` wzór daje `y=1`.

**Ocena** W teach Piko poprawnie wykrywa odwrócony kierunek (`incorrect`). „Znak przy x” jest nieprecyzyjne, bo kierunek odczytuje się ze stałej w nawiasie. Propozycja transferu używa minusa i przesuwa wierzchołek w prawo względem wzoru początkowego. Komentarz nie mówi, że Piko odrzucił błędną część notatki. Wzór jest zgodny ze znakiem w kanonicznej regule, ale sam w sobie nie dowodzi wykorzystania wyjaśnienia lub jego korekty.

## C — „abc”

**Gracz** „abc”

**Piko w teach, zapisane jako parafraza**

> Widzę, że podałeś tylko „abc”, więc nie mam jeszcze poprawki do sprawdzenia. Podeślij proszę jeden konkretny krok wyjaśnienia.

> Co dokładnie zmieniasz w nawiasie, gdy przesuwasz parabolę w lewo lub w prawo?

**Piko na nowej planszy**

> Spróbuję przesunąć parabolę tak, by jej wierzchołek był dalej w prawo, zgodnie z regułą o nawiasie.

**Lot** `0.25(x-0)^2` → `START_MISS`. Dla `x=-1` wzór daje `y=0.25`.

**Ocena** W teach Piko rozpoznaje brak użytecznej treści (`not_applicable`) i pyta konkretnie. Zdanie o braku poprawki jest mylące, ponieważ wzór i prognozy były już sprawdzone. W transferze Piko wskazuje regułę o nawiasie i przesuwa wierzchołek z `-2` do `0`. Nie komunikuje, że „abc” nie dostarczyło wskazówki, a wybór `0` nie wynika z geometrii otworów.

## Przyczyna i proponowana poprawka

Różnice są wyraźne w teach. W transferze komentarze B i C są podobne mimo różnych notatek, a trzy wzory dają ten sam typ nieudanego lotu. Przekazanie notatki sprawdzono do poziomu żądania SDK. Najbardziej prawdopodobne źródło problemu jest w instrukcji transferu. Prompt ogólnie nakazuje wykorzystać regułę, ale nie wymaga, by Piko osobno wskazał stosunek do notatki i uzasadnił położenie nowego wierzchołka z danych planszy. A pokazuje, co może z tego wyniknąć. Model przeniósł zapamiętane „w lewo” jako kierunek ruchu, podczas gdy przenoszona reguła mówi, jak kodować wybraną współrzędną wierzchołka znakiem w nawiasie.

W następnej wersji promptu warto wymagać dwóch krótkich kroków w komentarzu transferu. Najpierw Piko wskazuje element użyty, odrzucony lub brak użytecznej treści. Następnie uzasadnia nową współrzędną wierzchołka z geometrii i przed podaniem wzoru podstawia co najmniej współrzędną `x` startu. W M04 oba otwory mają ten sam przedział wysokości, współczynnik `a` i wysokość wierzchołka są zablokowane, więc środek między `x=-1` i `x=5` daje naturalną próbę `p=2`. Model może wyprowadzić tę wartość z geometrii. Wynik i ewentualna kolizja pozostają po stronie silnika. Prompt 1.1.0 zachowano na potrzeby tej próby.

Do pokazu mechanizmu jury potrzebny jest ponowny kontrolowany A/B/C, w którym A stosuje zależność znak–wierzchołek do nowej geometrii, B nazywa odrzucenie błędnego zdania, a C jasno wraca do sprawdzonej reguły po braku wskazówki. Przeprowadzono po jednej sesji na wariant, więc raport nie szacuje powtarzalności ani wpływu wyjaśnienia na szansę zaliczenia.

## Tokeny i koszt

W tabeli tokeny z cache są częścią wejścia. Wszystkie odpowiedzi miały `service_tier: default`, zerowe `cache_write_tokens` i zero tokenów rozumowania. Czas to pomiar backendu dla teach i transferu.

| Wariant | Żądania | Wejście | Z cache | Wyjście | Łącznie | Czas teach / transfer | Szacunek USD |
|---|---:|---:|---:|---:|---:|---|---:|
| A | 2 | 5 938 | 0 | 257 | 6 195 | 4,540 s / 4,714 s | 0,00561000 |
| B | 2 | 5 890 | 5 120 | 233 | 6 123 | 2,719 s / 1,797 s | 0,00201000 |
| C | 2 | 5 845 | 5 376 | 221 | 6 066 | 1,821 s / 1,421 s | 0,00174945 |
| **Suma** | **6** | **17 673** | **10 496** | **711** | **18 384** | | **0,00936945** |

Oszacowanie z rzeczywistego zużycia API wykorzystuje `7 177 × 0,75 + 10 496 × 0,075 + 711 × 4,50`, podzielone przez milion. Stawki Standard w USD za milion tokenów dla GPT-5.4 mini sprawdzono w dniu próby. Kwota na fakturze pozostaje niezweryfikowana. [Cennik modelu OpenAI](https://developers.openai.com/api/docs/models/gpt-5.4-mini).

Odbiór live objął M04 w lokalnym Chromium. Standardowe 22 tury dla promptu 1.1.0, publiczny HTTPS oraz osobny komputer Windows mają status **NOT RUN**.
