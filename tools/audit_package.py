#!/usr/bin/env python3
"""Niezalezny audyt danych Naucz Pilota (stdlib, bez gotowego backendu).
Uruchom: python3 tools/audit_package.py
Sprawdza tylko fixture i ich spojnosc. Nie jest drugim silnikiem runtime.
"""
from __future__ import annotations
import ast
import json
import math
import re
from datetime import datetime, timezone
from fractions import Fraction
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EPS = 1e-9
R = 0.12

def load(path):
    return json.loads((ROOT / path).read_text(encoding="utf-8"))

def poly(expression):
    source = expression.replace("^", "**").replace("²", "**2")
    source = re.sub(r"(?<=\d)(?=x|\()", "*", source)
    source = re.sub(r"(?<=[x)])(?=\()", "*", source)
    def add(a,b,sgn=1):
        return [a[i] + sgn*b[i] for i in range(3)]
    def mul(a,b):
        c = [Fraction(0)] * 5
        for i in range(3):
            for j in range(3):
                c[i+j] += a[i]*b[j]
        assert c[3:] == [0,0], "degree > 2 in fixture"
        return c[:3]
    def visit(n):
        if isinstance(n, ast.Constant) and type(n.value) in (int,float):
            return [Fraction(str(n.value)),Fraction(0),Fraction(0)]
        if isinstance(n, ast.Name) and n.id == "x":
            return [Fraction(0),Fraction(1),Fraction(0)]
        if isinstance(n, ast.UnaryOp) and isinstance(n.op,(ast.USub,ast.UAdd)):
            a=visit(n.operand)
            return [-v for v in a] if isinstance(n.op,ast.USub) else a
        if isinstance(n, ast.BinOp):
            a,b=visit(n.left),visit(n.right)
            if isinstance(n.op,ast.Add): return add(a,b)
            if isinstance(n.op,ast.Sub): return add(a,b,-1)
            if isinstance(n.op,ast.Mult): return mul(a,b)
            if isinstance(n.op,ast.Div):
                assert b[1:]==[0,0] and b[0] != 0
                return [v/b[0] for v in a]
            if isinstance(n.op,ast.Pow):
                assert b[1:]==[0,0] and b[0] in (0,1,2)
                return [Fraction(1),Fraction(0),Fraction(0)] if b[0]==0 else a if b[0]==1 else mul(a,a)
        raise AssertionError("unsupported fixture expression")
    c=visit(ast.parse(source,mode="eval").body)
    return tuple(float(v) for v in reversed(c))

def val(c,x):
    return c[0]*x*x+c[1]*x+c[2]

def roots(c,target):
    a,b,d=c[0],c[1],c[2]-target
    if a==0:
        return [] if b==0 else [-d/b]
    discriminant=b*b-4*a*d
    if discriminant<0: return []
    s=math.sqrt(discriminant)
    return [(-b-s)/(2*a),(-b+s)/(2*a)]

def partition(c,left,right,levels):
    points=[left,right]
    for level in levels:
        points.extend(x for x in roots(c,level) if left <= x <= right)
    points=sorted(set(points))
    return points+[(a+b)/2 for a,b in zip(points,points[1:])]

def portal_ok(c,p):
    y=val(c,p["x"])
    return p["yMin"]+R-EPS <= y <= p["yMax"]-R+EPS

def verdict(s,c):
    family="quadratic" if c[0]!=0 else "linear" if c[1]!=0 else "constant"
    if family not in s["allowedFamilies"]: return "FAMILY_MISMATCH"
    values=dict(zip(("c2","c1","c0"),c))
    if any(abs(values[k]-v)>EPS for k,v in s["coefficientLocks"].items()):
        return "CONSTRAINT_VIOLATION"
    if "vertexLock" in s:
        if c[0]==0: return "CONSTRAINT_VIOLATION"
        vx=-c[1]/(2*c[0])
        vv={"x":vx,"y":val(c,vx)}
        if any(abs(vv[k]-v)>EPS for k,v in s["vertexLock"].items()):
            return "CONSTRAINT_VIOLATION"
    if not portal_ok(c,s["start"]): return "START_MISS"
    d=s["domain"]
    low,high=d["yMin"]+R-EPS,d["yMax"]-R+EPS
    points=partition(c,d["xMin"],d["xMax"],[low,high])
    if any(val(c,x)<low-1e-12 or val(c,x)>high+1e-12 for x in points):
        return "OUT_OF_BOUNDS"
    for o in s["obstacles"]:
        left,right=max(d["xMin"],o["xMin"]-R),min(d["xMax"],o["xMax"]+R)
        if left>right: continue
        bottom,top=o["yMin"]-R-EPS,o["yMax"]+R+EPS
        points=partition(c,left,right,[bottom,top])
        if any(bottom-1e-12<=val(c,x)<=top+1e-12 for x in points):
            return "OBSTACLE_COLLISION"
    if any(not portal_ok(c,p) for p in s["gates"]+[s["goal"]]):
        return "GATE_MISS"
    return "SUCCESS"

def main():
    data=load("content/missions.v1.json")
    skills=load("content/skills.v1.json")
    hints=load("content/hints.v1.json")
    evals=load("content/ai-evals.v1.json")
    response=load("contracts/ai-response.schema.json")
    missions={m["id"]:m for m in data["missions"]}
    assert len(missions)==6
    scenes=0
    failures=0
    for m in data["missions"]:
        skill=next(s for s in skills["skills"] if s["missionId"]==m["id"])
        assert skill["canonicalRuleText"]==m["ruleText"]
        assert skill["canonicalRuleId"]==m["canonicalRuleId"]
        for role,s in m["scenes"].items():
            assert s["role"]==role and s["id"]==m["id"]+"-"+role
            w=s["witness"]
            c=poly(w["expression"])
            assert all(abs(a-w[k])<1e-12 for a,k in zip(c,("c2","c1","c0")))
            assert verdict(s,c)=="SUCCESS",s["id"]
            for f in s["knownFailures"]:
                c=poly(f["expression"])
                assert all(abs(a-f[k])<1e-12 for a,k in zip(c,("c2","c1","c0")))
                assert verdict(s,c)==f["expectedCode"],(s["id"],f["expression"])
                failures+=1
            if role=="human_check":
                assert verdict(s,poly(s["initialExpression"]))!="SUCCESS"
            scenes+=1
        t=m["scenes"]["robot_transfer"]
        h=m["scenes"]["human_check"]
        assert t["witness"]!=h["witness"]
        assert any(t[k]!=h[k] for k in ["domain","start","goal","gates","obstacles"])
    hint_count=0
    for entry in hints["missions"]:
        m=missions[entry["missionId"]]
        assert entry["sceneId"]==m["scenes"]["practice"]["id"]
        assert entry["skillId"]==m["skillId"]
        assert [h["level"] for h in entry["hints"]]==[1,2,3]
        hint_count+=len(entry["hints"])
    assert hint_count==18
    assert response["additionalProperties"] is False
    assert set(response["required"])==set(response["properties"])
    assert not (set(response["properties"]) & {"score","success","unlock"})
    assert evals["status"]=="planned_not_executed"
    assert len(evals["cases"])==42
    for path in (ROOT/"content").glob("*.json"):
        json.loads(path.read_text(encoding="utf-8"))
    for path in (ROOT/"contracts").glob("*.json"):
        json.loads(path.read_text(encoding="utf-8"))
    required=["README.md","AGENTS.md","START_CODEX.md","SCHEMAT_PROJEKTU.md","IMPLEMENTATION_STATUS.md"]
    required += ["docs/"+p for p in [
        "01-product.md","02-game-and-learning.md","03-architecture.md","04-math-engine.md",
        "05-ai-contract.md","06-ui-ux.md","07-implementation-plan.md","08-acceptance-tests.md",
        "09-contest-delivery.md","10-sources-and-decisions.md"]]
    assert all((ROOT/p).is_file() for p in required)
    report={
        "ok":True,"checkedAtUTC":datetime.now(timezone.utc).isoformat(),
        "scope":"Independent fixture/content audit; not application tests or live AI.",
        "method":"Separate AST coefficient expansion and root-partition inequalities; no import of reference validator.",
        "scenes":scenes,"witnessesPassed":scenes,"knownFailuresMatched":failures,
        "humanInitialExpressionsNotSolutions":True,"hintCount":hint_count,
        "ruleTextMatchesSkills":True,"responseHasNoOutcomeAuthority":True,
        "plannedAiCases":len(evals["cases"]),"liveAiCalls":0,
        "fullExternalJsonSchemaEngineUsed":False
    }
    dest=ROOT/"checks"/"independent-audit.json"
    dest.parent.mkdir(exist_ok=True)
    dest.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=="__main__":
    main()
