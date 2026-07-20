#!/usr/bin/env python3
"""YVON RAG Pipeline — Full Test Suite Runner"""
import sys, os

RAG = os.path.dirname(os.path.abspath(__file__))
PROJECT = os.path.join(RAG, '..')
TEAMS = os.path.join(RAG, '..', 'Teams')
os.chdir(RAG)

sys.path.insert(0, os.path.join(RAG, '..'))  # So 'from rag.xxx' imports work
sys.path.insert(0, os.path.join(RAG, 'core'))
sys.path.insert(0, os.path.join(RAG, 'harness'))
sys.path.insert(0, os.path.join(RAG, 'verify'))
sys.path.insert(0, os.path.join(RAG, 'monitor'))
sys.path.insert(0, os.path.join(RAG, 'eval'))
sys.path.insert(0, os.path.join(TEAMS, 'Shared OS', 'logical'))

MODULES = {
    'core/injector':     ('injector',     '3-layer compression engine'),
    'core/strategy':     ('strategy',     'multi-strategy token pipeline'),
    'core/destructor':   ('destructor',   'hard budget guarantee pipeline'),
    'core/optimizer':    ('optimizer',    'dynamic context optimizer'),
    'core/retriever':    ('retriever',    'full retrieval pipeline'),
    'core/bridge':       ('bridge',       'CIE RAG bridge'),
    'core/embed':        ('embed',        'hybrid embedder'),
    'core/feedback':     ('feedback',     'quality feedback loop'),
    'harness/gates':     ('gates',        '5-gate verification'),
    'harness/disclosure': ('disclosure',  'progressive skill disclosure'),
    'verify/grounded':   ('grounded',     'post-hoc citation verification'),
    'monitor/watcher':   ('watcher',      'field quality observer'),
    'monitor/improver':  ('improver',     'self-improvement agent'),
    'eval/judge':        ('judge',        '6-metric LLM-as-judge'),
    'eval/flywheel':     ('flywheel',     '5-stage quality flywheel'),
}

passed = 0
failed = 0

for path, (mod_name, desc) in MODULES.items():
    filepath = os.path.join(RAG, path + '.py')
    if not os.path.exists(filepath):
        print(f'  ❌ {path}: FILE NOT FOUND')
        failed += 1
        continue

    try:
        with open(filepath) as f:
            code = compile(f.read(), filepath, 'exec')
        ns = {'__name__': mod_name, '__file__': filepath}
        exec(code, ns)

        fn = ns.get('run_tests')
        if fn:
            p = fn() if 'chunkify' not in mod_name else fn(TEAMS)
            if p:
                passed += 1
            else:
                failed += 1
                print(f'  ❌ {path}: tests failed')
        else:
            print(f'  ~ {path}: no run_tests()')
            passed += 1  # Loadable = OK
    except Exception as e:
        failed += 1
        print(f'  ❌ {path}: {e}')

print(f'\n  {"─"*40}')
print(f'  Results: {passed}/{passed+failed} modules passed')
print(f'  Status: {"✅ ALL PASSING" if failed == 0 else "❌ FAILURES DETECTED"}')
sys.exit(0 if failed == 0 else 1)
