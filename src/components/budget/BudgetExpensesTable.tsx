import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { BudgetExpenseDialog } from "./BudgetExpenseDialog";
import { useDeleteBudgetExpense } from "@/hooks/useBudgetExpenses";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BudgetExpensesTableProps {
  budgetPeriodId: string;
  data: any[];
}

const categoryLabels: Record<string, string> = {
  operational: "Operacional",
  investment: "Inversión",
  other: "Otro",
};

export function BudgetExpensesTable({ budgetPeriodId, data }: BudgetExpensesTableProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const deleteExpense = useDeleteBudgetExpense();

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense.mutate(id);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir Gasto
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoría</TableHead>
              <TableHead>Subcategoría</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Presupuestado</TableHead>
              <TableHead className="text-right">Real</TableHead>
              <TableHead className="text-right">Desviación</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay gastos registrados
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => {
                const variance = (item.actual_amount || 0) - item.budgeted_amount;
                return (
                  <TableRow key={item.id}>
                    <TableCell>{categoryLabels[item.category] || item.category}</TableCell>
                    <TableCell>{item.subcategory || "-"}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.budgeted_amount)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.actual_amount || 0)}</TableCell>
                    <TableCell className={`text-right font-medium ${variance <= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatCurrency(variance)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar gasto?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <BudgetExpenseDialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        budgetPeriodId={budgetPeriodId}
        editingItem={editingItem}
      />
    </div>
  );
}
