#!/bin/bash

# --- Configuration (can be overridden by environment variables in CI) ---
DB_HOST="${DB_HOST:-oversea.zyh111.icu}"
DB_PORT="${DB_PORT:-33333}"
DB_USER="${DB_USER:-grp4}"
DB_NAME="${DB_NAME:-smartsuschef}"
JMETER_TEST_PLAN="${JMETER_TEST_PLAN:-testing/performance/jmx/Main_Scenario.jmx}"
JMETER_RESULTS_FILE="${JMETER_RESULTS_FILE:-testing/performance/results/Final_Run_UAT.jtl}"
JMETER_REPORT_DIR="${JMETER_REPORT_DIR:-testing/performance/reports/Final_Run_Report}"

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
rm -rf "$JMETER_REPORT_DIR" "$JMETER_RESULTS_FILE"
mkdir -p "$JMETER_REPORT_DIR"
mkdir -p "$(dirname "$JMETER_RESULTS_FILE")"

# --- Step 2: Clear test ingredients from the database ---
echo "--- Clearing test ingredients and recipes from the database ---"
# Using a temporary file for password to avoid exposure in process list
PASSWORD_FILE=$(mktemp)
echo "$DB_PASSWORD" > "$PASSWORD_FILE"
chmod 600 "$PASSWORD_FILE"

# Clear WastageData
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM WastageData WHERE IngredientId IN (SELECT Id FROM Ingredients WHERE Name LIKE 'Test Ingredient %');"; then
    echo "Successfully cleared related WastageData."
else
    echo "Warning: Failed to clear related WastageData. Continuing. Check credentials or connection."
fi

# Clear Recipes
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM Recipes WHERE Name LIKE 'Test Recipe %';"; then
    echo "Successfully deleted test recipes."
else
    echo "Warning: Failed to delete test recipes from the database. Continuing. Check credentials or connection."
fi

# Clear Ingredients
if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" --password="$DB_PASSWORD" "$DB_NAME" -e "DELETE FROM Ingredients WHERE Name LIKE 'Test Ingredient %';"; then
    echo "Successfully deleted test ingredients."
else
    echo "Error: Failed to delete test ingredients from the database. Check credentials or connection."
    rm "$PASSWORD_FILE"
    exit 1
fi

rm "$PASSWORD_FILE" # Clean up temporary password file

# --- Step 3: Execute JMeter performance audit ---
echo "--- Executing JMeter performance audit ---"
# Pass TARGET_URL and TARGET_PORT from environment, with fallbacks
jmeter -n -t "$JMETER_TEST_PLAN" \
       -l "$JMETER_RESULTS_FILE" \
       -e -o "$JMETER_REPORT_DIR" \
       -Jtarget_url=${TARGET_URL:-localhost} \
       -Jtarget_port=${TARGET_PORT:-5001} \
       -f

JMETER_EXIT_CODE=$?

if [ "$JMETER_EXIT_CODE" -eq 0 ]; then
    echo "--- JMeter test completed successfully ---"
    echo "HTML Report available at: $JMETER_REPORT_DIR/index.html"
else
    echo "--- JMeter process crashed or failed to complete ---"
fi

echo "--- Script finished ---"

# --- Step 4: Final Validation ---
if [ "$JMETER_EXIT_CODE" -eq 0 ]; then
    # Check if the error rate is actually 0.00%
    ERROR_COUNT=$(grep -c ",false," "$JMETER_RESULTS_FILE" 2>/dev/null)
    if [ -z "$ERROR_COUNT" ]; then
        ERROR_COUNT=0
    fi
    
    if [ "$ERROR_COUNT" -eq 0 ]; then
        echo "✅ PERFECT RUN: 0% Error Rate detected."
    else
        echo "⚠️  STABILITY ALERT: Test finished, but $ERROR_COUNT samples failed."
        echo "Check $JMETER_REPORT_DIR/index.html for details."
        exit 1 # Fail the script if there are errors
    fi
else
    echo "❌ CRITICAL FAILURE: JMeter process had a non-zero exit code."
    exit 1
fi