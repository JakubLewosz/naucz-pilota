# Uruchomienie, kompilacja i wdrożenie

Piko: Misja Funkcja 1.0.0, aktualizacja odbioru 18 listopada 2026. Sprawdzony host: macOS arm64; Node 24.11.0, npm 11.6.1. Lockfile przypina faktyczne wersje pakietów. Runtime gry nie wymaga Pythona.

## Autor: kod źródłowy

1. Rozpakuj źródła do nowego folderu. Zainstaluj Node 24.x i npm.
2. W katalogu zawierającym package.json wykonaj `npm ci`, potem `npm run dev`.
3. Otwórz http://127.0.0.1:5173. Aplikacja wybiera lokalne demo.
4. `npm run build` tworzy frontend i serwer. `npm start` udostępnia je razem na porcie 3001.
5. Zatrzymaj serwer skrótem Ctrl+C. Zapis gry pozostaje w używanej przeglądarce.

Zwykłe sprawdzenia: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:content`. Przed `npm run test:e2e` wykonaj `npx playwright install chromium ffmpeg`. E2E uruchamia dev server automatycznie lub korzysta z już działającego. Zrzuty i raport JSON zapisuje w checks/.

## Windows: odbiorca

Rozpakuj cały Piko_Misja_Funkcja_Windows.zip i uruchom Piko Misja Funkcja.exe z rozpakowanego folderu. Zachowaj towarzyszące pliki i resources/. Node nie jest potrzebny. Gra zapisuje postęp w profilu lokalnym aplikacji.

Paczka nie ma podpisu cyfrowego. Windows może wyświetlić komunikat o nieznanym wydawcy; autor powinien sprawdzić integralność pobranej paczki i przetestować uruchomienie na osobnym komputerze. GitHub Actions potwierdził start i wznowienie EXE starszego commita 52ac710. Aktualną paczkę zbudowano i sprawdzono statycznie. Uruchomienie tej paczki na Windows jest do wykonania. Domyślna paczka jest przeznaczona do jawnego demo.

## Konfiguracja modelu

Skopiuj `.env.example` do `.env` i uzupełnij `AI_MODE=live` oraz `OPENAI_API_KEY`. Plik przykładowy konfiguruje GPT-6 Luna z `xhigh`, limitem 8192 tokenów i czasem 90 sekund. Lokalny przebieg M04 A/B/C potwierdził działanie z rzeczywistym API na koncie użytym w teście. Klucz pozostaje na backendzie. [Konfiguracja i protokół próby](19-gpt-6-luna-xhigh.md)

Dla Vite PUBLIC_ORIGIN=http://127.0.0.1:5173. Dla lokalnego `npm start` ustaw http://127.0.0.1:3001. W produkcji ustaw pełny origin HTTPS, NODE_ENV=production i trwały STATE_DB_PATH. Brak klucza/modelu jest jawnym błędem, bez podstawiania demo. Zmianę na demo wykonuje gracz.

Test dostawcy wymaga zgody, poświadczeń, flagi `--allow-paid` oraz jawnego `--max-calls`. Do sprawdzenia wejść użyj `npm run test:ai:live -- --dry-run --case M04-LESSONS`. Komendy dla operatora, budżet i rubryka są w [protokole odbioru live](17-odbior-live.md).

## Backend na hostingu: przygotowana konfiguracja

Dockerfile buduje aplikację na Node 24. Stack deploy/jury/compose.yaml dostarcza Caddy, kontrolę dostępu po IP i trwałe wolumeny. Lokalny odbiór odtwarza `npm run jury:https:smoke` z budżetem API równym zero. Backend i frontend działają jako jedna domena. Kontener słucha na porcie 3001; reverse proxy zapewnia TLS. Zamontuj trwały wolumen /app/var i ustaw STATE_DB_PATH=/app/var/piko.sqlite. Przekaż sekrety jako zmienne serwera; nie kopiuj .env do obrazu. PUBLIC_ORIGIN ma odpowiadać adresowi publicznemu.

Uruchamiaj jedną instancję procesu i jeden trwały licznik SQLite. Aplikacja domyślnie nie ufa X-Forwarded-For. Każda sesja ma 6 tur na minutę. Stack jury ma domyślny limit zero żądań dostawcy i wspólny limit 60 żądań API na minutę. Transfer wykonuje jedno żądanie. W nauczaniu naprawa formatu zużywa kolejne żądanie w ramach wspólnego czasu tury, domyślnie 90 sekund. Limit wywołań nie gwarantuje kwoty rachunku.

Cookie web jest HttpOnly/SameSite=Strict, Secure w produkcji. Desktop trzyma token w main process, przyjmuje tylko zaufany origin HTTPS i blokuje przekierowania. Przed budową paczki live ustaw `PIKO_DESKTOP_HTTPS_ORIGIN` na zatwierdzony origin HTTPS i wykonaj `npm run desktop:dist`. W paczce znajdzie się adres serwera. Wyjątek HTTP na loopback dotyczy tylko desktop:dev. Publiczny endpoint pozostaje do uruchomienia.

## Dostęp i przechowywanie danych w live

Przed udostępnieniem live ogranicz dostęp do backendu regułami sieci lub uwierzytelnianiem na reverse proxy. Przetestuj, czy wybrana metoda wpuszcza zarówno przeglądarkę, jak i klienta Electron. Od strony internetu udostępnij tylko proxy TLS i pozostaw port aplikacji w sieci prywatnej. Anonimowa sesja rozróżnia użytkowników aplikacji. Dostęp do budżetu zapewnia osobna kontrola na proxy.

Dostarczony Caddy ogranicza dostęp według adresu połączenia i treść żądania do 16 KiB. Przy zmianie topologii proxy sprawdź adres źródłowy i limity dostępu ponownie. Sprawdź z innego urządzenia przyjęcie dozwolonego ruchu, odrzucenie ruchu spoza listy, limit żądań oraz widoczną awarię po odłączeniu sieci. Dzienny licznik SQLite ogranicza liczbę żądań dostawcy. Koszt zależy od modelu i liczby tokenów.

SQLite przechowuje bieżące wiadomości, sprawdzone dowody, przekazane notatki oraz koperty tur do obsługi ponowionych żądań. Sesja wygasa po 24 godzinach. Aplikacja usuwa wygasłe rekordy przy obsłudze /api/session. Przy stałym wdrożeniu zaplanuj retencję kopii wolumenu oraz czyszczenie wygasłych danych również podczas bezczynności.

„Wyczyść rozmowę” usuwa historię tej sceny w aktywnej sesji i tekst z jej kopert. Zachowuje zapisane zasady, notatkę oraz liczniki. „Usuń lokalny postęp” działa na urządzeniu. Wysłane fragmenty trafiają też do dostawcy modelu. Retencja u dostawcy zależy od konfiguracji konta API. Log produkcyjny zapisuje identyfikatory techniczne, czas, model i kod błędu.

## Budowanie dystrybucji

`npm run desktop:dev` buduje i otwiera Electrona. `npm run desktop:dist` przygotowuje minimalny staging i ZIP Windows x64. `npm run release:check` sprawdza PE, zawartość ASAR, publiczne dane i renderer. `npm run release:prepare` kopiuje materiały do folderu zgłoszeniowego i tworzy źródłowy ZIP z lockfile, bez .env, var, node_modules i lokalnego postępu.

Na komputerze odbiorcy rozpakuj ZIP, sprawdź start offline, M01 i ponowne uruchomienie z zapisem. Po skonfigurowaniu HTTPS sprawdź live i jawną awarię sieci. Raport oddziela ten odbiór od testu na runnerze Windows. Publikacja, podpisy i wysłanie zgłoszenia pozostają po stronie autora.

## Źródła implementacyjne

Oficjalne źródła sprawdzone podczas implementacji: https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses ; https://vite.dev/guide/ ; https://www.electronjs.org/docs/latest/tutorial/security . Adapter używa Responses API, text.format JSON Schema strict i store:false. Nie deklarujemy jakości dialogu bez testów prawdziwego modelu.


## Aktualizacja odbioru

Dockerfile został lokalnie zbudowany, a kontener przeszedł test zdrowia, braku sekretów i danych autora, użytkownika bez root oraz trwałości sesji SQLite po restarcie. npm run docker:build oraz npm run docker:smoke odtwarzają te sprawdzenia bez klucza AI.

Runner zatrzymuje się po pierwszym błędzie i zachowuje odrębne wyniki dla wybranych scenariuszy. Teach i transfer jednego wariantu współdzielą sesję. A/B/C M04 otrzymują trzy osobne sesje. Zobacz [plan HTTPS oraz test z innego urządzenia](17-odbior-live.md). Test Windows EXE i pilotaż mają protokoły w docs/16-windows-odbior.md i docs/15-pilotaz.md. Workflow 42685071630 potwierdził start i wznowienie spakowanego EXE oraz czyszczenie kontekstu na lokalnej atrapie Electrona.


Historyczny odbiór live z 3 listopada obejmował 22 tury i M04 w UI z promptem 1.0.2 oraz modelem gpt-5.4-mini-2026-03-17. Aktualny pomiar promptu 1.2.0 dał siedem zaliczonych propozycji Luny na nowych geometriach M04 i jeden timeout. Publiczny HTTPS oraz uruchomienie aktualnego EXE na Windows pozostają NOT RUN. Narzędzie npx tsx tools/record-demo.ts --live świadomie wykonuje 2 tury płatne i nagrywa prawdziwą M04; brak flagi --live wybiera jawne demo. Nie uruchamiaj nagrania ani testów płatnych w zwykłym npm test.

## Nazwa i zgodność zapisu

Plik Windows to `Piko Misja Funkcja.exe`, a ZIP to `Piko_Misja_Funkcja_1.0.0_Windows_x64.zip`. Nazwa z dwukropkiem jest w oknie i dokumentach. Techniczny profil `naucz-pilota`, identyfikator aplikacji oraz klucz localStorage zachowują dotychczasowe wartości. Zamknij wcześniejszą aplikację przed aktualizacją. Odbiór lokalny potwierdził zachowanie pierwszej próby i notatki między starym i nowym pakietem na macOS. Uruchomienie na Windows trzeba wykonać osobno.

Dla odbiorcy bez uzgodnionego IP wybierz wdrożenie z kodem według docs/17-odbior-live.md. Kod wpisuje się w Ustawieniach. Pozostaje on w pamięci bieżącego procesu lub strony i jest wymagany ponownie po restarcie lub odświeżeniu. Host przechowuje odrębny klucz API.
