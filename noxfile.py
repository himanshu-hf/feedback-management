import nox

@nox.session
def lint(session):
    session.run("ruff", "backend/", "frontend/", external=True)

@nox.session
def format(session):
    session.run("black", "backend/", external=True)

@nox.session
def test(session):
    session.run("uv", "run", "backend/manage.py", "test", external=True)

@nox.session
def migrate_check(session):
    session.run("uv", "run", "backend/manage.py", "makemigrations", "--check", "--dry-run", external=True)
    session.run("uv", "run", "backend/manage.py", "migrate", "--plan", external=True)