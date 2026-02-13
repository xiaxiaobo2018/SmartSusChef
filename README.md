
# SmartSusChef
### _Smarter Prep, Less Waste_

**SmartSusChef** is a predictive analytics application designed for F&B operators who prepare food or dishes in advance—such as economical rice stalls, buffets, and canteen operators. These businesses often struggle with unpredictable daily demand, leading to over‑preparation and unnecessary food waste.

SmartSusChef helps operators answer the key question:

### **“How much should I prep for tomorrow?”**

---

### What SmartSusChef Does

- 📊 **Demand Forecasting**  
  Uses time‑series machine learning models enhanced with weather and calendar signals to predict next‑day demand.

- 🔁 **Flexible Data Input**  
  Accepts sales and leftover data through manual entry or CSV import.

- 🌤️ **Weather‑ & Event‑Aware Insights**  
  Incorporates external factors like weather and school holidays that affect demand.

- 🧾 **Recipe & Ingredient Management**  
  Helps contextualize prep recommendations by linking them to actual recipes and ingredients.

- 📱 **Mobile App for Employees**  
  Simple interface to input sales/wastage data and view short‑term insights (last 7 days).

- 🖥️ **Web Dashboard for Managers**  
  View trends up to 30 days, manage data, edit entries, export reports, and monitor waste patterns.

- ♻️ **Waste Tracking & Reduction**  
  Tracks surplus and leftover patterns to support more sustainable operations.

-----

### Who We Designed This For

SmartSusChef is built specifically for F&B operators who:
- Prepare ingredients or dishes in advance  
- Receive pre‑prepared food from central kitchens  
- Need simple, affordable forecasting tools  
- Want to reduce food waste without relying on complex POS systems

-----

### Why It Matters

Food waste is a major sustainability issue. SmartSusChef empowers operators to:
- Prep more accurately  
- Reduce avoidable wastage  
- Improve profitability  
- Contribute to Singapore’s Zero Waste goals

-----

## Quick Start

### 1. Environment Configuration (`.env`)

The project uses a `.env` file in the project root to manage local development configuration. Before first use, create it from the provided template:

```powershell
# Windows
Copy-Item .env.example .env

# Linux / macOS
cp .env.example .env
```

Then edit `.env` and fill in your database connection details:

```dotenv
# SmartSusChef Local Development Environment

DB_SERVER=localhost        # Database host address
DB_PORT=3306               # Database port (MySQL default: 3306)
DB_USER=root               # Database username
DB_PASSWORD=your_password  # Database password
DB_NAME=smartsuschef       # Database name
```

> **Note:** The startup scripts (`dev-start.ps1` / `dev-start.sh`) automatically load the `.env` file and inject variables into the runtime environment — no manual `export` required. Command-line parameters (e.g., `-DbServer`) take precedence over `.env` values.

The frontend also has its own environment files (usually no changes needed):

| File | Purpose |
|------|---------|
| `frontend/.env.example` | Frontend environment variable template |
| `frontend/.env.production` | Production config (API uses nginx-proxied relative path `/api`) |

Frontend development environment variables (`frontend/.env.example`):

```dotenv
VITE_API_URL=http://localhost:5001/api   # Backend API URL
VITE_ENV=development                      # Environment identifier
```

---

### 2. Database Setup

The database initialization SQL script is located at **`database/smartsuschef.sql`**.

#### Manual Import (Local MySQL)

```bash
# Make sure MySQL is running, then execute:
mysql -u root -p < database/smartsuschef.sql
```

Or from within a MySQL client:

```sql
SOURCE database/smartsuschef.sql;
```

#### Using Docker Compose (Auto-Initialization)

If you start the project via `docker-compose.yml`, the MySQL container will automatically run the initialization script on first launch — no manual import needed.

```powershell
docker-compose up -d
```

---

### 3. Run Dev Environment
Before running the dev environment for the first time, initialize the backend:
```powershell
cd backend
.\setup.ps1
```

Then start all services with:
```powershell
.\dev-start-mobile.ps1
```

This will launch three PowerShell windows running:
- **ML Service** on port 8000 (http://localhost:8000)
- **Backend API** on port 5001 (http://localhost:5001)
- **Frontend** on port 5173 (http://localhost:5173)

#### Custom Database Configuration
If you want to use a different database server:
```powershell
.\dev-start-mobile.ps1 -DbServer localhost -DbPort 3306 -DbUser root -DbPassword password
```

#### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:5001
- API Documentation: http://localhost:5001/swagger
- ML Service: http://localhost:8000
- ML Documentation: http://localhost:8000/docs


---

## Weather API:

```bash
https://open-meteo.com/en/docs
```
## Calendar API:

```bash
https://developers.google.com/workspace/calendar/api/guides/overview
```

## Terraform Deployment:

```bash
cd infrastructure/terraform
terraform init
terraform apply -var-file="environments/uat.tfvars"
```

