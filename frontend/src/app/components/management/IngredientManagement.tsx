/**
 * IngredientManagement Component
 * ---------------------------------------------
 * Main Features:
 *   - Display, add, edit, and delete store-specific ingredients (Ingredients)
 *   - Integrates with GlobalIngredients: 20 standard ingredients selectable from dropdown, unit/carbonFootprint auto-filled and read-only
 *   - Supports "Others" for custom ingredients with all fields editable
 *   - User-friendly interactions: form validation, delete confirmation, prevent deletion if referenced by recipes
 *   - All data operations are managed via AppContext methods (addIngredient, updateIngredient, etc.)
 *
 * Design Overview:
 *   1. Global ingredients are loaded dynamically from API and stored in globalIngredients state
 *   2. In the add/edit dialog, ingredient name dropdown lists global ingredients, with "Others" as the last option
 *   3. When a global ingredient is selected, unit/carbonFootprint are auto-filled and disabled to prevent editing
 *   4. When "Others" is selected, all fields are editable for custom input
 *   5. On save, if a global ingredient is chosen, globalIngredientId is submitted and backend stores the reference
 *   6. Delete operations include confirmation; if the ingredient is referenced by recipes/wastage data, deletion is blocked or cascaded
 *
 * Key State Variables:
 *   - globalIngredients: List of global ingredients (from API)
 *   - selectedGlobalIngredientId: Currently selected global ingredient ID (or null)
 *   - selectedName/otherName: Dropdown selection/custom ingredient name
 *   - unit/carbonFootprint: Unit/carbon, auto-filled for global ingredients
 *   - isDialogOpen/isDeleteDialogOpen/etc.: Dialog controls
 *
 * Interaction Highlights:
 *   - Friendly form validation and clear error messages
 *   - Seamless switching between global and custom ingredients
 *   - Deletion checks for references to prevent accidental data loss
 *
 * Maintenance Tips:
 *   - If the GlobalIngredients table structure/fields change, update dropdown rendering and field mapping accordingly
 *   - If IngredientDto structure changes, update form data assembly and context method parameters
 *   - If API endpoints change, update fetch logic
 *
 * @author Copilot
 * @lastUpdate 2026-02-09
 */
import React, { useState, useEffect } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, Edit, Trash2, Package, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Ingredient, GlobalIngredient } from '@/app/types';
import { globalIngredientsApi, type GlobalIngredientDto } from '@/app/services/api';

interface IngredientManagementProps {
  onNavigateToRecipes?: () => void;
}

export function IngredientManagement({ onNavigateToRecipes }: IngredientManagementProps = {}) {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, wastageData, recipes } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [selectedName, setSelectedName] = useState('');
  const [otherName, setOtherName] = useState('');
  const [unit, setUnit] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalIngredients, setGlobalIngredients] = useState<GlobalIngredient[]>([]);
  const [selectedGlobalIngredientId, setSelectedGlobalIngredientId] = useState<string | null>(null);
  const [isLoadingGlobalIngredients, setIsLoadingGlobalIngredients] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIngredient, setDeletingIngredient] = useState<{ id: string; name: string; wastageCount: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecipeUsageDialogOpen, setIsRecipeUsageDialogOpen] = useState(false);
  const [ingredientInUse, setIngredientInUse] = useState<{ id: string; name: string; usedInRecipes: string[] } | null>(null);

  // Load global ingredients from API
  useEffect(() => {
    const loadGlobalIngredients = async () => {
      setIsLoadingGlobalIngredients(true);
      try {
        const data = await globalIngredientsApi.getAll();
        setGlobalIngredients(data as unknown as GlobalIngredient[]);
      } catch (error) {
        console.error('Error loading global ingredients:', error);
        toast.error('Failed to load global ingredients. Please try again later.');
      } finally {
        setIsLoadingGlobalIngredients(false);
      }
    };

    loadGlobalIngredients();
  }, []);

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      // Check if ingredient is a global ingredient
      if (ingredient.globalIngredientId) {
        const globalIng = globalIngredients.find(g => g.id === ingredient.globalIngredientId);
        if (globalIng) {
          setSelectedName(globalIng.id);
          setSelectedGlobalIngredientId(globalIng.id);
          setUnit(globalIng.unit);
          setCarbonFootprint(globalIng.carbonFootprint.toString());
          setOtherName('');
        }
      } else {
        // Custom ingredient
        setSelectedName('others');
        setSelectedGlobalIngredientId(null);
        setOtherName(ingredient.name);
        setUnit(ingredient.unit);
        setCarbonFootprint(ingredient.carbonFootprint.toString());
      }
    } else {
      setEditingIngredient(null);
      setSelectedName('');
      setSelectedGlobalIngredientId(null);
      setOtherName('');
      setUnit('');
      setCarbonFootprint('');
    }
    setIsDialogOpen(true);
  };

  const handleSelectGlobalIngredient = (globalIngId: string | null) => {
    if (globalIngId && globalIngId !== 'others') {
      const globalIng = globalIngredients.find(g => g.id === globalIngId);
      if (globalIng) {
        setSelectedName(globalIngId);
        setSelectedGlobalIngredientId(globalIngId);
        setUnit(globalIng.unit);
        setCarbonFootprint(globalIng.carbonFootprint.toString());
        setOtherName('');
      }
    } else {
      setSelectedName('others');
      setSelectedGlobalIngredientId(null);
      setOtherName('');
      setUnit('');
      setCarbonFootprint('');
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIngredient(null);
    setSelectedName('');
    setSelectedGlobalIngredientId(null);
    setOtherName('');
    setUnit('');
    setCarbonFootprint('');
  };

  const handleSubmit = async () => {
    // Determine final ingredient name based on selection
    // If "Others" is selected, use the custom input value; otherwise use the global ingredient name
    let finalName = '';
    if (selectedName === 'others') {
      finalName = otherName;
      if (!finalName || !finalName.trim()) {
        toast.error('Please enter a custom ingredient name');
        return;
      }
    } else if (selectedGlobalIngredientId) {
      const globalIng = globalIngredients.find(g => g.id === selectedGlobalIngredientId);
      if (globalIng) {
        finalName = globalIng.name;
      } else {
        toast.error('Selected ingredient not found');
        return;
      }
    } else {
      toast.error('Please select an ingredient');
      return;
    }

    if (!unit.trim() || !carbonFootprint) {
      toast.error('Please fill in all required fields');
      return;
    }

    const carbon = parseFloat(carbonFootprint);
    if (isNaN(carbon) || carbon < 0) {
      toast.error('Carbon footprint must be a positive number');
      return;
    }

    const ingredientData = {
      name: finalName.trim(),
      unit: unit.trim(),
      carbonFootprint: carbon,
      globalIngredientId: selectedGlobalIngredientId || undefined, // Include reference if selected
    };

    setIsSubmitting(true);
    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, ingredientData);
        toast.success('Ingredient updated successfully');
      } else {
        await addIngredient(ingredientData);
        toast.success('Ingredient added successfully');
      }
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save ingredient');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (id: string, name: string) => {
    // First check if ingredient is used in any recipes
    const recipesUsingIngredient = recipes.filter(recipe =>
      recipe.ingredients.some(ing => ing.ingredientId === id)
    );

    if (recipesUsingIngredient.length > 0) {
      // Show recipe usage dialog instead of delete dialog
      setIngredientInUse({
        id,
        name,
        usedInRecipes: recipesUsingIngredient.map(r => r.name)
      });
      setIsRecipeUsageDialogOpen(true);
      return;
    }

    // Check if ingredient exists in Wastage Data
    const wastageCount = wastageData.filter(waste => waste.ingredientId === id).length;

    setDeletingIngredient({ id, name, wastageCount });
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingIngredient) return;

    const { wastageCount } = deletingIngredient;
    const hasRelatedData = wastageCount > 0;

    // If no related data, just delete
    if (!hasRelatedData) {
      setIsDeleting(true);
      try {
        await deleteIngredient(deletingIngredient.id, false);
        toast.success('Ingredient deleted successfully');
        setIsDeleteDialogOpen(false);
        setDeletingIngredient(null);
      } catch (error) {
        toast.error('Failed to delete ingredient');
      } finally {
        setIsDeleting(false);
      }
      return;
    }

    // If related data exists, delete with cascade
    setIsDeleting(true);
    try {
      await deleteIngredient(deletingIngredient.id, true);
      toast.success(`Ingredient and ${wastageCount} related wastage record${wastageCount > 1 ? 's' : ''} deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDeletingIngredient(null);
    } catch (error) {
      toast.error('Failed to delete ingredient and related data');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2 text-[#1A1C18] md:text-3xl lg:text-3xl">
            <Package className="w-6 h-6 text-[#4F6F52]" />
            Ingredient Management
          </h1>
          <p className="text-gray-600 mt-1">Master ingredients list</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIngredient ? 'Edit Ingredient' : 'Add New Ingredient'}
              </DialogTitle>
              <DialogDescription>
                {editingIngredient ? 'Edit the details of the ingredient' : 'Add a new ingredient to the system'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ingredient-name">Ingredient Name</Label>
                <select
                  id="ingredient-name"
                  className="w-full border rounded-md p-2"
                  value={selectedName}
                  onChange={(e) => handleSelectGlobalIngredient(e.target.value || null)}
                  disabled={isLoadingGlobalIngredients}
                >
                  <option value="">-- Select ingredient --</option>
                  {/* Display global ingredients from API */}
                  {globalIngredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name}</option>
                  ))}
                  {/* "Others" option allows users to enter custom ingredients not in the standard list */}
                  <option value="others">Others (Enter custom ingredient)</option>
                </select>

                {/* Conditionally render custom input field when "Others" is selected */}
                {selectedName === 'others' && (
                  <Input
                    id="ingredient-name-other"
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    placeholder="Please specify Ingredient Name"
                  />
                )}
                {isLoadingGlobalIngredients && <p className="text-sm text-gray-500">Loading global ingredients...</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredient-unit">
                  Unit {selectedGlobalIngredientId && <span className="text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <select
                  id="ingredient-unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={selectedGlobalIngredientId !== null}
                  className={`w-full border rounded-md p-2 ${selectedGlobalIngredientId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">-- Select unit --</option>
                  <option value="g">g (gram)</option>
                  <option value="kg">kg (kilogram)</option>
                  <option value="ml">ml (milliliter)</option>
                  <option value="L">L (liter)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbon-footprint">
                  Carbon Footprint (kg CO₂ per unit) {selectedGlobalIngredientId && <span className="text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Input
                  id="carbon-footprint"
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbonFootprint}
                  onChange={(e) => setCarbonFootprint(e.target.value)}
                  placeholder="e.g., 6.9"
                  disabled={selectedGlobalIngredientId !== null}
                  className={selectedGlobalIngredientId ? 'bg-gray-100 cursor-not-allowed' : ''}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting}>
                  {editingIngredient ? 'Update Ingredient' : 'Add Ingredient'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Ingredients</CardTitle>
          <CardDescription>
            {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''} in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Carbon Footprint (kg CO₂)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((ingredient) => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell>{ingredient.carbonFootprint.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(ingredient)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteDialog(ingredient.id, ingredient.name)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              {deletingIngredient && (
                <>
                  {deletingIngredient.wastageCount > 0 ? (
                    <>
                      <p className="text-gray-700">
                        This ingredient has related wastage data records. Deleting it will also remove:
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                        <div className="font-medium text-amber-900">{deletingIngredient.name}</div>
                        <div className="space-y-1 text-sm">
                          <div className="text-gray-700">
                            • <span className="font-semibold text-amber-700">{deletingIngredient.wastageCount}</span> Wastage Data record{deletingIngredient.wastageCount > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-red-600 font-medium">
                        ⚠️ Warning: This will permanently delete the ingredient and all {deletingIngredient.wastageCount} related wastage record{deletingIngredient.wastageCount > 1 ? 's' : ''}. This action cannot be undone.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-700">
                        Are you sure you want to delete this ingredient?
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="text-sm">
                          <div className="text-gray-600">Ingredient Name:</div>
                          <div className="font-medium text-gray-900 mt-1">
                            {deletingIngredient.name}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-red-600 font-medium">
                        Warning: This action cannot be undone.
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
                className="rounded-[32px] px-6 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 rounded-[32px] px-6"
              >
                Yes, Delete Ingredient
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Usage Warning Dialog */}
      <Dialog open={isRecipeUsageDialogOpen} onOpenChange={setIsRecipeUsageDialogOpen}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Cannot Delete Ingredient
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {ingredientInUse && (
              <>
                <p className="text-gray-700">
                  This ingredient <span className="font-semibold">{ingredientInUse.name}</span> is currently used in the following recipe{ingredientInUse.usedInRecipes.length > 1 ? 's' : ''}:
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <ul className="space-y-2">
                    {ingredientInUse.usedInRecipes.map((recipeName, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span className="text-gray-900 font-medium">{recipeName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> You need to remove this ingredient from {ingredientInUse.usedInRecipes.length > 1 ? 'these recipes' : 'this recipe'} before you can delete it.
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsRecipeUsageDialogOpen(false);
                  setIngredientInUse(null);
                }}
                className="rounded-[32px] px-6 hover:bg-gray-100"
              >
                Cancel
              </Button>
              {onNavigateToRecipes && (
                <Button
                  onClick={() => {
                    setIsRecipeUsageDialogOpen(false);
                    setIngredientInUse(null);
                    onNavigateToRecipes();
                  }}
                  className="bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] px-6 gap-2"
                >
                  Go to Recipe Management
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}