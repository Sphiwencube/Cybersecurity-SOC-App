FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
#RUN pip install --no-cache-dir -r requirements.txt

# Install PyTorch FIRST (cached layer)
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --timeout=1000 \
    --extra-index-url https://download.pytorch.org/whl/cpu \
    torch==2.1.0+cpu

# Install rest
RUN pip install --no-cache-dir --timeout=1000 -r requirements.txt

# Copy application code
COPY . .

EXPOSE 5000

CMD ["python", "app.py"]




