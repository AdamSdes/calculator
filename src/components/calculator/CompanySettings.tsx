"use client";

import React, { useState, useEffect } from 'react';
import { Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export interface CompanyInfo {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  ico: string;
  dic: string;
  bankAccount: string;
  swift: string;
  lastInvoiceNumber: number;
}

interface CompanySettingsProps {
  companyInfo: CompanyInfo;
  onSave: (info: CompanyInfo) => void;
}

const defaultCompanyInfo: CompanyInfo = {
  name: "Maksym Lovska",
  address: "Púpavová 684/30",
  city: "Bratislava-Karlova Ves",
  postalCode: "841 04",
  ico: "56 718 764",
  dic: "3122104480",
  bankAccount: "SK80 0200 0000 0050 9684 2458",
  swift: "SUBASKBX",
  lastInvoiceNumber: 20250010
};

export default function CompanySettings({
  companyInfo,
  onSave,
}: CompanySettingsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editableInfo, setEditableInfo] = useState<CompanyInfo>(companyInfo);

  useEffect(() => {
    if (isDialogOpen) {
      setEditableInfo(companyInfo);
    }
  }, [companyInfo, isDialogOpen]);

  const handleSave = () => {
    onSave(editableInfo);
    setIsDialogOpen(false);
    toast.success("Данные компании сохранены");
  };

  const handleInputChange = (field: keyof CompanyInfo, value: string | number) => {
    setEditableInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9">
          <Building2 className="mr-2 h-4 w-4" />
          Данные компании
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Настройки компании
          </DialogTitle>
          <DialogDescription>
            Настройте данные для генерации фактур
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя/Название</Label>
            <Input
              id="name"
              value={editableInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Maksym Lovska"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Адрес</Label>
            <Input
              id="address"
              value={editableInfo.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Púpavová 684/30"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="postalCode">Индекс</Label>
              <Input
                id="postalCode"
                value={editableInfo.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="841 04"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                value={editableInfo.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Bratislava-Karlova Ves"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="ico">IČO</Label>
              <Input
                id="ico"
                value={editableInfo.ico}
                onChange={(e) => handleInputChange('ico', e.target.value)}
                placeholder="56 718 764"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dic">DIČ</Label>
              <Input
                id="dic"
                value={editableInfo.dic}
                onChange={(e) => handleInputChange('dic', e.target.value)}
                placeholder="3122104480"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Банковский счет</Label>
            <Input
              id="bankAccount"
              value={editableInfo.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              placeholder="SK80 0200 0000 0050 9684 2458"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="swift">SWIFT</Label>
            <Input
              id="swift"
              value={editableInfo.swift}
              onChange={(e) => handleInputChange('swift', e.target.value)}
              placeholder="SUBASKBX"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastInvoiceNumber">Последний номер фактуры</Label>
            <Input
              id="lastInvoiceNumber"
              type="number"
              value={editableInfo.lastInvoiceNumber}
              onChange={(e) => handleInputChange('lastInvoiceNumber', parseInt(e.target.value) || 0)}
              placeholder="20250010"
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { defaultCompanyInfo };
