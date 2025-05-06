"use client";

import React, { useState, useEffect } from 'react';
import { Settings2, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SettingsDialogProps {
  currentGoal: number;
  currentRegularPrice: number;
  currentMasterPrice: number;
  onSave: (newGoal: number, newRegularPrice: number, newMasterPrice: number) => void;
}

export default function SettingsDialog({
  currentGoal,
  currentRegularPrice,
  currentMasterPrice,
  onSave,
}: SettingsDialogProps) {

  const [editableGoal, setEditableGoal] = useState(currentGoal);
  const [editableRegularPrice, setEditableRegularPrice] = useState(currentRegularPrice);
  const [editableMasterPrice, setEditableMasterPrice] = useState(currentMasterPrice);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isDialogOpen) {
      setEditableGoal(currentGoal);
      setEditableRegularPrice(currentRegularPrice);
      setEditableMasterPrice(currentMasterPrice);
    }
  }, [currentGoal, currentRegularPrice, currentMasterPrice, isDialogOpen]);

  const handleSave = () => {
    onSave(editableGoal, editableRegularPrice, editableMasterPrice);
    setIsDialogOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      // setEditableGoal(currentGoal);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Settings2 className="mr-2 h-4 w-4" /> Настройки
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройки</DialogTitle>
          <DialogDescription>
            Установите месячную цель и настройте отображение.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="monthlyGoal" className="text-right col-span-1">
              Цель (€)
            </Label>
            <Input
              id="monthlyGoal"
              type="number"
              value={editableGoal}
              onChange={(e) => setEditableGoal(parseInt(e.target.value) || 0)}
              className="col-span-3"
              min="0"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="regularPrice" className="text-right col-span-1">
              Цена обычного урока (€)
            </Label>
            <Input
              id="regularPrice"
              type="number"
              value={editableRegularPrice}
              onChange={(e) => setEditableRegularPrice(parseInt(e.target.value) || 0)}
              className="col-span-3"
              min="0"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="masterPrice" className="text-right col-span-1">
              Цена мастер-класса (€)
            </Label>
            <Input
              id="masterPrice"
              type="number"
              value={editableMasterPrice}
              onChange={(e) => setEditableMasterPrice(parseInt(e.target.value) || 0)}
              className="col-span-3"
              min="0"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleSave}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
