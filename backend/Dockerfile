FROM python:3.13-slim
WORKDIR /app
COPY ../pyproject.toml ../uv.lock ./
RUN pip install uv && uv sync
COPY . .
EXPOSE 8000
ENV DJANGO_ENV=dev
CMD ["uv", "run", "backend/manage.py", "runserver", "0.0.0.0:8000"]