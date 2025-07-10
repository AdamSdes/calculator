"use client";

import React, { useState, useRef } from 'react';
import { FileText, Download, Calendar, User } from "lucide-react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ru } from "date-fns/locale";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { CompanyInfo } from "./CompanySettings";

interface LessonEntry {
  id: string;
  date: string;
  regularLessons: number;
  masterClasses: number;
  earnings: number;
}

interface ClientInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  ico: string;
  icDph: string;
}

interface InvoiceGeneratorProps {
  entries: LessonEntry[];
  companyInfo: CompanyInfo;
  regularLessonPrice: number;
  masterClassPrice: number;
  onInvoiceGenerated: (invoiceNumber: number) => void;
}

const defaultClientInfo: ClientInfo = {
  name: "Mariia Kapkanets",
  address: "Zuzany Chalupovej 4029/9",
  city: "Bratislava – mestská časť Petržalka",
  postalCode: "851 07",
  ico: "55110738",
  icDph: "SK3121426803"
};

export default function InvoiceGenerator({
  entries,
  companyInfo,
  regularLessonPrice,
  masterClassPrice,
  onInvoiceGenerated
}: InvoiceGeneratorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date>(startOfMonth(new Date()));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(new Date()));
  const [clientInfo, setClientInfo] = useState<ClientInfo>(defaultClientInfo);
  const [isGenerating, setIsGenerating] = useState(false);
  const [useManualAmount, setUseManualAmount] = useState(false);
  const [manualAmount, setManualAmount] = useState<string>('');
  const [useManualHours, setUseManualHours] = useState(false);
  const [manualHours, setManualHours] = useState<string>('');
  
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Фильтр записей по выбранному периоду
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    return entryDate >= startDate && entryDate <= endDate;
  });

  // Расчет итогов
  const totalRegularLessons = filteredEntries.reduce((sum, entry) => sum + entry.regularLessons, 0);
  const totalMasterClasses = filteredEntries.reduce((sum, entry) => sum + entry.masterClasses, 0);
  const calculatedHours = totalRegularLessons + totalMasterClasses;
  const totalHours = useManualHours ? parseFloat(manualHours) || 0 : calculatedHours;
  const calculatedAmount = filteredEntries.reduce((sum, entry) => sum + entry.earnings, 0);
  const totalAmount = useManualAmount ? parseFloat(manualAmount) || 0 : calculatedAmount;

  const nextInvoiceNumber = companyInfo.lastInvoiceNumber + 1;

  const handleClientChange = (field: keyof ClientInfo, value: string) => {
    setClientInfo(prev => ({ ...prev, [field]: value }));
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    
    setIsGenerating(true);
    
    try {
      // Создаем canvas из HTML элемента
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      
      // Создаем PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      // Добавляем первую страницу
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Добавляем дополнительные страницы если нужно
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      // Сохраняем PDF
      const fileName = `Faktura_${nextInvoiceNumber}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      pdf.save(fileName);
      
      // Обновляем номер фактуры
      onInvoiceGenerated(nextInvoiceNumber);
      
      toast.success(`Фактура ${nextInvoiceNumber} успешно создана`);
      setIsDialogOpen(false);
      
    } catch (error) {
      console.error('Ошибка при создании PDF:', error);
      toast.error('Ошибка при создании PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <FileText className="mr-2 h-4 w-4" />
          Создать фактуру
        </Button>
      </DialogTrigger>
      <DialogContent className="!max-w-[95vw] !w-[95vw] max-h-[90vh] overflow-y-auto" style={{ width: '95vw', maxWidth: '95vw' }}>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Генератор фактур
          </DialogTitle>
          <DialogDescription>
            Создание фактуры за преподавательские услуги
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Настройки */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Период услуг</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>От</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(startDate, "dd.MM.yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>До</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(endDate, "dd.MM.yyyy")}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => date && setEndDate(date)}
                          locale={ru}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Данные клиента</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Имя</Label>
                  <Input
                    value={clientInfo.name}
                    onChange={(e) => handleClientChange('name', e.target.value)}
                    placeholder="Mariia Kapkanets"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Адрес</Label>
                  <Input
                    value={clientInfo.address}
                    onChange={(e) => handleClientChange('address', e.target.value)}
                    placeholder="Zuzany Chalupovej 4029/9"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Индекс</Label>
                    <Input
                      value={clientInfo.postalCode}
                      onChange={(e) => handleClientChange('postalCode', e.target.value)}
                      placeholder="85107"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Город</Label>
                    <Input
                      value={clientInfo.city}
                      onChange={(e) => handleClientChange('city', e.target.value)}
                      placeholder="Bratislava"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>IČO</Label>
                    <Input
                      value={clientInfo.ico}
                      onChange={(e) => handleClientChange('ico', e.target.value)}
                      placeholder="55110738"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IČ DPH</Label>
                    <Input
                      value={clientInfo.icDph}
                      onChange={(e) => handleClientChange('icDph', e.target.value)}
                      placeholder="SK3121426803"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-muted/50 p-3 rounded-md">
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Обычные уроки:</span>
                  <span>{totalRegularLessons} ч.</span>
                </div>
                <div className="flex justify-between">
                  <span>Мастер-классы:</span>
                  <span>{totalMasterClasses} ч.</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Общее количество часов:</span>
                  <span>{totalHours} ч.</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Общая сумма:</span>
                  <span>{totalAmount.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Количество часов</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="manual-hours"
                    checked={useManualHours}
                    onCheckedChange={setUseManualHours}
                  />
                  <Label htmlFor="manual-hours" className="text-sm">
                    Указать часы вручную
                  </Label>
                </div>
                {useManualHours && (
                  <div className="space-y-2">
                    <Label>Количество часов</Label>
                    <Input
                      type="number"
                      step="0.5"
                      value={manualHours}
                      onChange={(e) => setManualHours(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                )}
                {!useManualHours && (
                  <div className="text-sm text-muted-foreground">
                    Часы рассчитываются автоматически: {calculatedHours} ч.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Сумма к оплате</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="manual-amount"
                    checked={useManualAmount}
                    onCheckedChange={setUseManualAmount}
                  />
                  <Label htmlFor="manual-amount" className="text-sm">
                    Указать сумму вручную
                  </Label>
                </div>
                {useManualAmount && (
                  <div className="space-y-2">
                    <Label>Сумма (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={manualAmount}
                      onChange={(e) => setManualAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                )}
                {!useManualAmount && (
                  <div className="text-sm text-muted-foreground">
                    Сумма рассчитывается автоматически: {calculatedAmount.toFixed(2)} €
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Превью фактуры */}
          <div className="space-y-4">
            <div className="text-sm font-medium">Превью фактуры:</div>
            <InvoicePreview
              ref={invoiceRef}
              companyInfo={companyInfo}
              clientInfo={clientInfo}
              invoiceNumber={nextInvoiceNumber}
              startDate={startDate}
              endDate={endDate}
              totalHours={totalHours}
              totalAmount={totalAmount}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            onClick={generatePDF} 
            disabled={isGenerating || totalAmount === 0}
            className="w-full"
          >
            {isGenerating ? (
              <>Создание PDF...</>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Скачать фактуру PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Компонент превью фактуры
const InvoicePreview = React.forwardRef<
  HTMLDivElement,
  {
    companyInfo: CompanyInfo;
    clientInfo: ClientInfo;
    invoiceNumber: number;
    startDate: Date;
    endDate: Date;
    totalHours: number;
    totalAmount: number;
  }
>(({ companyInfo, clientInfo, invoiceNumber, startDate, endDate, totalHours, totalAmount }, ref) => {
  const today = new Date();
  const dueDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000); // +14 дней
  
  return (
    <div ref={ref} className="bg-white p-8 text-sm border border-[#e5e5e5] rounded-lg max-w-4xl mx-auto" style={{ fontFamily: 'Inter, system-ui, sans-serif', color: '#171717' }}>
      {/* Заголовок */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b border-[#e5e5e5]">
        <div>
          <h1 className="text-2xl font-semibold mb-1" style={{ color: '#171717' }}>FAKTÚRA číslo: {invoiceNumber}</h1>
          <div className="text-sm space-y-1 mt-2" style={{ color: '#737373' }}>
            <div>Objednávka:</div>
            <div>Dodací list:</div>
          </div>
        </div>
        
        <div className="text-right text-sm space-y-1">
          <div className="flex justify-between gap-8">
            <span style={{ color: '#737373' }}>Dátum vyhotovenia:</span>
            <span className="font-medium" style={{ color: '#262626' }}>{format(today, "dd.MM.yyyy")}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span style={{ color: '#737373' }}>Dátum splatnosti:</span>
            <span className="font-medium" style={{ color: '#262626' }}>{format(dueDate, "dd.MM.yyyy")}</span>
          </div>
          <div className="flex justify-between gap-8">
            <span style={{ color: '#737373' }}>Dátum dodania:</span>
            <span className="font-medium" style={{ color: '#262626' }}>od {format(startDate, "dd.MM.yyyy")} do {format(endDate, "dd.MM.yyyy")}</span>
          </div>
        </div>
      </div>

      {/* Dodávateľ a Odberateľ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Dodávateľ */}
        <div style={{ backgroundColor: '#fafafa' }} className="p-6 rounded-lg border border-[#f5f5f5]">
          <div className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: '#737373' }}>DODÁVATEĽ</div>
          <div className="space-y-2">
            <div className="font-semibold text-base" style={{ color: '#171717' }}>Maksym Lovska</div>
            <div style={{ color: '#737373' }}>Púpavová 684/30</div>
            <div style={{ color: '#737373' }}>841 04 Bratislava-Karlova Ves</div>
            <div className="pt-2 mt-3 border-t border-[#e5e5e5] space-y-1 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#737373' }}>IČO:</span>
                <span style={{ color: '#262626' }}>56 718 764</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#737373' }}>DIČ:</span>
                <span style={{ color: '#262626' }}>3122104480</span>
              </div>
            </div>
          </div>
        </div>

        {/* Odberateľ */}
        <div style={{ backgroundColor: '#f5f5f5' }} className="p-6 rounded-lg border border-[#e5e5e5]">
          <div className="text-xs font-medium uppercase tracking-wide mb-3" style={{ color: '#737373' }}>ODBERATEĽ</div>
          <div className="space-y-2">
            <div className="font-semibold text-base" style={{ color: '#171717' }}>{clientInfo.name}</div>
            <div style={{ color: '#737373' }}>{clientInfo.address}</div>
            <div style={{ color: '#737373' }}>{clientInfo.postalCode} {clientInfo.city}</div>
            <div className="pt-2 mt-3 border-t border-[#e5e5e5] space-y-1 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#737373' }}>IČO:</span>
                <span style={{ color: '#262626' }}>{clientInfo.ico}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#737373' }}>IČ DPH:</span>
                <span style={{ color: '#262626' }}>{clientInfo.icDph}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platobné údaje */}
      <div style={{ backgroundColor: '#fafafa' }} className="p-6 rounded-lg mb-8 border border-[#e5e5e5]">
        <div className="text-xs font-medium uppercase tracking-wide mb-4" style={{ color: '#737373' }}>PLATOBNÉ ÚDAJE</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#737373' }}>Číslo účtu:</span>
              <span className="font-mono" style={{ color: '#262626' }}>SK80 0200 0000 0060 9684 2458</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#737373' }}>SWIFT:</span>
              <span className="font-mono" style={{ color: '#262626' }}>SUBASKBX</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span style={{ color: '#737373' }}>VS:</span>
              <span className="font-mono" style={{ color: '#262626' }}>{invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#737373' }}>Forma úhrady:</span>
              <span style={{ color: '#262626' }}>Platba kartou</span>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-sm">
          <div className="flex justify-between">
            <span style={{ color: '#737373' }}>Spôsob dopravy:</span>
            <span style={{ color: '#262626' }}>Služba</span>
          </div>
        </div>
      </div>

      {/* Tabuľka služieb */}
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-wide mb-4" style={{ color: '#737373' }}>Fakturujeme Vám</div>
        <div className="border border-[#e5e5e5] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr className="border-b border-[#e5e5e5]">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>P.č</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>Číslo položky</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>Názov položky</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>Množstvo</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>MJ</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>Zľava %</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>Jednotková cena</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider" style={{ color: '#737373' }}>Cena spolu</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-4 text-sm font-medium" style={{ color: '#262626' }}>1.</td>
                <td className="px-4 py-4 text-sm" style={{ color: '#737373' }}></td>
                <td className="px-4 py-4 text-sm" style={{ color: '#171717' }}>Upratovacie služby</td>
                <td className="px-4 py-4 text-center text-sm font-semibold" style={{ color: '#171717' }}>{totalHours}</td>
                <td className="px-4 py-4 text-center text-sm" style={{ color: '#737373' }}>h.</td>
                <td className="px-4 py-4 text-center text-sm" style={{ color: '#737373' }}></td>
                <td className="px-4 py-4 text-center text-sm" style={{ color: '#737373' }}></td>
                <td className="px-4 py-4 text-center text-sm font-semibold" style={{ color: '#171717' }}>{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Súhrn */}
      <div className="flex justify-end mb-8">
        <div className="w-80 p-6 rounded-lg border border-[#e5e5e5]" style={{ backgroundColor: '#fafafa' }}>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 text-sm">
              <span style={{ color: '#737373' }}>Celková fakturovaná suma:</span>
              <span className="font-medium" style={{ color: '#262626' }}>EUR {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 px-4 rounded-md" style={{ backgroundColor: '#171717', color: 'white' }}>
              <span className="font-semibold">K úhrade:</span>
              <span className="font-bold text-lg">EUR {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Poznámka o DPH */}
      <div className="mb-8">
        <div className="text-sm" style={{ color: '#171717' }}>
          Dodávateľ nie je platiteľ DPH.
        </div>
      </div>

      {/* Podpis */}
      <div className="text-center mt-12 pt-8 border-t border-[#e5e5e5]">
        <div className="inline-block">
          <div className="font-semibold text-lg mb-6" style={{ color: '#171717' }}>Maksym Lovska</div>
          <div className="w-48 border-t pt-2 text-sm" style={{ borderTopColor: '#d4d4d4', color: '#737373' }}>
            Pečiatka a podpis
          </div>
        </div>
      </div>

      {/* Футер */}
      <div className="text-center text-xs mt-6 pt-4 border-t" style={{ color: '#a3a3a3', borderTopColor: '#e5e5e5' }}>
        Faktúra bola vytvorená dňa {format(today, "dd.MM.yyyy")}
      </div>
    </div>
  );
});
