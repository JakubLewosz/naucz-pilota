# Raport weryfikacji

Piko: Misja Funkcja. Lokalny odbiór na gałęzi codex/jury-readiness, 18 listopada 2026. Środowisko autora to macOS arm64, Node 24.11.0 i npm 11.6.1.

## Wykonane sprawdzenia

- Kontrola typów, lint, build i 208 testów Vitest przeszły. Parser, geometria i zasady oceniania korzystają z dotychczasowego silnika TypeScript.
- 17 testów Playwright przeszło. Obejmują całą kampanię, ochronę pierwszej próby, opóźnioną odpowiedź, reset rozmowy, tryb demo i awarie live. Osobna regresja sprawdza współrzędne zatrzymania, brak zaliczenia bramek za miejscem kolizji i pominięcie animacji bez kolejnego zapisu lub wywołania AI.
- Sprawdzono 1366 × 768, 1440 × 900, 390 × 844, tekst 200%, klawiaturę i ograniczenie ruchu. Zrzuty dziewięciu stanów interfejsu przeszły kontrolę axe A/AA i zostały przejrzane wzrokowo. Jest to zakres wykonanych prób dostępności.
- Treść ma 62 testy. Walidator Python potwierdził 24 poprawne tory, 37 kontrolnych porażek i 42 kontrole parsera i geometrii. Niezależny audyt treści również przeszedł.
- Lokalny Caddy sprawdził zaufanie TLS, listę adresów, limit 16 KiB, odrzucenie obcego originu, bezpieczne cookie i trwałą sesję po restarcie. Przy budżecie zero backend odrzucił turę z requestCount=0. Dodatkowy wariant wpuszcza nieznaną sieć z poprawnym kodem odbioru i odrzuca kod błędny lub brakujący.
- Spakowany Electron na macOS odtworzył M01 offline i zachował pierwszą próbę po restarcie. Nowa paczka otworzyła profil poprzedniej wersji z notatką oraz nieudaną pierwszą próbą. Techniczna nazwa profilu pozostała naucz-pilota.
- Relay spakowanej aplikacji przeszedł rozmowę i reset, odpowiedź po 17 sekundach, transfer oraz awarię sieci przez lokalny HTTPS. Dostawca był atrapą. Sprawdzono kod dostępu wpisywany przez interfejs i odrzucenie niezaufanego certyfikatu.
- Windows x64 przeszedł cross-build, kontrolę pliku PE i zgodności ASAR z bieżącym buildem. Paczka ma nową nazwę i ikonę oraz kompletny renderer bez sekretów i rozwiązań autora.

## Rzeczywisty model

W tej rundzie wykonano zero płatnych żądań. Wcześniejszy test GPT-6 Luna Extra High, prompt 1.2.0, objął dwa nowe układy M04 i osiem prób A/B/C/D. Wszystkie siedem otrzymanych wzorów silnik zaliczył. Ósma próba zakończyła się timeoutem. Warunki i dosłowne wypowiedzi są w checks/m04-generalization-1.2.0.live.md. Wynik dotyczy tego zestawu. Piko odgrywa ucznia przez kontekst i notatkę zapisaną w aplikacji.

## Do odbioru zewnętrznego

Uruchomienie aktualnego EXE na rzeczywistym Windows, docelowy HTTPS z innej sieci oraz ograniczona tura z dostawcą na tym hostingu mają status NOT RUN. Wymagają komputera odbiorcy, hosta, DNS i osobnej zgody na wywołanie. Historyczny Windows CI dotyczy starszego kodu 52ac710.

Pilotaż, finalny film, podpisy i udostępnienie zgłoszenia pozostają NOT RUN. Instrukcje, klip demo i protokół są gotowe lokalnie. Dowody i ograniczenia opisano w IMPLEMENTATION_STATUS.md.
