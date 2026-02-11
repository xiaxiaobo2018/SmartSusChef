
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

### Run Dev Environment
Before running the dev environment for the first time, initialize the backend:
```powershell
cd backend
.\setup.ps1
```

Then start all services with:
```powershell
.\dev-start.ps1
```

This will launch three PowerShell windows running:
- **ML Service** on port 8000 (http://localhost:8000)
- **Backend API** on port 5000 (http://localhost:5000)
- **Frontend** on port 5173 (http://localhost:5173)

#### Custom Database Configuration
If you want to use a different database server:
```powershell
.\dev-start.ps1 -DbServer localhost -DbPort 3306 -DbUser root -DbPassword password
```

#### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/swagger
- ML Service: http://localhost:8000
- ML Documentation: http://localhost:8000/docs

#### Troubleshooting
- If a port is already in use: `netstat -ano | findstr :5173`
- Kill a process: `taskkill /PID <process_id> /F`
- To stop services: simply close the PowerShell windows

---

## Servers:
```bash
#server only for deployment(no video card, 2GB RAM):
ssh smartsuschef@oversea.zyh111.icu -p 234 

#server for calculation(ML model training, with video card, 64GB RAM):
ssh zyh@oversea.zyh111.icu -p 233

Mysql:
oversea.zyh111.icu:33333
#user: grp4
```

## Weather API:

```bash
https://open-meteo.com/en/docs
```
## Calendar API:

```bash
https://developers.google.cn/workspace/calendar/api/guides/overview
```

## Terraform Deployment:

```bash
cd infrastructure/terraform
terraform init
terraform apply -var-file="environments/uat.tfvars"
```

