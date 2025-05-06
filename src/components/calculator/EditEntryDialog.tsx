"use client";

import React, { useState, useEffect } from 'react';
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Тип записи, соответствующий типу в page.tsx
type LessonEntry = {
  id: string;
  date: string;
  regularLessons: number;
  masterClasses: number;
  earnings: number;
};

interface EditEntryDialogProps {
  entry: LessonEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedEntry: LessonEntry) => void;
  regularLessonPrice: number;
  masterClassPrice: number;
}

export default function EditEntryDialog({
  entry,
  isOpen,
  onClose,
  onSave,
  regularLessonPrice,
  masterClassPrice,
}: EditEntryDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [regularLessons, setRegularLessons] = useState<number>(0);
  const [masterClasses, setMasterClasses] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Инициализация формы при открытии диалога
  useEffect(() => {
    if (entry && isOpen) {
      setDate(new Date(entry.date));
      setRegularLessons(entry.regularLessons);
      setMasterClasses(entry.masterClasses);
    }
  }, [entry, isOpen]);

  // Расчет заработка на основе текущих данных
  const calculateEarnings = (): number => {
    return (regularLessons * regularLessonPrice) + (masterClasses * masterClassPrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedEntry: LessonEntry = {
        ...entry,
        date: format(date, "yyyy-MM-dd"),
        regularLessons,
        masterClasses,
        earnings: calculateEarnings()
      };
      
      onSave(updatedEntry);
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Редактировать запись</DialogTitle>
          <DialogDescription>
            Измените данные записи и нажмите "Сохранить" для применения изменений.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date" className="text-sm font-medium">Дата</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-11",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    {date ? format(date, "PPP", { locale: ru }) : <span>Выберите дату</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(day) => setDate(day || new Date())}
                    initialFocus
                    locale={ru}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-regularLessons" className="text-sm font-medium">Обычные уроки <span className="text-primary">({regularLessonPrice}€)</span></Label>
                <Input
                  id="edit-regularLessons"
                  type="number"
                  value={regularLessons}
                  onChange={(e) => setRegularLessons(parseInt(e.target.value) || 0)}
                  min="0"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-masterClasses" className="text-sm font-medium">Мастер-классы <span className="text-primary">({masterClassPrice}€)</span></Label>
                <Input
                  id="edit-masterClasses"
                  type="number"
                  value={masterClasses}
                  onChange={(e) => setMasterClasses(parseInt(e.target.value) || 0)}
                  min="0"
                  className="h-11"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Итоговый заработок</Label>
              <div className="text-lg font-bold text-primary">{calculateEarnings()} €</div>
            </div>
          </div>
          
          <DialogFooter className="pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Save className="mr-2 h-5 w-5" />
              )}
              {isSubmitting ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
