/**
 * IngredientManagement Component
 * ---------------------------------------------
 * Main Features:
 *   - Display, add, edit, and delete store-specific ingredients (Ingredients)
 *   - Simple input-based creation and editing of ingredients (name, unit, carbonFootprint)
 *   - User-friendly interactions: form validation, delete confirmation, prevent deletion if referenced by recipes
 *   - All data operations are managed via AppContext methods (addIngredient, updateIngredient, etc.)
 *
 * Design Overview:
 *   1. Ingredient name, unit, and carbon footprint are entered directly
 *   2. Delete operations include confirmation; if the ingredient is referenced by recipes/wastage data, deletion is blocked or cascaded
 *
 * Key State Variables:
 *   - name: Ingredient name input
 *   - unit/carbonFootprint: Unit/carbon, auto-filled for global ingredients
 *   - isDialogOpen/isDeleteDialogOpen/etc.: Dialog controls
 *
 * Interaction Highlights:
 *   - Friendly form validation and clear error messages
 *   - Deletion checks for references to prevent accidental data loss
 *
 * Maintenance Tips:
 *   - If IngredientDto structure changes, update form data assembly and context method parameters
 *   - If API endpoints change, update fetch logic
 *
 * @author Copilot
 * @lastUpdate 2026-02-09
 */
import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/app/components/ui/dialog';
import { Plus, Edit, Trash2, Package, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Ingredient } from '@/app/types';

interface IngredientManagementProps {
  onNavigateToRecipes?: () => void;
}

export function IngredientManagement({ onNavigateToRecipes }: IngredientManagementProps = {}) {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, wastageData, recipes } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [carbonFootprint, setCarbonFootprint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIngredient, setDeletingIngredient] = useState<{ id: string; name: string; wastageCount: number } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRecipeUsageDialogOpen, setIsRecipeUsageDialogOpen] = useState(false);
  const [ingredientInUse, setIngredientInUse] = useState<{ id: string; name: string; usedInRecipes: string[] } | null>(null);
  const [isUnitChangeDialogOpen, setIsUnitChangeDialogOpen] = useState(false);
  const [unitChangeIngredientUsage, setUnitChangeIngredientUsage] = useState<{ id: string; name: string; usedInRecipes: string[] } | null>(null);
  const [pendingUnit, setPendingUnit] = useState('');
  const [baselineUnit, setBaselineUnit] = useState('');

  const handleOpenDialog = (ingredient?: Ingredient) => {
    if (ingredient) {
      setEditingIngredient(ingredient);
      setBaselineUnit(ingredient.unit);
      setName(ingredient.name);
      setUnit(ingredient.unit);
      setCarbonFootprint(ingredient.carbonFootprint.toString());
    } else {
      setEditingIngredient(null);
      setName('');
      setUnit('');
      setCarbonFootprint('');
      setBaselineUnit('');
    }
    setPendingUnit('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIngredient(null);
    setName('');
    setUnit('');
    setCarbonFootprint('');
    setBaselineUnit('');
    setPendingUnit('');
    setIsUnitChangeDialogOpen(false);
    setUnitChangeIngredientUsage(null);
  };

  const handleUnitChange = (nextUnit: string) => {
    if (!editingIngredient) {
      setUnit(nextUnit);
      if (!editingIngredient) {
        setBaselineUnit(nextUnit);
      }
      return;
    }

    if (nextUnit === baselineUnit) {
      setUnit(nextUnit);
      return;
    }

    const recipesUsingIngredient = recipes.filter(recipe =>
      recipe.ingredients.some(ing => ing.ingredientId === editingIngredient.id)
    );

    if (recipesUsingIngredient.length === 0) {
      setUnit(nextUnit);
      setBaselineUnit(nextUnit);
      return;
    }

    setPendingUnit(nextUnit);
    setUnitChangeIngredientUsage({
      id: editingIngredient.id,
      name: editingIngredient.name,
      usedInRecipes: recipesUsingIngredient.map(r => r.name)
    });
    setIsUnitChangeDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!name || !name.trim()) {
      toast.error('Please enter an ingredient name');
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
      name: name.trim(),
      unit: unit.trim(),
      carbonFootprint: carbon,
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
                <Input
                  id="ingredient-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Chicken, Rice, Tomato"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ingredient-unit">Unit</Label>
                <select
                  id="ingredient-unit"
                  value={unit}
                  onChange={(e) => handleUnitChange(e.target.value)}
                  className="w-full border rounded-md p-2"
                >
                  <option value="">-- Select unit --</option>
                  <option value="g">g (gram)</option>
                  <option value="kg">kg (kilogram)</option>
                  <option value="ml">ml (milliliter)</option>
                  <option value="L">L (liter)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="carbon-footprint">Carbon Footprint (kg CO₂ per unit)</Label>
                <Input
                  id="carbon-footprint"
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbonFootprint}
                  onChange={(e) => setCarbonFootprint(e.target.value)}
                  placeholder="e.g., 6.9"
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

      {/* Unit Change Warning Dialog */}
      <Dialog open={isUnitChangeDialogOpen} onOpenChange={setIsUnitChangeDialogOpen}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
              Unit Change Warning
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {unitChangeIngredientUsage && (
              <>
                <p className="text-gray-700">
                  This ingredient <span className="font-semibold">{unitChangeIngredientUsage.name}</span> is currently used in the following recipe{unitChangeIngredientUsage.usedInRecipes.length > 1 ? 's' : ''}:
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  <ul className="space-y-2">
                    {unitChangeIngredientUsage.usedInRecipes.map((recipeName, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span className="text-gray-900 font-medium">{recipeName}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> If you change the unit, please also update the carbon footprint to keep data consistent.
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsUnitChangeDialogOpen(false);
                  setUnitChangeIngredientUsage(null);
                  setPendingUnit('');
                  handleCloseDialog();
                }}
                className="rounded-[32px] px-6 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsUnitChangeDialogOpen(false);
                  setUnitChangeIngredientUsage(null);
                  if (pendingUnit) {
                    setUnit(pendingUnit);
                    setBaselineUnit(pendingUnit);
                  }
                  setPendingUnit('');
                }}
                className="bg-[#4F6F52] hover:bg-[#3D563F] text-white rounded-[32px] px-6"
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}