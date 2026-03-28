#!/bin/bash

# SOC Guard - Quick Start Script
# This script helps you start the SOC application

echo "=========================================="
echo "  SOC Guard - Quick Start"
echo "  Cybersecurity Incident Intelligence"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Desktop which includes Docker Compose"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Error: Docker is not running${NC}"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

echo -e "${GREEN}✓ Docker is installed and running${NC}"
echo ""

# Function to show menu
show_menu() {
    echo "What would you like to do?"
    echo ""
    echo "1) Start all services (first time or rebuild)"
    echo "2) Start services in background"
    echo "3) Stop all services"
    echo "4) View logs"
    echo "5) Restart services"
    echo "6) Reset database (WARNING: All data will be lost)"
    echo "7) Check service status"
    echo "8) Exit"
    echo ""
}

# Function to start services
start_services() {
    echo -e "${BLUE}Starting SOC Guard services...${NC}"
    echo "This may take 2-3 minutes for the first time..."
    echo ""
    docker-compose up --build
}

# Function to start in background
start_background() {
    echo -e "${BLUE}Starting SOC Guard services in background...${NC}"
    docker-compose up --build -d
    echo ""
    echo -e "${GREEN}✓ Services started in background${NC}"
    echo ""
    echo "Access the application at:"
    echo "  Frontend: http://localhost:4200"
    echo "  Backend API: http://localhost:8080"
    echo ""
    echo "View logs with: docker-compose logs -f"
}

# Function to stop services
stop_services() {
    echo -e "${BLUE}Stopping SOC Guard services...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Function to view logs
view_logs() {
    echo -e "${BLUE}Viewing logs (Press Ctrl+C to exit)...${NC}"
    docker-compose logs -f
}

# Function to restart services
restart_services() {
    echo -e "${BLUE}Restarting SOC Guard services...${NC}"
    docker-compose restart
    echo -e "${GREEN}✓ Services restarted${NC}"
}

# Function to reset database
reset_database() {
    echo -e "${RED}WARNING: This will delete all data!${NC}"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        echo -e "${BLUE}Resetting database...${NC}"
        docker-compose down -v
        docker-compose up --build
    else
        echo "Cancelled"
    fi
}

# Function to check status
check_status() {
    echo -e "${BLUE}Checking service status...${NC}"
    echo ""
    docker-compose ps
    echo ""
    
    # Check if services are healthy
    echo "Service Health:"
    
    # Check MySQL
    if docker-compose exec -T mysql mysqladmin ping &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} MySQL - Running"
    else
        echo -e "  ${RED}✗${NC} MySQL - Not running"
    fi
    
    # Check Backend
    if curl -s http://localhost:8080/api/incidents &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Backend - Running"
    else
        echo -e "  ${RED}✗${NC} Backend - Not running"
    fi
    
    # Check Frontend
    if curl -s http://localhost:4200 &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} Frontend - Running"
    else
        echo -e "  ${RED}✗${NC} Frontend - Not running"
    fi
    
    # Check AI Service
    if curl -s http://localhost:5000/health &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} AI Service - Running"
    else
        echo -e "  ${RED}✗${NC} AI Service - Not running"
    fi
}

# Main loop
while true; do
    show_menu
    read -p "Enter your choice (1-8): " choice
    echo ""
    
    case $choice in
        1)
            start_services
            ;;
        2)
            start_background
            ;;
        3)
            stop_services
            ;;
        4)
            view_logs
            ;;
        5)
            restart_services
            ;;
        6)
            reset_database
            ;;
        7)
            check_status
            ;;
        8)
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo -e "${RED}Invalid choice. Please try again.${NC}"
            ;;
    esac
    
    echo ""
    read -p "Press Enter to continue..."
    clear
done
