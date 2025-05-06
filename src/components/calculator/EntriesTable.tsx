"use client";

import React, { Dispatch, SetStateAction, useState } from 'react';
import { format, getMonth, getYear, setMonth, setYear } from "date-fns";
import { ru } from "date-fns/locale";
import { Trash2, CalendarRange, CalendarDays, Calendar as CalendarIcon, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Define the type for a single entry (matching page.tsx)
type LessonEntry = {
  id: string;
  date: string;
  regularLessons: number;
  masterClasses: number;
  earnings: number;
};

interface EntriesTableProps {
  entries: LessonEntry[];
  isLoading: boolean;
  activeTab: "all" | "thisMonth" | "customMonth";
  setActiveTab: Dispatch<SetStateAction<"all" | "thisMonth" | "customMonth">>;
  deleteEntry: (id: string) => void;
  selectedMonth: Date;
  setSelectedMonth: Dispatch<SetStateAction<Date>>;
  editEntry?: (entry: LessonEntry) => void;
}

export default function EntriesTable({
  entries,
  isLoading,
  activeTab,
  setActiveTab,
  deleteEntry,
  selectedMonth,
  setSelectedMonth,
  editEntry,
}: EntriesTableProps) {

  const getEntriesCountText = (count: number): string => {
    if (count === 1) return 'запись';
    if (count >= 2 && count <= 4) return 'записи';
    return 'записей';
  };

  return (
    <Card>
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex-shrink-0">
            <CardTitle className="text-lg font-semibold text-primary">История занятий</CardTitle>
            <CardDescription className="text-sm">
              {entries.length} {getEntriesCountText(entries.length)}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={activeTab === "thisMonth" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-9 px-3 transition-all",
                activeTab === "thisMonth" ? "text-black" : "text-black dark:text-white"
              )}
              onClick={() => setActiveTab("thisMonth")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Этот месяц
              {activeTab === "thisMonth" && entries.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full bg-black/20 hover:bg-white/20 text-black">
                  {entries.length}
                </Badge>
              )}
            </Button>
            

            <Button 
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-9 px-3 transition-all",
                activeTab === "all" ? "text-black" : "text-black dark:text-white"
              )}
              onClick={() => setActiveTab("all")}
            >
              <CalendarRange className="mr-2 h-4 w-4" />
              Все
              {activeTab === "all" && entries.length > 0 && (
                <Badge variant="secondary" className="ml-2 rounded-full bg-black/20 hover:bg-white/20 text-black">
                  {entries.length}
                </Badge>
              )}
            </Button>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant={activeTab === "customMonth" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-9 px-3 transition-all",
                    activeTab === "customMonth" ? "text-black" : "text-black dark:text-white"
                  )}
                  onClick={() => setActiveTab("customMonth")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {activeTab === "customMonth" 
                    ? format(selectedMonth, "LLLL yyyy", { locale: ru }) 
                    : "Выбрать месяц"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date: Date | undefined) => {
                    if (date) {
                      setSelectedMonth(date);
                      setActiveTab("customMonth");
                    }
                  }}
                  initialFocus
                  locale={ru}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border-b border-border/50">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-3/4 text-xs" />
                </div>
                <Skeleton className="h-5 w-16 hidden md:block" />
                <Skeleton className="h-5 w-16 hidden md:block" />
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-8 w-8" />
              </div>
            ))}
          </div>
        ) : entries.length > 0 ? (
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 rounded-none hover:bg-muted/50 text-black dark:text-white">
                  <TableHead className="py-2 px-4">Дата</TableHead>
                  <TableHead className="hidden md:table-cell rounded-none py-2 px-4">Обычные</TableHead>
                  <TableHead className="hidden md:table-cell py-2 px-4">Мастер-кл.</TableHead>
                  <TableHead className="py-2 px-4">Заработок</TableHead>
                  <TableHead className="text-right py-2 px-4 w-[120px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="py-2 px-4">
                      <div className="font-medium">{format(new Date(entry.date), "dd MMM yyyy", { locale: ru })}</div>
                      <div className="md:hidden text-xs text-black/70 dark:text-white/70">
                        <span>Об: {entry.regularLessons} | МК: {entry.masterClasses}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4">{entry.regularLessons}</TableCell>
                    <TableCell className="hidden md:table-cell py-2 px-4">{entry.masterClasses}</TableCell>
                    <TableCell className="font-medium py-2 px-4">{entry.earnings} €</TableCell>
                    <TableCell className="text-right py-2 px-4">
                      <div className="flex justify-end gap-1">
                        {editEntry && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editEntry(entry)}
                            className="h-8 w-8"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                            <span className="sr-only">Редактировать</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteEntry(entry.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Table className="h-10 w-10 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">Нет записей за выбранный период</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
