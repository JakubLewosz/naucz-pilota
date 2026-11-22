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
   const sawIdea=(r.attempts.teach??[]).some(a=>a.source==='demo');
   const evidence=r.repairChecked&&deriveRuleEvidence(m,r.drafts.teach,numericEvidence(s));
   const repair=(r.attempts.teach??[]).filter(a=>a.source==='human').at(-1);
   if(!sawIdea&&!r.repairChecked)return 'Piko ma błędny pomysł. Kliknij „Sprawdź pomysł Piko”, żeby zobaczyć, dlaczego nie działa.';
   if(!r.repairChecked)return 'Popraw wzór Piko, wpisz, jaką wysokość przewidujesz w G1 i G2, i kliknij „Sprawdź naprawę”.';
   if(repair&&!repair.result.ok)return 'Poprawiony wzór jeszcze nie prowadzi bezpiecznie. Popraw go i sprawdź ponownie.';
   if(!evidence)return 'Tor jest dobry, ale prognoza się nie zgadza. Podstaw x bramki do wzoru i policz y jeszcze raz.';
   if(s.busy)return 'Piko czyta Twoje wyjaśnienie…';
   if(!r.lessonReply)return r.explanation.trim()
    ?'Kliknij „Powiedz Piko”, żeby sprawdzić, jak zrozumie Twoje wyjaśnienie. Możesz też od razu zapisać notatkę.'
    :'Wyjaśnij Piko własnymi słowami, co ma zmienić i dlaczego. Potem kliknij „Powiedz Piko”.';
   if(r.lessonReply.assessment&&r.lessonReply.assessment!=='sound')return 'Piko czegoś jeszcze nie rozumie. Uzupełnij wyjaśnienie (odpowiedz na jego pytanie) i kliknij „Powiedz Piko” ponownie.';
   return 'Piko zrozumiał. Zapisz notatkę, którą zabierze na nową trasę.';
  }
  case 'robot_transfer':
   if(s.busy)return 'Piko analizuje nową trasę…';
   if(!r.robot&&!r.unavailable)return 'Kliknij „Piko, spróbuj sam”. Piko użyje Twojej notatki na trasie, której nie widział.';
   if(r.robot&&!r.robotChecked)return 'Przeczytaj wzór i uzasadnienie Piko. Zaznacz, czy Twoim zdaniem przeleci, i kliknij „Sprawdź lot Piko”.';
   if(r.robotChecked&&last?.result.ok)return 'Piko przeleciał dzięki Twojej lekcji. Teraz Twoja kolej.';
   if(r.robotChecked)return 'Piko się pomylił. Możesz dać mu jedną poprawkę albo przejść do własnej próby.';
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
  {label:'Zobacz błędny pomysł Piko',done:(r.attempts.teach??[]).some(a=>a.source==='demo')||evidence},
  {label:'Popraw wzór i przewidź wysokość w G1 i G2',done:evidence},
  {label:'Wyjaśnij Piko zasadę',done:Boolean(r.lessonReply)},
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
