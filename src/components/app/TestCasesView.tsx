'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { TestCase } from '@/lib/types';
import { ArrowLeft, ClipboardList, Download, RotateCcw } from 'lucide-react';

export function TestCasesView({
  testCases,
  onStartOver,
  onBack,
}: {
  testCases: TestCase[];
  onStartOver: () => void;
  onBack: () => void;
}) {
  const exportToCSV = () => {
    const headers = ['ID', 'Description', 'Compliance Standards'];
    const rows = testCases.map(tc => [
      tc.id,
      `"${tc.description.replace(/"/g, '""')}"`,
      `"${tc.standards.join(', ')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-s-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'test-cases.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Card className="w-full shadow-lg animate-fade-in">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-md">
                    <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <CardTitle className="font-headline">Generated Test Cases</CardTitle>
                    <CardDescription>
                    Review, and export your automatically generated test cases.
                    </CardDescription>
                </div>
            </div>
            <Button onClick={exportToCSV}>
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Compliance Standards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.map((testCase) => (
                <TableRow key={testCase.id}>
                  <TableCell className="font-medium">{testCase.id}</TableCell>
                  <TableCell>{testCase.description}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {testCase.standards.length > 0 ? (
                        testCase.standards.map((standard) => (
                          <Badge key={standard} variant="secondary">
                            {standard}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Summary
        </Button>
        <Button variant="outline" onClick={onStartOver}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Start Over
        </Button>
      </CardFooter>
    </Card>
  );
}
