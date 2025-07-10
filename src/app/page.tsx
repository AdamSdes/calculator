"use client";

import { useState, useEffect, useMemo, FormEvent } from "react";
import { toast } from "sonner";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths, subQuarters, startOfQuarter, endOfQuarter } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarIcon, PlusCircle, Trash2, Download, Upload, Target, Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Import new components
import EntryForm from "@/components/calculator/EntryForm";
import EntriesTable from "@/components/calculator/EntriesTable";
import StatsDisplay from "@/components/calculator/StatsDisplay";
import SettingsDialog from "@/components/calculator/SettingsDialog";
import DataActions from "@/components/calculator/DataActions";
import EditEntryDialog from "@/components/calculator/EditEntryDialog";
import CompanySettings, { CompanyInfo, defaultCompanyInfo } from "@/components/calculator/CompanySettings";
import InvoiceGenerator from "@/components/calculator/InvoiceGenerator";

// Define types for our data
type LessonEntry = {
  id: string;
  date: string;
  regularLessons: number;
  masterClasses: number;
  earnings: number;
};

export default function Home() {
  // State for form inputs
  const [date, setDate] = useState<Date>(new Date());
  const [regularLessons, setRegularLessons] = useState<number>(0);
  const [masterClasses, setMasterClasses] = useState<number>(0);
  
  // State for entries and filter
  const [entries, setEntries] = useState<LessonEntry[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "thisMonth" | "customMonth">("thisMonth");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  // Using sonner toast instead of status state
  // Используем простую инициализацию для серверного рендеринга
  const [monthlyGoal, setMonthlyGoal] = useState<number>(1000);
  const [regularLessonPrice, setRegularLessonPrice] = useState<number>(8);
  const [masterClassPrice, setMasterClassPrice] = useState<number>(10);
  
  // Состояние для редактирования записей
  const [editingEntry, setEditingEntry] = useState<LessonEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  
  // Состояние для данных компании и фактур
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(defaultCompanyInfo);
  const [isCompanySettingsOpen, setIsCompanySettingsOpen] = useState<boolean>(false);
  
  // Загружаем значения из localStorage только на клиенте с помощью useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedGoal = localStorage.getItem("monthlyGoal");
      const savedRegularPrice = localStorage.getItem("regularLessonPrice");
      const savedMasterPrice = localStorage.getItem("masterClassPrice");
      const savedCompanyInfo = localStorage.getItem("companyInfo");
      
      if (savedGoal) setMonthlyGoal(parseInt(savedGoal, 10));
      if (savedRegularPrice) setRegularLessonPrice(parseInt(savedRegularPrice, 10));
      if (savedMasterPrice) setMasterClassPrice(parseInt(savedMasterPrice, 10));
      if (savedCompanyInfo) setCompanyInfo(JSON.parse(savedCompanyInfo));
    }
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImporting, setIsImporting] = useState(false); // Add import loading state
  const [isExporting, setIsExporting] = useState(false); // Add export loading state

  // Using state for pricing instead of constants

  // Load entries from JSON file via API on component mount
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/entries');
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }
        const data = await response.json();
        setEntries(data);
      } catch (error) {
        console.error('Error fetching entries:', error);
        // Fallback to localStorage if API fails
        const savedEntries = localStorage.getItem("lessonEntries");
        if (savedEntries) {
          setEntries(JSON.parse(savedEntries));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Save entries to JSON file via API whenever they change
  useEffect(() => {
    // Skip saving on initial load
    if (isLoading) return;
    
    const saveEntries = async () => {
      try {
        // Add API call for persistence if available
        const response = await fetch('/api/entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entries),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Also save to localStorage as backup
        localStorage.setItem("lessonEntries", JSON.stringify(entries));
        toast.success("Данные успешно сохранены");
      } catch (error) {
        console.error('Error saving entries:', error);
        toast.error("Ошибка при сохранении данных");
      }
    };

    saveEntries();
  }, [entries, isLoading]);

  // Load settings from localStorage
  useEffect(() => {
    const savedGoal = localStorage.getItem("monthlyGoal");
    if (savedGoal) {
      setMonthlyGoal(parseInt(savedGoal, 10));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("monthlyGoal", monthlyGoal.toString());
      localStorage.setItem("regularLessonPrice", regularLessonPrice.toString());
      localStorage.setItem("masterClassPrice", masterClassPrice.toString());
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo));
    }
    toast.success("Настройки сохранены");
  };

  // Save company info
  const handleSaveCompanyInfo = (newInfo: CompanyInfo) => {
    setCompanyInfo(newInfo);
    if (typeof window !== 'undefined') {
      localStorage.setItem("companyInfo", JSON.stringify(newInfo));
    }
  };

  // Handle invoice generation
  const handleInvoiceGenerated = (invoiceNumber: number) => {
    const updatedInfo = { ...companyInfo, lastInvoiceNumber: invoiceNumber };
    setCompanyInfo(updatedInfo);
    if (typeof window !== 'undefined') {
      localStorage.setItem("companyInfo", JSON.stringify(updatedInfo));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate earnings using current prices from state
      const earnings = (regularLessons * regularLessonPrice) + (masterClasses * masterClassPrice);

      // Create new entry
      const newEntry: LessonEntry = {
        id: Date.now().toString(),
        date: format(date, "yyyy-MM-dd"),
        regularLessons,
        masterClasses,
        earnings
      };
    
      // Add to entries
      setEntries(prev => [...prev, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      // Save to localStorage as backup
      localStorage.setItem("lessonEntries", JSON.stringify([...entries, newEntry]));
      
      toast.success("Запись успешно добавлена");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter entries based on selected date range or tab
  const filteredEntries = useMemo(() => {
    if (activeTab === "thisMonth") {
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
    } else if (activeTab === "customMonth") {
      // Filter by selected month
      const start = startOfMonth(selectedMonth);
      const end = endOfMonth(selectedMonth);
      return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });
    } else {
      // All entries or custom date range
      if (startDate && endDate) {
        return entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= startDate && entryDate <= endDate;
        });
      }
      return entries;
    }
  }, [entries, activeTab, startDate, endDate, selectedMonth]);

  // Prepare data for visualization (Example: last 6 months)
  const prepareChartData = (periodType: "week" | "month" | "quarter" = "month") => {
    const now = new Date();
    const data = [];

    if (periodType === "week") {
      for (let i = 0; i < 6; i++) {
        const start = subWeeks(now, i);
        const end = subWeeks(now, i + 1);
        data.push({
          label: format(start, "dd.MM", { locale: ru }),
          start,
          end,
        });
      }
    } else if (periodType === "month") {
      for (let i = 0; i < 6; i++) {
        const start = subMonths(now, i);
        const end = subMonths(now, i + 1);
        data.push({
          label: format(start, "MMMM", { locale: ru }),
          start,
          end,
        });
      }
    } else if (periodType === "quarter") {
      for (let i = 0; i < 4; i++) {
        const start = startOfQuarter(subQuarters(now, i));
        const end = endOfQuarter(subQuarters(now, i));
        data.push({
          label: format(start, "MMMM", { locale: ru }),
          start,
          end,
        });
      }
    }

    return data.reverse();
  };

  // Calculate earnings for a specific period
  const calculateEarningsForPeriod = (start: Date, end: Date): number => {
    return entries.reduce((sum, entry) => {
      const entryDate = new Date(entry.date);
      if (entryDate >= start && entryDate <= end) {
        return sum + entry.earnings;
      }
      return sum;
    }, 0);
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (entries.length === 0) return;
    setIsExporting(true); // Start exporting
    try {
      // Simulate potential async operation or just processing time
      const csvContent = "data:text/csv;charset=utf-8," +
      "Date,RegularLessons,MasterClasses,Earnings\n" +
      filteredEntries // Export filtered entries respecting the current view
        .map(e => `${format(new Date(e.date), 'yyyy-MM-dd')},${e.regularLessons},${e.masterClasses},${e.earnings}`)
        .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "earnings_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
        console.error("Error exporting CSV:", error);
        // TODO: Show error to user (e.g., toast notification)
    } finally {
        setIsExporting(false); // Stop exporting regardless of success/error
    } 
  };

  // Import data from CSV
  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true); // Start importing
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const lines = content.split("\n");

      // Skip header
      const newEntries: LessonEntry[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [dateStr, regularLessonsStr, masterClassesStr, earningsStr] = line.split(",");

        try {
          const dateParts = dateStr.split(".");
          const date = new Date(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
          const regularLessons = parseInt(regularLessonsStr);
          const masterClasses = parseInt(masterClassesStr);
          const earnings = parseInt(earningsStr);

          if (isNaN(date.getTime()) || isNaN(regularLessons) || isNaN(masterClasses) || isNaN(earnings)) {
            continue;
          }

          newEntries.push({
            id: Date.now().toString() + i,
            date: format(date, "yyyy-MM-dd"),
            regularLessons,
            masterClasses,
            earnings
          });
        } catch (error) {
          console.error("Error parsing CSV line:", line, error);
          toast.error("Ошибка при импорте файла: неверный формат CSV");
        }
      }

      if (newEntries.length > 0) {
        setEntries(prev => [...prev, ...newEntries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast.success(`Импортировано ${newEntries.length} записей`);
      }
    };
    reader.readAsText(file, 'UTF-8'); // Re-add the line to start reading the file
  };

  // Delete an entry
  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };
  
  // Edit an entry
  const handleEditEntry = (entry: LessonEntry) => {
    setEditingEntry(entry);
    setIsEditDialogOpen(true);
  };
  
  // Save edited entry
  const handleSaveEditedEntry = (updatedEntry: LessonEntry) => {
    setEntries(prev => 
      prev.map(entry => 
        entry.id === updatedEntry.id ? updatedEntry : entry
      )
    );
    toast.success("Запись успешно обновлена");
  };

  // Handle settings save
  const handleSaveSettings = (newGoal: number, newRegularPrice: number, newMasterPrice: number) => {
    setMonthlyGoal(newGoal);
    setRegularLessonPrice(newRegularPrice);
    setMasterClassPrice(newMasterPrice);
    saveSettings();
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-6 bg-background">
      <div className="w-full max-w-[1750px]">
        {/* Header with title and settings */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 sm:mb-0">Панель управления заработком</h1>
          <div className="flex gap-3">
            <SettingsDialog 
              currentGoal={monthlyGoal}
              currentRegularPrice={regularLessonPrice}
              currentMasterPrice={masterClassPrice}
              onSave={handleSaveSettings}
            />
            <CompanySettings
              companyInfo={companyInfo}
              onSave={handleSaveCompanyInfo}
            />
            <InvoiceGenerator
              entries={entries}
              companyInfo={companyInfo}
              regularLessonPrice={regularLessonPrice}
              masterClassPrice={masterClassPrice}
              onInvoiceGenerated={handleInvoiceGenerated}
            />
            <DataActions
              exportToCSV={exportToCSV}
              importFromCSV={importFromCSV}
              isExporting={isExporting}
              isImporting={isImporting}
            />
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {/* Total Earnings Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-black dark:text-white font-medium">Общий заработок</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <span className="text-2xl font-bold mt-1">
                    {filteredEntries.reduce((sum, entry) => sum + entry.earnings, 0).toFixed(2)} €
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Average Per Day Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-black dark:text-white font-medium">Средний за день</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <span className="text-2xl font-bold mt-1">
                    {filteredEntries.length > 0 
                      ? (filteredEntries.reduce((sum, entry) => sum + entry.earnings, 0) / 
                         new Set(filteredEntries.map(e => e.date.split('T')[0])).size).toFixed(2)
                      : "0.00"} €
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Average Per Lesson Card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col">
                <span className="text-sm text-black dark:text-white font-medium">Средний за урок</span>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <span className="text-2xl font-bold mt-1">
                    {filteredEntries.length > 0 
                      ? (filteredEntries.reduce((sum, entry) => sum + entry.earnings, 0) / 
                         filteredEntries.reduce((sum, entry) => sum + entry.regularLessons + entry.masterClasses, 0)).toFixed(2)
                      : "0.00"} €
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Column: Entry Form and Stats */}
          <div className="lg:col-span-5">
            <div className="space-y-6">
              {/* Entry Form with more space */}
              <EntryForm 
                date={date}
                setDate={setDate}
                regularLessons={regularLessons}
                setRegularLessons={setRegularLessons}
                masterClasses={masterClasses}
                setMasterClasses={setMasterClasses}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                regularLessonPrice={regularLessonPrice}
                masterClassPrice={masterClassPrice}
              />
              
              {/* Additional Stats Display */}
              <StatsDisplay 
                entries={filteredEntries} 
                isLoading={isLoading}
                monthlyGoal={monthlyGoal} 
              />
            </div>
          </div>

          {/* Right Column: Entries Table */}
          <div className="lg:col-span-7">
            <EntriesTable
              entries={filteredEntries}
              isLoading={isLoading}
              deleteEntry={deleteEntry}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              editEntry={handleEditEntry}
            />
          </div>
        </div>

        {/* Toast notifications are now handled by Sonner in bottom-right corner */}
        
        {/* Edit Entry Dialog */}
        <EditEntryDialog 
          entry={editingEntry}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveEditedEntry}
          regularLessonPrice={regularLessonPrice}
          masterClassPrice={masterClassPrice}
        />
        
        {/* Company Settings Dialog */}
        
        {/* Edit Entry Dialog */}
        <EditEntryDialog 
          entry={editingEntry}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveEditedEntry}
          regularLessonPrice={regularLessonPrice}
          masterClassPrice={masterClassPrice}
        />
      
      </div>
    </main>
  );
}
