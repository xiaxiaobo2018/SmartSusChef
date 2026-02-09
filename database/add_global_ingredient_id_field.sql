-- Add GlobalIngredientId column to Ingredients table
-- This allows store ingredients to reference global ingredients

USE smartsuschef;

-- Add the GlobalIngredientId column as a nullable CHAR(36) for GUID
ALTER TABLE Ingredients 
ADD COLUMN GlobalIngredientId CHAR(36) NULL;

-- Create the foreign key constraint to GlobalIngredients table
ALTER TABLE Ingredients 
ADD CONSTRAINT FK_Ingredients_GlobalIngredients 
FOREIGN KEY (GlobalIngredientId) REFERENCES GlobalIngredients(Id)
ON DELETE SET NULL;

-- Create an index on GlobalIngredientId for better query performance
CREATE INDEX IX_Ingredients_GlobalIngredientId 
ON Ingredients(GlobalIngredientId);

-- Verification: Check the updated schema
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_KEY
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Ingredients' 
ORDER BY ORDINAL_POSITION;
