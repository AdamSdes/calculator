"use client";

import React from 'react';
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; 
import { cn } from "@/lib/utils";

interface EntryFormProps {
  date: Date;
  setDate: (date: Date) => void;
  regularLessons: number;
  setRegularLessons: (value: number) => void;
  masterClasses: number;
  setMasterClasses: (value: number) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
  regularLessonPrice: number;
  masterClassPrice: number;
}

export default function EntryForm({
  date,
  setDate,
  regularLessons,
  setRegularLessons,
  masterClasses,
  setMasterClasses,
  handleSubmit,
  isSubmitting,
  regularLessonPrice,
  masterClassPrice,
}: EntryFormProps) {
  return (
    <Card className="shadow-md border-primary/10 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-3 pt-5 border-b border-border/40"> 
        <CardTitle className="text-lg font-medium flex items-center text-primary"> 
          Добавить запись
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-5 pb-5"> 
        <form onSubmit={handleSubmit} className="space-y-5"> 
          <div className="space-y-4">
            <div className="space-y-2"> 
              <Label htmlFor="date" className="text-sm font-medium">Дата</Label> 
              <Popover>
                <PopoverTrigger asChild>
                  <Button
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
                <Label htmlFor="regularLessons" className="text-sm font-medium">Обычные уроки <span className="text-primary">({regularLessonPrice}€)</span></Label> 
                <Input
                  id="regularLessons"
                  type="number"
                  value={regularLessons}
                  onChange={(e) => setRegularLessons(parseInt(e.target.value) || 0)}
                  min="0"
                  className="h-11"
                />
              </div>
              <div className="space-y-2"> 
                <Label htmlFor="masterClasses" className="text-sm font-medium">Мастер-классы <span className="text-primary">({masterClassPrice}€)</span></Label> 
                <Input
                  id="masterClasses"
                  type="number"
                  value={masterClasses}
                  onChange={(e) => setMasterClasses(parseInt(e.target.value) || 0)}
                  min="0"
                  className="h-11"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full h-11 text-base" 
              disabled={isSubmitting}
            > 
              {isSubmitting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
              ) : (
                <PlusCircle className="mr-2 h-5 w-5" /> 
              )}
              {isSubmitting ? "Добавление..." : "Добавить"} 
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
