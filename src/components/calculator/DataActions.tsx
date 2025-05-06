"use client";

import React, { useRef } from 'react';
import { Download, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DataActionsProps {
  exportToCSV: () => void;
  importFromCSV: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isImporting: boolean;
  isExporting: boolean;
}

export default function DataActions({
  exportToCSV,
  importFromCSV,
  isImporting,
  isExporting
}: DataActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={exportToCSV} 
        variant="outline" 
        size="sm"
        className="h-9" 
        disabled={isExporting || isImporting}
      >
        {isExporting ? ( 
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Экспорт
      </Button>
      <div>
        <Label htmlFor="csv-upload" className="inline-block">
          <Button 
            onClick={handleImportClick} 
            variant="outline" 
            size="sm"
            asChild 
            className="h-9 cursor-pointer" 
            disabled={isImporting || isExporting}
          >
            <div>
              {isImporting ? ( 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Импорт
            </div>
          </Button>
        </Label>
        <Input
          id="csv-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={importFromCSV}
          ref={fileInputRef}
        />
      </div>
    </div>
  );
}
