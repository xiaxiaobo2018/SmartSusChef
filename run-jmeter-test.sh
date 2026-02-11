#!/bin/bash

# --- Configuration ---
DB_HOST="oversea.zyh111.icu"
DB_PORT="33333"
DB_USER="grp4"
DB_NAME="smartsuschef"
JMETER_TEST_PLAN="testing/performance/jmx/Main_Scenario.jmx"
JMETER_RESULTS_FILE="testing/performance/results/Final_Run_UAT.jtl"
JMETER_REPORT_DIR="testing/performance/reports/Final_Run_Report/"

# --- Pre-requisite Check ---
if ! command -v mysql &> /dev/null
then
    echo "Error: 'mysql' command not found. Please install MySQL client."
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    echo "Error: DB_PASSWORD environment variable is not set."
    echo "Please set it before running the script, e.g.: export DB_PASSWORD='your_password'"
    exit 1
fi

# --- Step 1: Clean old JMeter artifacts ---
echo "--- Cleaning old JMeter artifacts ---"
rm -rf testing/performance/results/* testing/performance/reports/*
mkdir -p testing/performance/results
mkdir -p testing/performance/reports

# --- Step 2: Clear test ingredients from the database ---
echo "--- Clearing test ingredients and recipes from the database ---"
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM WastageData WHERE IngredientId IN (SELECT Id FROM Ingredients WHERE Name LIKE 'Test Ingredient %');"; then
    echo "Successfully cleared related WastageData."
else
    echo "Warning: Failed to clear related WastageData. Continuing. Check credentials or connection."
fi

if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM Recipes WHERE Name LIKE 'Test Recipe %';"; then
    echo "Successfully deleted test recipes."
else
    echo "Warning: Failed to delete test recipes from the database. Continuing. Check credentials or connection."
fi

if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM Ingredients WHERE Name LIKE 'Test Ingredient %';"; then
    echo "Successfully deleted test ingredients."
else
    echo "Error: Failed to delete test ingredients from the database. Check credentials or connection."
    exit 1
fi

# --- Step 3: Execute JMeter performance audit ---
echo "--- Executing JMeter performance audit ---"
jmeter -n -t "$JMETER_TEST_PLAN" \
       -l "$JMETER_RESULTS_FILE" \
       -e -o "$JMETER_REPORT_DIR" \
       -Jtarget_url=localhost \
       -Jtarget_port=5000 \
       -f

if [ $? -eq 0 ]; then
    echo "--- JMeter test completed successfully ---"
    echo "HTML Report available at: $JMETER_REPORT_DIR/index.html"
else
    echo "--- JMeter test failed ---"
fi

echo "--- Script finished ---"

# --- Step 4: Final Validation and Auto-Open ---
if [ $? -eq 0 ]; then
    echo "--- JMeter test execution successful ---"
    
    # Check if the error rate is actually 0.00%
    ERROR_COUNT=$(grep -c ",false," "$JMETER_RESULTS_FILE" 2>/dev/null)
    if [ -z "$ERROR_COUNT" ]; then
        ERROR_COUNT=0
    fi
    
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo "✅ PERFECT RUN: 0% Error Rate detected."
        echo "Opening HTML Report..."
        open "$JMETER_REPORT_DIR/index.html"
    else
        echo "⚠️  STABILITY ALERT: Test finished, but $ERROR_COUNT samples failed."
        echo "Check $JMETER_REPORT_DIR/index.html for details."
    fi
else
    echo "❌ CRITICAL FAILURE: JMeter process crashed or failed to complete."
    exit 1
fi