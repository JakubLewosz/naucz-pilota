# M04 A/B/C live — GPT-6 Luna z xhigh i GPT-5.4 mini

10 listopada 2026 Luna zaliczyła **3/3** pierwsze loty. W zapisanej próbie z 9 listopada GPT-5.4 mini miał **0/3**, zawsze `START_MISS`. Luna w każdym transferze odniosła się do jakości konkretnej notatki. Wszystkie trzy warianty dały ten sam wielomian, więc próba pokazuje różnice w reakcji na słowa gracza i poprawę lotu, lecz nie pozwala przypisać poprawnego wzoru samej lekcji gracza. Ocena transkryptu przez człowieka pozostaje **NOT REVIEWED**.

## Warunki

- Gałąź `codex/jury-readiness`. Luna na `95a55ca86b6b4cbdf6e01e728749b22eb986e0f6`, porównanie z `gpt-5.4-mini-2026-03-17` na `a751a1cd8ceb98d89410571e9076b194652f0493`. Oba przebiegi użyły lokalnego Chromium na macOS z Node `24.11.0`. Porównano zapis mini bez nowych wywołań.
- Prompt 1.1.0, geometria, silnik i schemat odpowiedzi były identyczne. Każdy przebieg zaczynał trzy osobne sesje od sprawdzonej naprawy `0.25(x+1)^2` i prognoz `0.25`, `0.25`. W każdym wariancie zapisano odpowiedź Piko jako parafrazę i odświeżono grę przed transferem. Po odjęciu identyfikatorów sesji, prób i tur oraz parafraz Piko w transferze żądania aplikacji odpowiadały sobie między przebiegami.
- Luna otrzymała `xhigh`, 8192 tokenów wyjścia na żądanie i 90 s na turę. Mini korzystał z domyślnego wysiłku bez wysłanego pola `reasoning`, 1200 tokenów wyjścia i 15 s na turę. U Luny backend dopuszczał jedną próbę, a u mini dwie. Oba przebiegi faktycznie miały jedno żądanie na turę. Dni uruchomienia i odczyty oraz zapisy cache różniły się. Wynik porównuje całe konfiguracje.
- Dziennik Luny zawiera sześć rezerwacji i sześć odpowiedzi HTTP 200 ze statusem `completed`, po dwie na sesję. Wykorzystano **6/6** zatwierdzonych żądań. Przeprowadzony build zakończył się pomyślnie. [Zapis Luna](ai-live-m04-abc-luna-xhigh-1.1.0.json) zachowuje wypowiedzi, wzory, czasy, identyfikatory i liczniki API. Z kopii repozytorium usunięto dziesięć nieprzezroczystych pól `encrypted_content`. [Poprzedni raport GPT-5.4 mini](ai-live-m04-abc-1.1.0.md).

## Loty

| Wariant | Luna i wynik silnika | GPT-5.4 mini i wynik silnika |
|---|---|---|
| A, poprawne wyjaśnienie | `0.25*(x-2)^2` · zaliczony | `0.25(x+2)^2` · `START_MISS`, `y(-1)=0.25` |
| B, błędne wyjaśnienie | `0.25(x-2)^2` · zaliczony | `0.25(x-1)^2` · `START_MISS`, `y(-1)=1` |
| C, `abc` | `0.25(x-2)^2` · zaliczony | `0.25(x-0)^2` · `START_MISS`, `y(-1)=0.25` |

Otwór startowy dopuszcza wysokości od `1.87` do `2.63` przy `x=-1`. Dla wszystkich propozycji Luny silnik policzył `y(-1)=2.25`, `y(1)=0.25`, `y(3)=0.25`, `y(5)=2.25` i potwierdził bezpieczny lot. Zapisane propozycje są dosłowne. Silnik znormalizował wszystkie trzy do współczynników `c2=0.25`, `c1=-1`, `c0=1`.

## Dosłowne wypowiedzi Luny

**A.** Gracz wpisał „Dla x = −1 nawias x + 1 jest równy zero, więc tam leży wierzchołek. Plus w nawiasie oznacza przesunięcie w lewo.”

- **Nauczanie** „Rozumiem: w 0,25(x+1)^2 nawias zeruje się przy x=-1, więc tam jest wierzchołek, a plus oznacza przesunięcie w lewo. Z obliczeń mam y(-2)=0,25 i y(0)=0,25.”
- **Transfer** „Notatka poprawnie wskazuje, że plus w nawiasie przesuwa parabolę w lewo. Tym razem spróbuję przesunąć wierzchołek w prawo.”

Luna zachowała zasadę o znaku i zmieniła kierunek do nowej planszy. Mini powtórzył kierunek z lekcji i zachował wzór początkowy transferu.

**B.** Gracz wpisał „Plus w nawiasie przesuwa parabolę w prawo.”

- **Nauczanie** „Rozumiem, że według Ciebie plus przesuwa parabolę w prawo. W 0.25(x+1)^2 oś symetrii jest jednak przy x=-1, więc przesunięcie jest w lewo. W G1 i G2 wartości są równe 0.25.”
- **Pytanie** „Jak poprawisz swoją regułę, uwzględniając ten kierunek przesunięcia?”
- **Transfer** „Notatka mówi, że plus przesuwa w prawo, ale kanoniczna reguła wskazuje przesunięcie w lewo. Spróbuję zastosować ją, ustawiając wierzchołek po prawej stronie.”

Luna odrzuciła fałszywy wniosek wprost i zaproponowała zgodny z regułą wzór. Mini w nauczaniu wykrył błąd, ale w transferze poprzestał na ogólnej zapowiedzi przesunięcia.

**C.** Gracz wpisał „abc”.

- **Nauczanie** „Nie widzę wyjaśnienia w „abc”.”
- **Pytanie** „Jak zmiana znaku w nawiasie wpływa na poziome położenie wierzchołka?”
- **Transfer** „Notatka „abc” jest niejasna, więc spróbuję zastosować regułę, że nawias (x-p) ustawia wierzchołek w x=p.”

Luna wskazała brak wskazówki i podała zasadę, z której skorzystała. Mini powołał się ogólnie na regułę o nawiasie.

## Czas, tokeny i koszt

Czasy pochodzą z backendu dla danej tury. Kolumny odczytu i zapisu cache są częścią wejścia. Rozumowanie jest częścią wyjścia. Mini raportował zero tokenów rozumowania w każdej turze i zero zapisów cache.

| Tura | Luna s | Mini s | Luna wejście | Odczyt / zapis cache | Luna wyjście (rozumowanie) | Mini wejście / wyjście | Luna USD |
|---|---:|---:|---:|---:|---:|---:|---:|
| A nauczanie | 11,895 | 4,540 | 3 323 | 0 / 3 320 | 1 137 (997) | 3 323 / 163 | 0,000983800 |
| A transfer | 9,845 | 4,714 | 2 633 | 0 / 2 630 | 777 (673) | 2 615 / 94 | 0,000717550 |
| B nauczanie | 11,241 | 2,719 | 3 294 | 3 273 / 18 | 1 584 (1 427) | 3 294 / 135 | 0,000827280 |
| B transfer | 6,177 | 1,797 | 2 605 | 2 460 / 142 | 579 (465) | 2 596 / 98 | 0,000332150 |
| C nauczanie | 4,800 | 1,821 | 3 281 | 3 273 / 5 | 525 (436) | 3 281 / 124 | 0,000296155 |
| C transfer | 5,647 | 1,421 | 2 539 | 2 460 / 76 | 544 (442) | 2 564 / 97 | 0,000306400 |
| **Suma** | **49,605** | **17,012** | **17 675** | **11 466 / 6 191** | **5 146 (4 440)** | **17 673 / 711** | **0,003463335** |

Luna zużyła **22 821** tokenów, a mini **18 384**. Koszt Luny według zgłoszonego przez API zużycia i stawek Standard wynosi `(18 × 0,10 + 11 466 × 0,01 + 6 191 × 0,125 + 5 146 × 0,50) / 1 000 000 = 0,003463335 USD`. Mini kosztował `0,009369450 USD` według zapisanego zużycia i jego stawek Standard. Luna była około 63% tańsza i średnio 2,9 raza wolniejsza na turę, 8,27 s wobec 2,84 s. [Cennik Luny](https://developers.openai.com/api/docs/models/gpt-6-luna#pricing) · [Cennik mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini#pricing) · [Rozliczanie cache](https://developers.openai.com/api/docs/guides/prompt-caching).

## Ocena dla konkursu

Luna `xhigh` jest uzasadnionym wyborem do kontrolowanego pokazu M04. Potrafiła wyjaśnić, jak traktuje każdą notatkę, i bezpiecznie przelecieć. Przed przyjęciem jako domyślnego modelu całej gry trzeba sprawdzić powtarzalność i opóźnienia na kolejnych scenach. Ta próba obejmuje jedną sesję każdego typu. W publicznej konfiguracji przekazana Piko reguła M04 już zawiera przykład `(x-2)` i wszystkie sesje otrzymały tę regułę. Wypowiedzi Luny nie mówią, jak wyprowadziła `p=2` z geometrii.

Następna wersja promptu powinna prosić o krótką ocenę notatki oraz o uzasadnienie wybranego parametru jednym faktem z planszy i kontrolą wysokości na starcie. W M04 uzasadnieniem `p=2` może być środek między symetrycznymi otworami przy `x=-1` i `x=5`. W interfejsie warto pokazać obok wzoru pierwsze rozstrzygające zdarzenie silnika, a na ekranie transferu pozwolić kontynuować po przerwaniu oczekiwania. Test z przesuniętą planszą, której poprawny wierzchołek różni się od przykładu z reguły, pozwoli sprawdzić uogólnienie. Ocena silnika ma dalej używać oryginalnego wzoru modelu.
