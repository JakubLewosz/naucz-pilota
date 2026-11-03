# Prompt startowy — wklej do Codex po otwarciu folderu projektu

Zaimplementuj kompletny projekt „Naucz Pilota” według materiałów w tym repozytorium. Pracuj nad działającą aplikacją, nie zatrzymuj się na planie, pseudokodzie lub statycznym prototypie.

Najpierw przeczytaj AGENTS.md, README.md oraz dokumenty docs/01-product.md do docs/10-sources-and-decisions.md. Sprawdź istniejące pliki i instrukcje, zachowaj pracę użytkownika. Jeżeli repozytorium jest nowe, zbuduj strukturę npm workspaces zgodnie z docs/03-architecture.md.

Zastosuj React, TypeScript, Vite, SVG, Node/Express, wspólny silnik matematyczny i adapter OpenAI Responses API ze Structured Outputs. Dodaj cienkie opakowanie Electron dla Windows. Dobierz aktualne kompatybilne stabilne wersje i zapisz lockfile. Nie umieszczaj klucza modelu we frontendzie lub w .exe.

Zrealizuj kolejno etapy E0–E6 z docs/07-implementation-plan.md. Zacznij od poprawnego silnika oraz jednej kompletnej misji M01, potem rozbuduj całą kampanię. Użyj gotowych 6 misji i 24 scen w content/missions.v1.json; nie zastępuj ich przypadkowymi planszami. Przenieś do TypeScript przypadki kontrolne walidatora Python, a samego Pythona nie wymagaj do uruchamiania gry.

Najważniejsze zachowania:
- practice → teach → robot_transfer → human_check, z odrębną planszą na każdym etapie;
- gracz tłumaczy Piko, naprawia wzór i przewiduje wartości w G1 i G2;
- model odgrywa ucznia i proponuje wzór, a silnik niezależnie liczy sukces i kolizje;
- przed pierwszym samodzielnym lotem nie ma podglądu trasy, wyliczeń y, czatu, dziennika ani wskazówek;
- wynik pierwszej parsowalnej próby pozostaje zapisany;
- tryby demo/live/unavailable są jawne; awaria modelu nie może być ukryta skryptową odpowiedzią;
- brak klucza pozwala pracować w demo, lecz nie pozwala raportować zaliczonych testów live.

Przygotuj przyjazny polski interfejs według docs/06-ui-ux.md, localStorage z wersjonowaniem, obsługę klawiatury i reduced motion. Nie dodawaj kont, rankingów, multiplayera ani niepotrzebnych funkcji spoza MVP.

Dodaj i uruchom istotne testy z docs/08-acceptance-tests.md. Testy płatnego API oddziel od zwykłych testów. Przy braku klucza, dostępu do sieci lub Windows odnotuj dokładny blocker i wykonuj dalej niezależne prace. Nie wymyślaj pozytywnych wyników, nagrań ani opublikowanych adresów.

Na bieżąco aktualizuj IMPLEMENTATION_STATUS.md: ukończone etapy, realnie wykonane polecenia i wyniki, otwarte problemy, następny krok. Rozstrzygaj sam zwykłe decyzje implementacyjne. Publikacji na zewnętrznym hostingu, zakupów i wysyłki zgłoszenia nie wykonuj bez osobnej autoryzacji.

Na koniec przygotuj działające komendy, instrukcję kompilacji, uruchomienia i użytkowania, raport weryfikacji, konfigurację wydania Windows oraz lokalny folder materiałów konkursowych zgodnie z docs/09-contest-delivery.md. Jasno rozdziel to, co działa w demo, to, co sprawdzono z prawdziwym modelem, i to, co sprawdzono na Windows. Kontynuuj aż wszystkie możliwe w tym środowisku etapy będą wykonane.
