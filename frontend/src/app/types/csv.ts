// CSV Import types and interfaces

export interface CSVRow {
  Date: string;
  Dish_Name: string;
  Quantity_Sold: string;
}

export interface CSVValidationError {
  row: number;
  column: string;
  value: string;
  error: string;
  suggestion?: string;
}

export interface ValidatedCSVRow {
  date: string;
  dishName: string;
  recipeId?: string;
  quantity: number;
}

export interface CSVValidationResult {
  isValid: boolean;
  errors: CSVValidationError[];
  warnings: CSVValidationError[];
  validRows: ValidatedCSVRow[];
  totalRows: number;
}

export interface CSVImportSummary {
  imported: number;
  failed: number;
  warnings: number;
  errors: CSVValidationError[];
}
