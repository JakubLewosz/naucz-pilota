# Odbiór live i test na urządzeniu jury

Publiczny HTTPS i osobny komputer odbiorcy mają status **NOT RUN**. Dla GPT-6 Luna z `xhigh` obowiązuje [plan próby z osobnym budżetem](19-gpt-6-luna-xhigh.md). Przed próbą zanotuj SHA kodu, wersję promptu, model, datę, urządzenie i zgodę na liczbę wywołań. Lokalna atrapa i przebieg CI są oddzielnymi dowodami.

## Odbiór M04 A/B/C przez interfejs gry

Runner `tests/live/m04-browser.ts` jest protokołem dla gałęzi `codex/jury-readiness` i promptu 1.1.0. Na lokalnym backendzie odtwarza trzy osobne sesje Chromium ze wspólnego stanu tuż po naprawie i prognozach M04. W każdej sesji używa interfejsu do rozmowy, potwierdza zapis rzeczywistej parafrazy, odświeża grę i zleca transfer. Porównuje notatkę z wiadomością wysłaną do OpenAI oraz sprawdza propozycję silnikiem w aplikacji.

```sh
npm run build
npx tsx tests/live/m04-browser.ts --mock moj-id-proby-technicznej
```

Po odrębnej zgodzie na wywołania OpenAI uruchom poniższą komendę z nowym identyfikatorem. Klucz i model ustaw w lokalnym `.env` backendu. Polecenie wymaga Chromium Playwright i dopuszcza najwyżej 12 żądań HTTP do OpenAI łącznie z ponowieniami. Próba używa sesji SQLite w pamięci, a raport i dziennik żądań zapisuje w `var/ai-live/`.

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

Do wykonania potrzebne są zgoda operatora, host z Dockerem, trwały wolumen, własna nazwa DNS z poprawnym certyfikatem, uprawnienia do konfiguracji proxy i zapory, autoryzowany klucz API po stronie hosta oraz komputer i sieć do odbioru. Adresu publicznego nie ustalono. Operator wybiera metodę dostępu kompatybilną z przeglądarką oraz Electronem, np. listę dozwolonych adresów wyjściowych lub prywatną sieć.

1. Najpierw skonfiguruj TLS i kontrolę dostępu na proxy. Udostępnij wyłącznie proxy. Poniższy backend nasłuchuje dla proxy na tym samym hoście przez port loopback.
2. Na hoście utwórz chroniony plik zmiennych dostępny tylko operatorowi. Ustaw `PUBLIC_ORIGIN` na zatwierdzony origin HTTPS bez końcowego ukośnika, `AI_MODE=live`, `AI_MODEL`, `OPENAI_API_KEY` oraz `AI_DAILY_REQUEST_BUDGET=0` na próbę blokady. Klucz pobierz z magazynu sekretów operatora. `AI_MAX_PROVIDER_REQUESTS_PER_TURN` ustaw na 1 do pierwszej kontrolowanej próby. Podnieś limit wyłącznie w granicach zatwierdzonego budżetu.
3. Wykonaj na udostępnionym hoście z wybranego commita po ustawieniu `PIKO_SECRET_ENV_FILE` na ścieżkę tego pliku.

```sh
npm run docker:build
docker volume create piko-live-state
docker run -d --name piko-live --restart unless-stopped \
  --env-file "${PIKO_SECRET_ENV_FILE:?Wskaż chroniony plik na hoście}" \
  -e NODE_ENV=production -e STATE_DB_PATH=/app/var/piko.sqlite \
  -p 127.0.0.1:3001:3001 \
  --mount type=volume,src=piko-live-state,dst=/app/var \
  naucz-pilota:codex-readiness
```

Na proxy kieruj stronę i `/api` pod ten sam origin. Ogranicz szybkość `/api/session`, `/api/learner-turn` i `/api/conversation/reset` na adres dopuszczonego klienta. Ustal limit treści maksymalnie 16 KiB, zachowaj `Origin` i nagłówki Electron oraz nadpisuj nagłówki adresu klienta. Dla `/api/learner-turn` ustaw timeout odpowiedzi proxy na co najmniej 130 s. Daje to zapas na turę o konfigurowalnym limicie do 120 s. Anonimowa sesja aplikacji daje kontekst rozmowy. Kontrolę dostępu do budżetu zapewnia proxy lub sieć. Po zmianie konfiguracji zachowaj wolumen i używaj jednej instancji. Limit dobowy jest liczbą żądań, a realny koszt zależy od modelu i tokenów.

Klucze i plik zmiennych pozostają na hoście. W desktopowym `distribution.json` konfiguruj wyłącznie zatwierdzony origin HTTPS po odbiorze usługi i zgodzie na przygotowanie wydania. Zapis gry pozostaje na urządzeniu. Serwer zachowuje aktywną rozmowę oraz dowody w SQLite. Sesja wygasa po 24 godzinach, a czyszczenie wygasłych rekordów odbywa się przy ustanawianiu sesji. Operator odpowiada również za retencję kopii, czyszczenie podczas bezczynności i ustawienia dostawcy modelu.

## Próba z innego urządzenia

Przed każdym krokiem odnotuj system, wersję, sieć, status i dowód bez sekretów. Przy zatwierdzonym `PIKO_PUBLIC_ORIGIN` sprawdź health:

```sh
curl --fail --silent --show-error "${PIKO_PUBLIC_ORIGIN:?Ustaw zatwierdzony origin HTTPS}/api/health"
```

| Próba | Oczekiwany dowód | Stan |
|---|---|---|
| Wejście z dozwolonej i niedozwolonej sieci | Ważny TLS oraz odrzucenie dostępu do płatnych endpointów poza listą | NOT RUN |
| Health, sesja i origin | Status live, nowe cookie Secure w web, odrzucenie obcego originu | NOT RUN |
| Limit 0 oraz limiter proxy | Czytelne 429, `requestCount=0`, licznik dostawcy bez wzrostu | NOT RUN |
| Jedna prawdziwa tura po zgodzie | Odpowiedź live, rzeczywiste ID i model, oddzielny wynik silnika | NOT RUN |
| Odświeżenie, zapis i reset rozmowy | Wzór i notatka zostają. Następna rozmowa po resecie ma pustą historię | NOT RUN |
| Utrata sieci i niedostępny serwer | Wpisy zachowane, jawny błąd, przejście do demo po decyzji gracza | NOT RUN |
| Electron z zatwierdzonym HTTPS | Dostęp z drugiej sieci, bezpośrednie połączenie bez redirectu i poprawny reset | NOT RUN |
| Ponowny start backendu | Poprzednia sesja i limit pozostają w wolumenie SQLite | NOT RUN |

Do osobnego testu opublikowanej aplikacji służy [protokół Windows](16-windows-odbior.md). Lokalny test Docker sprawdza mechanizmy kontenera. Odbiór HTTPS wykonuje się w faktycznej sieci jury.
