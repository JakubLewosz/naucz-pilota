# Sprawdzenie materiałów projektowych
Data: 2026-11-03. Zakres: paczka specyfikacji i dane do przyszłej aplikacji.

## Faktycznie uruchomione
1. tools/validate_missions.py:
   - 6 misji, 24 sceny;
   - 24 rozwiązania referencyjne zaakceptowane;
   - 37 znanych błędów odrzuconych oczekiwanym kodem;
   - 42 kontrole parsera i geometrii;
   - własny walidator użytego podzbioru schematu danych misji;
   - zgodność tekstów wzorów z zadeklarowanymi współczynnikami;
   - oddzielne plansze human_check i robot_transfer.
2. tools/audit_package.py:
   - niezależne rozwinięcie wzorów przez AST, bez importowania walidatora referencyjnego;
   - ponowne sprawdzenie 24 poprawnych i 37 błędnych przykładów;
   - kolizje sprawdzone przez pierwiastki równań i podział przedziałów, zamiast powtórnego użycia funkcji polynomialRange;
   - spójne reguły misji i umiejętności, 18 wskazówek, wymagane pliki;
   - żaden wzór startowy human_check nie rozwiązuje sceny;
   - payload modelu nie nadaje wyniku gry.
3. Przegląd dokumentów:
   - rozdzielono lokalną rewizję widoku i serwerową rewizję sesji;
   - ujednolicono konfigurację limitów;
   - doprecyzowano lokalne demo bez serwera;
   - dopasowano nieporozumienia do rzeczywistych scen;
   - rozdzielono kwalifikację liczbową reguły od potwierdzenia w interfejsie.

Raporty maszynowe: math-validation.json i independent-audit.json.

## Granice tych kontroli
Nie użyto zewnętrznego silnika JSON Schema Ajv/Zod/jsonschema w tym środowisku. Walidator misji sprawdza wszystkie użyte słowa własnego schematu, a podczas implementacji wymagane jest dodatkowe uruchomienie standardowego walidatora.

42 przypadki content/ai-evals.v1.json są przygotowanym planem oraz danymi wejściowymi. Nie są raportem z działania backendu. Ręcznie przygotowana poprawna strukturalnie wypowiedź nie jest odpowiedzią prawdziwego modelu.

## Niewykonane
- Uruchomienie aplikacji React/Express/Electron — aplikacja nie jest jeszcze zbudowana.
- Testy E2E i testy runtime TypeScript.
- Wywołania płatnego modelu, pomiary czasu i kosztu.
- Uruchomienie wydania Windows.
- Testy z użytkownikami i badanie efektu edukacyjnego.
- Wdrożenie backendu, nagranie filmu i wysłanie zgłoszenia.

Wynik kontroli pakietu: gotowy materiał wejściowy do implementacji. Wynik gotowości aplikacji: jeszcze nie dotyczy.
