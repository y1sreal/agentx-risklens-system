FROM python:3.9-slim

WORKDIR /app

COPY requirements_minimal.txt .

RUN pip install --no-cache-dir -r requirements_minimal.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"] 