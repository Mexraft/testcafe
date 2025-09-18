'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import HealthcareFlowchart from '@/components/flow/HealthcareFlowchart';

export default function HealthcareFlowPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="pl-0">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Healthcare System Flowchart</h1>
        <p className="text-muted-foreground">
          Interactive visualization of the healthcare system workflow
        </p>
      </div>

      <Tabs defaultValue="flowchart" className="w-full">
        <TabsList>
          <TabsTrigger value="flowchart">Flowchart</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
        </TabsList>
        
        <TabsContent value="flowchart" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Workflow</CardTitle>
              <CardDescription>
                Drag to pan, scroll to zoom. Click and drag nodes to reposition them.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100vh-300px)] min-h-[500px] p-0">
              <HealthcareFlowchart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="description" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Description</CardTitle>
              <CardDescription>
                Overview of the healthcare system components and their interactions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  Handles user registration, authentication, and profile management for patients, 
                  doctors, and administrators.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Appointment System</h3>
                <p className="text-sm text-muted-foreground">
                  Manages the entire appointment lifecycle including booking, rescheduling, 
                  and cancellation with doctor approval workflows.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Medical Records</h3>
                <p className="text-sm text-muted-foreground">
                  Secure storage and management of patient medical records with controlled 
                  access for patients and doctors.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Multi-channel notification system for appointment reminders, status updates, 
                  and payment confirmations.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Payments</h3>
                <p className="text-sm text-muted-foreground">
                  Secure processing of consultation fees with automated invoice generation 
                  and receipt delivery.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
