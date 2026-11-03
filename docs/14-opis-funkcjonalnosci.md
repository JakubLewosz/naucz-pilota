# Naucz Pilota

Gra o funkcjach, w której uczysz robota.

Napisz funkcję. Wyznacz bezpieczny tor. Naucz Piko, dlaczego działa.

Naucz Pilota pozwala ćwiczyć wpływ parametrów na wykres funkcji. W sześciu misjach gracz zapisuje wzór wyznaczający trasę robota Piko, przechodzi przez bramki i unika przeszkód. Misje obejmują wysokość i nachylenie prostej, przesunięcia i szerokość paraboli oraz łączenie przekształceń. Gra jest jednoosobowa, po polsku, bez kont i rankingu.

Każda misja ma cztery różne plansze: ćwiczenie, uczenie Piko, próbę robota oraz samodzielne zadanie gracza. W części uczenia gracz poprawia błędny pomysł Piko, przewiduje dwie wartości funkcji i wyjaśnia zmianę własnymi słowami. Po sprawdzeniu liczbowym zatwierdza kanoniczną zasadę. Na nowej planszy Piko proponuje własny wzór. Niezależny silnik matematyczny sprawdza wszystkie loty i wykrywa kolizje analitycznie.

Adapter OpenAI Responses API ze Structured Outputs jest zaimplementowany. Tryb live sprawdzono lokalnie z modelem gpt-5.4-mini: 22 tury testowe i rzeczywiste przejście M04 w przeglądarce. Jakość dialogu ma zapisane ograniczenia; komentarz AI nie decyduje o zaliczeniu. Backend dla zewnętrznego odbiorcy wymaga osobnego wdrożenia. Lokalny tryb demonstracyjny korzysta z jawnie oznaczonych odpowiedzi scenariuszowych i działa bez internetu. Piko odgrywa ucznia; aplikacja zapisuje reguły i przekazuje je w kontekście rozmowy, bez trenowania wag modelu.

Samodzielne zadanie ma nową geometrię i przed pierwszym zatwierdzeniem ukrywa podgląd trasy, obliczenia, AI i dziennik. Pierwszy parsowalny wynik pozostaje zapisany oddzielnie od późniejszych prób i wyniku robota. Wynik opisuje wykonanie konkretnego zadania, bez obietnicy trwałego przyrostu wiedzy.

Implementacja: React, TypeScript, Vite, SVG, Express i Electron. Kampania demo przeszła pełny test przeglądarkowy; silnik sprawdzono na 24 rozwiązaniach i 37 błędnych przykładach. Utworzono paczkę Windows x64, ale jej uruchomienie na Windows, publiczny backend live i pilotaż wymagają osobnego odbioru. Dokumentacja zawiera rzeczywiste wyniki i pozostałe ograniczenia.
