# Materiały do filmu konkursowego

**Montaż i odbiór finalnego filmu: NOT RUN.** Rozpiska trwa 4 min 20 s. Organizator przyjmuje AVI lub MP4 do 5 minut. [Wymagania UwB](https://informatyka.uwb.edu.pl/popularyzacja2/sztuczna-inteligencja-wsrod-nas)

## Ujęcia i tekst lektora

| Czas | Ujęcie | Tekst lektora lub napis |
|---|---|---|
| 0:00–0:25 | Ekran tytułowy, plansza M04, wyróżnione start i bramki. | „W Naucz Pilota wzór wyznacza trasę robota. W tej misji sprawdzamy, jak znak w nawiasie zmienia położenie wierzchołka”. |
| 0:25–1:10 | Demo. Błędny pomysł scenariuszowy, poprawiony wzór i dwie prognozy. Zbliżenie na wynik silnika. | „Najpierw poprawiam wzór i przewiduję wysokości w dwóch punktach. Gra sprawdza tor oraz obie prognozy”. |
| 1:10–1:45 | Demo. Własne słowa gracza, przygotowany komentarz Piko i zapis notatki. | „Gracz wyjaśnia zmianę. Piko może potem skorzystać z notatki i ze sprawdzonej reguły. Na ekranie demo odpowiedź jest przygotowana”. |
| 1:45–2:45 | Plansze z historycznego testu live 1.2.0. Na tej samej geometrii zestaw A, B, C i D z translacji −4. W kolejnym ujęciu pokaż drugi wielomian i timeout D na przebudowanej geometrii. | „To zapis rzeczywistego testu na dwóch geometriach spoza kampanii. Silnik zaliczył siedem otrzymanych wzorów. Ósma próba zakończyła się timeoutem. Treść notatki zmieniała uzasadnienie. W obrębie każdej planszy zwrócone wzory były takie same”. |
| 2:45–3:20 | Aktualne demo. Prognoza wyniku przed odsłonięciem, oryginalny wzór i błąd `START_MISS`, wysokość i zakres startu. Krótkie oddzielnie oznaczone ujęcie z kontrolowanego oczekiwania i pominięcia. | „To komentarz Piko, a tutaj widać wynik silnika. Podczas oczekiwania mogę przejść do własnej próby. Notatka zostaje zapisana”. |
| 3:20–4:00 | Demo. Czwarta plansza, pierwsza nieudana próba, korekta, przejście do podsumowania i odświeżenie. | „Na samodzielnej planszy mam tylko jej dane. Po korekcie aplikacja nadal pamięta wynik pierwszej parsowalnej próby”. |
| 4:00–4:20 | Podsumowanie z dwoma osobnymi wynikami, oznaczone demo offline i plansza końcowa. | „W grze silnik sprawdza matematykę. Piko odgrywa ucznia i korzysta z kontekstu sesji. Kampania działa także offline”. |

## Źródła ujęć

- Lokalny klip `var/jury-candidate/M04_demo_material.mp4` pokazuje 40,92 s aktualnej M04 w przeglądarce z napisami. Zawiera `START_MISS` oraz nieudaną pierwszą próbę i jej zachowanie po korekcie i odświeżeniu. Odtworzenie bez opłat opisuje `npx tsx tools/record-demo.ts` po uruchomieniu lokalnego backendu w demo na porcie 5173. Raport przechwycenia i parametry pliku są w `var/jury-candidate/`.
- Do historycznego segmentu użyj dosłownych wypowiedzi, oryginalnych wzorów i kodów z [próby A/B/C/D](../checks/m04-generalization-1.2.0.live.md). Napis ekranowy „Zapis testu live z 10.11.2026 • GPT-6 Luna Extra High • prompt 1.2.0 • geometrie testowe”. Cytaty nie powinny wyglądać jak właśnie wygenerowane w pokazie demo.
- Ujęcie oczekiwania można przygotować z lokalnego testu z opóźnioną atrapą albo z procedury budżetu zero w [protokole pilotażu](15-pilotaz.md#oddzielna-próba-oczekiwania-i-pominięcia). Oznacz je jako próbę techniczną. Nie ma nagrania tego ujęcia w powyższym klipie.
- Historyczne MP4 z `release/media/` dokumentują wcześniejszy interfejs. Świeże nagranie prawdziwego modelu w aplikacji pozostaje NOT RUN i wymaga odrębnej zgody na wywołania.

## Odbiór montażu

Zachowaj etykiety trybów i kolejność od wyjaśnienia do sprawdzenia. Oznacz skrócenie oczekiwania. Zachowaj widoczny oryginalny błąd i timeout, jeśli występują w omawianym materiale. Przed nagraniem zamknij widoki z sekretami, nazwiskami i prywatnymi rozmowami. Obejrzyj gotowy eksport w całości, sprawdź czytelność napisów, głośność i czas. Zapisz SHA kodu, źródła ujęć, czas eksportu i sumę SHA-256 filmu w karcie zgłoszenia technicznego.
