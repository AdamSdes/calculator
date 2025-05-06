"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from 'lucide-react';

// Define the type for a single entry (matching page.tsx)
type LessonEntry = {
  id: string;
  date: string;
  regularLessons: number;
  masterClasses: number;
  earnings: number;
};

interface StatsDisplayProps {
  entries: LessonEntry[];
  isLoading: boolean;
  monthlyGoal: number;
}

export default function StatsDisplay({ 
  entries, 
  isLoading, 
  monthlyGoal 
}: StatsDisplayProps) {

  // Calculate statistics using useMemo
  const stats = useMemo(() => {
    const totalEarnings = entries.reduce((sum, entry) => sum + entry.earnings, 0);
    const entryCount = entries.length;
    const totalLessons = entries.reduce((sum, entry) => sum + entry.regularLessons + entry.masterClasses, 0);

    const averageDailyEarnings = entryCount > 0 
      ? totalEarnings / new Set(entries.map(e => e.date.split('T')[0])).size // Use unique dates for daily avg
      : 0;

    const averageLessonEarnings = totalLessons > 0 
      ? totalEarnings / totalLessons 
      : 0;
      
    const goalProgress = monthlyGoal > 0 ? (totalEarnings / monthlyGoal) * 100 : 0;

    return {
      totalEarnings,
      entryCount,
      totalLessons,
      averageDailyEarnings,
      averageLessonEarnings,
      goalProgress // We calculate it but might not display it per user preference
    };
  }, [entries, monthlyGoal]);

  return (
    <Card>
      <CardHeader className="pb-2 border-b border-border/50 mb-4"> 
        <CardTitle className="text-base font-medium flex items-center"> 
          <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" /> 
          Статистика
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3"> 
        {isLoading ? (
          <>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-8 w-1/4" /> 
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-1/5" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-5 w-1/5" />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Общий заработок</span> 
              <span className="font-bold text-2xl">{stats.totalEarnings.toFixed(2)} €</span> 
            </div>
            {stats.entryCount > 0 && (
                <>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Количество уроков</span>
                        <span className="font-medium">{stats.totalLessons}</span>
                    </div>
                </>
            )}
            {stats.entryCount > 0 && (
                <>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Средний заработок за день</span>
                        <span className="font-medium">{stats.averageDailyEarnings.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Средний заработок за урок</span>
                        <span className="font-medium">{stats.averageLessonEarnings.toFixed(2)} €</span>
                    </div>
                </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
