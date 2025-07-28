import nox

@nox.session
def lint(session):
    session.run("ruff", "check", "backend/", external=True)

@nox.session
def format(session):
    session.run("black", "backend/", external=True)

@nox.session
def test(session):
    session.run("uv", "run", "backend/manage.py", "test", external=True)