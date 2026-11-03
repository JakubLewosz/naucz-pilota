# Źródła, założenia i granice ustaleń
Data sprawdzenia projektu: 2026-11-03.

## Konkurs
1. [Oficjalna strona konkursu UwB](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas) — zadanie, terminy, format materiałów, organizator i link do regulaminu.
2. Regulamin pod linkiem „Regulamin” na powyższej stronie — kryteria oceny, warunki uczestnictwa, materiały i prawa. W przypadku rozbieżności sprawdzić najnowszy dokument organizatora.
3. [Ogłoszenie wydziału](https://informatyka.uwb.edu.pl/aktualnosci/konkurs-sztuczna-inteligencja-wsrod-nas-614.html) — kontekst edycji 2026.

Wnioski: projekt musi wspierać edukację i faktycznie wykorzystywać AI; dobra demonstracja i techniczna poprawność mają osobne znaczenie. Nie mamy podstaw do prognozy konkretnych punktów. Brak potwierdzonej publicznej historii laureatów nie dowodzi, że nigdy nie było wcześniejszej edycji.

## Podobne idee i inspiracje
4. [Graphwar — tutorial](https://graphwar.com/graphwar_1/tutorial.html) — trajektorie wyznaczane funkcjami i przeszkody. Nie kopiujemy implementacji ani zasobów.
5. [Desmos — Marbleslides](https://blog.desmos.com/articles/new-activity-marbleslides/) — wykres jako narzędzie rozwiązywania wizualnej łamigłówki.
6. [Learn Graphs — opis producenta](https://apps.apple.com/us/app/learn-graphs/id1155922532?platform=mac) — istniejące połączenie zadań o wykresach z objaśnieniami AI. Opis sklepu nie jest niezależnym testem jakości.
7. [TeachYou / AlgoBo, CHI 2024, DOI](https://doi.org/10.1145/3613904.3642349), [preprint](https://arxiv.org/abs/2309.14534) — przykład modelu odgrywającego ucznia i scenariuszy uczenia przez wyjaśnianie.
8. [Vanderbilt — Teachable Agents](https://www.vanderbilt.edu/oele/teachable-agents/) — wcześniejszy nurt badawczy agentów uczonych przez użytkownika.
9. [Bastani i współautorzy — badanie o pomocy generatywnej AI w nauce](https://pmc.ncbi.nlm.nih.gov/articles/PMC12232635/) — przesłanka do oddzielania wykonania z pomocą od samodzielnego sprawdzenia. Nie przenosimy wyników badania wprost na tę grę.

Wniosek projektowy: oryginalność polega na konkretnym połączeniu mechanik i jakości wykonania. Nie twierdzimy, że wymyśliliśmy uczenie robota ani gry z wykresami.

## Dokumentacja implementacyjna
10. [OpenAI — Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) — ścisła struktura JSON, required, nullable, additionalProperties, obsługa odmowy. Struktura nie gwarantuje poprawności matematycznej.
11. [OpenAI — Responses API](https://developers.openai.com/api/docs/guides/text) — sprawdź bieżący sposób wywołania i dostępne modele podczas implementacji.
12. [Codex — AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) — trwałe instrukcje projektu i ich zakres.
13. [Vite — getting started](https://vite.dev/guide/) — szablon React/TypeScript i bieżące wymagania środowiska.
14. [Express — praktyki produkcyjne](https://expressjs.com/en/advanced/best-practice-security/) — walidacja wejścia, TLS, cookies, zależności.
15. [Electron — security](https://www.electronjs.org/docs/latest/tutorial/security) — separacja procesów, sandbox, walidacja IPC i nawigacji.
16. [Electron — dystrybucja](https://www.electronjs.org/docs/latest/tutorial/application-distribution) — pakowanie aplikacji.
17. [electron-builder](https://www.electron.build/) — paczki Windows; wybieraj dokumentację aktualnego stabilnego wydania, a nie wersji next.

Specyfikacja nie przypina zgadywanych wersji SDK, Node ani modelu. Codex ma zweryfikować kompatybilność przy pierwszym buildzie i zapisać faktyczne wersje oraz lockfile.

## Decyzje własne projektu
Poniższe nie są wymogami organizatora ani wynikami badań: nazwa, postać Piko, 6 misji, 24 sceny, zakres wielomianów, half-size 0.12, limity parsera i API, jasny motyw, stack technologiczny, cel 30–45 minut gry, orientacyjny harmonogram.

Zostały wybrane dla spójności, wykonalności i łatwej prezentacji. Można je zmienić po rzeczywistym teście, aktualizując równocześnie dane, testy i dokumentację.

## Co sprawdzono przy tworzeniu paczki
Raporty checks/ opisują wyłącznie walidację materiałów: strukturę danych, poprawność rozwiązań referencyjnych, błędne przykłady i spójność kontraktów. Nie oznaczają uruchomienia aplikacji webowej, Windows, wdrożenia backendu ani testów płatnego modelu. Te wyniki musi dopiero wytworzyć implementacja.
