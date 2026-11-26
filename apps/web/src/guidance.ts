import {deriveRuleEvidence} from '@piko/core';
import {missionById} from '@piko/content';
import {numericEvidence,type GameState,type Run} from './state';

/** Jedno zdanie: co gracz ma zrobić teraz. Liczone ze stanu gry, bez AI. */
export function nextStep(s:GameState,r:Run):string{
 const m=missionById(s.missionId),last=r.attempts[r.role]?.at(-1);
 switch(r.role){
  case 'practice':
   if(!last)return 'Wpisz wzór funkcji i kliknij „Leć”. Tor musi przejść przez START, obie bramki i METĘ, nie dotykając przeszkody.';
   if(!last.result.ok)return r.hintCount<3
    ?'Lot się nie udał. Zobacz na planszy, gdzie tor wypadł, popraw wzór albo odkryj wskazówkę.'
    :'Lot się nie udał. Zobacz na planszy, gdzie tor wypadł, i popraw wzór.';
   return 'Udało się! Kliknij „Teraz naucz Piko”.';
  case 'teach':{
   const evidence=r.repairChecked&&deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s));
   const repair=(r.attempts.teach??[]).filter(a=>a.source==='human').at(-1);
   if(!r.repairChecked)return 'Piko poleciał według swojego pomysłu i się rozbił (widać na planszy). Popraw jego wzór i kliknij „Sprawdź naprawę”.';
   if(repair&&!repair.result.ok)return 'Poprawiony wzór jeszcze nie prowadzi bezpiecznie. Popraw go i sprawdź ponownie.';
   if(!evidence)return 'Ten wzór przelatuje, ale nie pokazuje zasady tej misji. Zmień tylko to, co pomylił Piko.';
   if(s.busy)return 'Piko czyta Twoje wyjaśnienie…';
   if(!r.lessonReply)return r.explanation.trim()
    ?'Kliknij „Powiedz Piko”, żeby sprawdzić, jak zrozumie Twoje wyjaśnienie.'
    :'Wyjaśnij Piko własnymi słowami, co ma zmienić i dlaczego. Potem kliknij „Powiedz Piko”.';
   if(r.lessonReply.assessment&&r.lessonReply.assessment!=='sound')return 'Piko czegoś jeszcze nie rozumie. Uzupełnij wyjaśnienie (odpowiedz na jego pytanie) i kliknij „Powiedz Piko” ponownie.';
   return 'Przeczytaj, co Piko zapamięta. Na nowej trasie poleci dokładnie według tego zdania. Jeśli się zgadza, zapisz notatkę.';
  }
  case 'robot_transfer':
   if(s.busy)return 'Piko analizuje nową trasę…';
   if(!r.robot&&!r.unavailable)return s.mode==='demo'
    ?'Kliknij „Piko, spróbuj sam”. W trybie pokazowym Piko poleci przygotowanym wzorem, więc ten lot nie sprawdza Twojej lekcji.'
    :'Kliknij „Piko, spróbuj sam”. Piko zna tylko Twoją notatkę i poleci według niej na trasie, której nie widział.';
   if(r.robot&&!r.robotChecked)return 'Przeczytaj wzór i uzasadnienie Piko, zgadnij, czy przeleci, i kliknij „Sprawdź lot Piko”.';
   if(r.robotChecked&&r.robot?.mode==='demo')return 'To był przygotowany lot z trybu pokazowego. Żeby sprawdzić Twoją lekcję, włącz prawdziwe AI albo przejdź do własnej próby.';
   if(r.robotChecked&&last?.result.ok)return r.lessonReply?.assessment==='sound'?'Piko przeleciał dzięki Twojej lekcji. Teraz Twoja kolej.':'Piko przeleciał, ale lekcja nie była pełna. Możesz ją poprawić albo przejść do własnej próby.';
   if(r.robotChecked)return 'Piko rozbił się, bo poleciał według Twojej lekcji. Znajdź w jego uzasadnieniu, co go zmyliło, i kliknij „Popraw lekcję dla Piko”.';
   return 'Możesz przejść do własnej próby.';
  case 'human_check':
   if(r.completed)return 'Gotowe! Kliknij „Zobacz podsumowanie”.';
   if(!last)return 'Nowa trasa, tym razem bez podglądu toru i bez pomocy. Liczy się pierwsza próba, więc najpierw policz, potem kliknij.';
   return 'Pierwsza próba jest zapisana. Popraw wzór i spróbuj jeszcze raz.';
 }
}

/** Lista zadań w kroku „Naucz Piko”. */
export function teachChecklist(s:GameState,r:Run){
 const m=missionById(s.missionId);
 const evidence=Boolean(r.repairChecked&&deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s)));
 return [
  {label:'Popraw wzór Piko',done:evidence},
  {label:'Wyjaśnij Piko, co zmienić i dlaczego',done:Boolean(r.lessonReply)},
  {label:'Zapisz notatkę dla Piko',done:false}
 ];
}

/** Zapis wzoru tak, jak w zeszycie: przecinek dziesiętny, kwadrat, kropka mnożenia. */
export function prettyFormula(expression:string){
 return expression.trim()
  .replace(/^(?:y\s*=|f\s*\(\s*x\s*\)\s*=)\s*/,'')
  .replace(/\^2/g,'²').replace(/\^1/g,'').replace(/\*/g,'·')
  .replace(/(\d)\.(\d)/g,'$1,$2')
  .replace(/\s*([+])\s*/g,' + ').replace(/(?<=[\w)²])\s*-\s*/g,' − ');
}
