# Odbiór live i test na urządzeniu jury

Publiczny HTTPS i osobny komputer odbiorcy mają status **NOT RUN**. Dla GPT-6 Luna z `xhigh` obowiązuje [plan próby z osobnym budżetem](19-gpt-6-luna-xhigh.md). Przed próbą zanotuj SHA kodu, wersję promptu, model, datę, urządzenie i zgodę na liczbę wywołań. Lokalna atrapa i przebieg CI są oddzielnymi dowodami.

## Uogólnienie M04 na czterech geometriach testowych

```sh
npm run test:m04:offline
npm test -- tests/m04-generalization.test.ts
```

Trzy translacje o −4, +3 i −6 oraz przebudowana geometria wykorzystują produkcyjny silnik. Dla każdej geometrii sprawdź A, B, C i kontrolę D bez notatki. Warianty mają tę samą symboliczną regułę oraz dowody liczbowe z nauczania. A, B i C przechodzą walidację zapisu z dosłowną notatką oraz źródłem `skipped`, ponieważ w aparaturze pomijamy modelową parafrazę. Testy badają przekazanie notatki jako danych `user`, brak rozwiązań i izolację sceny. [Wyniki i warunki](../checks/m04-generalization-1.2.0.md).

Kontrolowana próba z 10 listopada 2026 wykorzystała **8 prób HTTP**. Objęła translację −4 i przebudowaną planszę, cztery warunki na każdej, po jednym żądaniu transferu. Model to `gpt-6-luna` z `xhigh`, limit 8192 tokenów oraz 90 s. Każdy przypadek miał oddzielny kontekst bez historii i jedną próbę. Otrzymano siedem zaliczonych wzorów, a D na przebudowanej planszy zakończyło się timeoutem podczas uśpienia hosta. Ponowne wykonanie wymaga osobnej zgody i unikalnego identyfikatora. [Raport live](../checks/m04-generalization-1.2.0.live.md).

```sh
npx tsx tests/live/run-m04-generalization.ts --live --max-calls 8 unikalny-id
```

Oceń osobno kod wyniku silnika, użycie lub odrzucenie notatki i powiązanie wzoru ze współrzędnymi. W D model ma korzystać z reguły i geometrii bez przypisywania graczowi wypowiedzi. Zapisz (n), minimum, medianę i maksimum czasu, tokeny oraz status każdego żądania. Wyniki trafiają do ignorowanego przez Git `var/ai-live/`. Ocenę człowieka wpisz osobno.

## Odbiór M04 A/B/C przez interfejs gry

Runner `tests/live/m04-browser.ts` działa na gałęzi `codex/jury-readiness` i zapisuje bieżącą wersję promptu. Na lokalnym backendzie odtwarza trzy osobne sesje Chromium ze wspólnego stanu tuż po naprawie i prognozach M04. W każdej sesji używa interfejsu do rozmowy, potwierdza zapis parafrazy, odświeża grę i zleca transfer. Porównuje notatkę z wiadomością wysłaną do SDK oraz sprawdza propozycję silnikiem w aplikacji.

```sh
npm run build
npx tsx tests/live/m04-browser.ts --mock moj-id-proby-technicznej
```

Po odrębnej zgodzie na wywołania OpenAI uruchom poniższą komendę z nowym identyfikatorem. Klucz i model ustaw w lokalnym `.env` backendu. Polecenie wymaga Chromium Playwright i dopuszcza najwyżej 9 żądań HTTP do OpenAI, z ponowieniami tylko w nauczaniu. Przy `AI_MAX_PROVIDER_REQUESTS_PER_TURN=1` limit wynosi 6. Próba używa sesji SQLite w pamięci, a raport i dziennik żądań zapisuje w `var/ai-live/`.

```sh
npx tsx tests/live/m04-browser.ts --allow-paid moj-id-proby-live
```

Wyniki pierwszej rzeczywistej próby oraz ocenę transferu zawiera [raport M04 A/B/C z promptem 1.1.0](../checks/ai-live-m04-abc-1.1.0.md).

## Próba kontraktu M04 bez opłat

```sh
npm run test:ai:live -- --dry-run --case M04-LESSONS --max-calls 12
```

M04-A, M04-B i M04-C obejmują po jednej turze teach i transfer w każdej z trzech osobnych sesji. Geometria, naprawiony wzór i prognozy są jednakowe. Zmienia się wyłącznie tekst wyjaśnienia. W tych testach zapisano notatkę z `source: "skipped"` i pustą parafrazą. Dzięki temu transfer porównuje własne słowa gracza bez dopisywania mu przykładowej odpowiedzi modelu.

Runner kontraktu może również wykonać poniższe próby po zgodzie operatora. Pełne A/B/C rezerwuje do 12 żądań, pojedynczy wariant do 4. Zestaw bez filtra ma 22 tury i wymaga jawnie wskazanego budżetu do 44. Przed testem zatrzymaj lokalny backend używający tej samej bazy. Nie zwiększaj limitu dobowego w celu ominięcia wyczerpanego budżetu.

```sh
npm run test:ai:live -- --allow-paid --case M04-A --max-calls 4
npm run test:ai:live -- --allow-paid --case M04-LESSONS --max-calls 12
```

Wynik każdej próby zachowuje się osobno w `var/ai-live/`. Raport zapisuje żądanie aplikacji, tekst przekazany do providera, notatkę, surowy tekst zwrócony przez adapter oraz dostępne ID odpowiedzi, model, tokeny i czas. Gdy adapter zwróci błąd, zapisuje jego kod. Tylko uruchomiony bez filtra zestaw standardowy aktualizuje `checks/ai-live-results.json`. Brak zgody lub poświadczeń daje NOT RUN. Sucha próba weryfikuje wejścia i zachowuje NOT RUN dla dostawcy.

W odbiorze porównaj oba etapy A/B/C.

| Wariant | Obserwacja człowieka |
|---|---|
| M04-A | Czy Piko odniósł się do znaku i miejsca zerowania nawiasu oraz spróbował zastosować tę ideę w transferze? |
| M04-B | Czy Piko odróżnił błędne słowa gracza od sprawdzonej reguły? |
| M04-C | Czy Piko potraktował „abc” jako nieużyteczne wyjaśnienie i jawnie skorzystał ze sprawdzonej reguły? |

Przepisz dla każdej tury rzeczywisty cytat, propozycję i wynik silnika. Odnotuj osobno ton ucznia, odniesienie do notatki, ewentualne zdradzanie odpowiedzi i czas. Ten sam wzór w A/B/C jest dopuszczalny. Asercja zgodności notatki i PASS STRUCTURAL weryfikują dane. Wynik semantyczny uzupełnia człowiek po przeczytaniu transkryptu jako HUMAN PASS albo HUMAN FAIL. Domyślnie pozostaje NOT REVIEWED.

Przed próbą zapisz limit wywołań i uzgodniony limit wydatków operatora. Po próbie zsumuj odnotowane tokeny wejścia i wyjścia według stawek faktycznego modelu. Jeśli brakuje zużycia z przerwanego żądania, sprawdź rozliczenie po stronie dostawcy. W raporcie oznacz brak znanej kwoty jako niewiadomą.

## Jedna instancja za HTTPS

W repozytorium jest gotowy [stack Docker Compose i Caddy](../deploy/jury/compose.yaml). Test `npm run jury:https:smoke` uruchamia ten sam Caddyfile i produkcyjny backend w odizolowanej sieci Docker. Sprawdza zaufanie TLS, wejście dozwolonej sieci i odrzucenie drugiego klienta mimo podrobionych nagłówków, cookie Secure, obcy origin, limit 16 KiB, budżet zero oraz trwałą sesję po restarcie. Smoke używa lokalnego certyfikatu i syntetycznego klucza. [Raport lokalny](../checks/jury-https-smoke.json)

Na hostingu potrzebne są Linux, Docker Compose, zatwierdzona nazwa DNS skierowana na host, porty TCP 80 i 443 dla Caddy oraz adresy wyjściowe dopuszczonych sieci. Ustaw listę IP/CIDR rozdzieloną spacjami. Caddy używa adresu bezpośredniego połączenia, dlatego w tej konfiguracji ruch ma trafiać bezpośrednio do hosta. Jeśli sieć jury ma zmienne adresy, ustal stałą sieć wyjściową lub zatwierdzoną sieć prywatną przed testem. [Adres źródłowy w Caddy](https://caddyserver.com/docs/caddyfile/matchers#remote_ip) · [Automatyczny HTTPS](https://caddyserver.com/docs/automatic-https)

1. W chronionym pliku poza repozytorium, dostępnym tylko operatorowi, ustaw `OPENAI_API_KEY` z magazynu sekretów. Użyj uprawnień 0600. Adres, model i parametry określa Compose. Na start budżet ma wynosić zero.
2. Na docelowym hoście ustaw `PIKO_JURY_HOST` na zatwierdzoną nazwę DNS bez protokołu i ścieżki, `PIKO_JURY_ALLOWED_IPS` na listę sieci oraz `PIKO_SECRET_ENV_FILE` na bezwzględną ścieżkę do pliku sekretu. Nie drukuj wynikowej konfiguracji z rozwiniętymi wartościami pliku środowiskowego.
3. Po uzyskaniu zgody na uruchomienie docelowej usługi wykonaj:

```sh
docker compose -f deploy/jury/compose.yaml config --quiet
docker compose -f deploy/jury/compose.yaml up -d --build
```

Caddy przyjmuje ruch na hoście Linuksowym i kieruje stronę oraz API pod ten sam origin. Backend publikuje port 3001 tylko na loopback. Zapora ma odrzucać zewnętrzny dostęp do tego portu. Lista na proxy ogranicza dostęp do aplikacji i API. Backend za proxy stosuje wspólny limit 60 żądań API/min i limit tur na sesję. Przed pokazem z wieloma równoczesnymi klientami zmierz obciążenie w dozwolonej sieci. Caddy daje backendowi 135 s na nagłówki odpowiedzi. Wolumeny przechowują SQLite i certyfikaty po restarcie. Zatrzymując wdrożenie, zachowaj wolumeny.

Dopiero po odbiorze dostępu ustaw `PIKO_JURY_DAILY_BUDGET` w granicach osobnej zgody operatora i odtwórz kontener backendu przez `docker compose -f deploy/jury/compose.yaml up -d backend`. Domyślnie limit wynosi 0, model to `gpt-6-luna` z `xhigh`, a maksymalna liczba żądań dostawcy na turę to 1. Próba HTTP 429 przy budżecie 0 nie wymaga płatnego wywołania. `available:true` z health potwierdza obecność konfiguracji, a próba dostawcy jest osobnym sprawdzeniem.

Paczka desktop przyjmuje wyłącznie zatwierdzony origin HTTPS przez `PIKO_DESKTOP_HTTPS_ORIGIN` podczas budowania. Klucz zostaje na hoście. Zapis gry pozostaje na urządzeniu. Sesja rozmowy w SQLite wygasa po 24 godzinach i jest czyszczona przy zakładaniu sesji. Operator odpowiada za retencję kopii, czyszczenie podczas bezczynności i ustawienia dostawcy modelu.

## Dostęp kodem z nieznanej sieci jury

Wariant `deploy/jury/compose-code.yaml` pozwala otworzyć stronę demo z dowolnej sieci, a API wymaga kodu. W chronionym pliku backendu ustaw także `JURY_ACCESS_CODE` na losowy ciąg 32–256 znaków. Udostępnij go zaproszonym odbiorcom. Startup zakończy się błędem przy pustym lub zbyt krótkim kodzie. Globalny limiter i budżet SQLite nadal obowiązują. Zmiana kodu na hoście odcina wcześniejszy dostęp, także przy istniejącej sesji.

Po zatwierdzeniu hostingu operator wykonuje:

```sh
docker compose -f deploy/jury/compose.yaml -f deploy/jury/compose-code.yaml config --quiet
docker compose -f deploy/jury/compose.yaml -f deploy/jury/compose-code.yaml up -d --build
```

Odbiorca otwiera Ustawienia i wpisuje kod dostępu do live. W przeglądarce jest on w pamięci strony, a Electron przekazuje go do procesu głównego. Kod nie trafia do zapisu postępu, pliku dystrybucji, lekcji ani kontekstu AI. Trzeba go wpisać po odświeżeniu lub restarcie. Weryfikacja połączenia pobiera stan serwera bez tury u dostawcy. Kod odbioru jest odrębny od klucza OpenAI przechowywanego przez operatora.

Lokalny `npm run jury:https:smoke` sprawdza oba warianty. Po teście listy IP odtwarza kontenery z wymuszonym kodem i sprawdza poprawny, błędny oraz brakujący kod z klienta spoza listy. Publiczny certyfikat, DNS oraz rzeczywista sieć jury pozostają NOT RUN.

## Próba z innego urządzenia

Przed każdym krokiem odnotuj system, wersję, sieć, status i dowód bez sekretów. Przy zatwierdzonym `PIKO_PUBLIC_ORIGIN` sprawdź health:

```sh
curl --fail --silent --show-error "${PIKO_PUBLIC_ORIGIN:?Ustaw zatwierdzony origin HTTPS}/api/health"
```

| Próba | Oczekiwany dowód | Stan |
|---|---|---|
| Wejście z dozwolonej i niedozwolonej sieci | Ważny TLS oraz odrzucenie dostępu do płatnych endpointów poza listą | NOT RUN |
| Health, sesja i origin | Status live, nowe cookie Secure w web, odrzucenie obcego originu | NOT RUN |
| Limit 0 oraz ograniczenia backendu | Czytelne 429, `requestCount=0`, licznik dostawcy bez wzrostu | NOT RUN |
| Jedna prawdziwa tura po zgodzie | Odpowiedź live, rzeczywiste ID i model, oddzielny wynik silnika | NOT RUN |
| Odświeżenie, zapis i reset rozmowy | Wzór i notatka zostają. Następna rozmowa po resecie ma pustą historię | NOT RUN |
| Utrata sieci i niedostępny serwer | Wpisy zachowane, jawny błąd, przejście do demo po decyzji gracza | NOT RUN |
| Pominięcie podczas oczekiwania | Samodzielna scena zachowuje pierwszą próbę mimo spóźnionej odpowiedzi | NOT RUN |
| Electron z zatwierdzonym HTTPS | Dostęp z drugiej sieci, bezpośrednie połączenie bez redirectu i poprawny reset | NOT RUN |
| Ponowny start backendu | Poprzednia sesja i limit pozostają w wolumenie SQLite | NOT RUN |

Do osobnego testu opublikowanej aplikacji służy [protokół Windows](16-windows-odbior.md). Lokalny test Docker obejmuje kontrolę dostępu i TLS z własnym CA. Odbiór publicznego certyfikatu wykonuje się z faktycznej sieci jury.
