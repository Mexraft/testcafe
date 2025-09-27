"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Calendar,
  FileText,
  Bell,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import HealthcareFlowchart, { healthcareFlowchartDummyData } from "@/components/flow/HealthcareFlowchart";

export default function HealthcareFlowPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 space-y-8">
        <div className="space-y-4">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="pl-0 hover:bg-primary/5"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Healthcare System Flowchart
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Interactive visualization of a comprehensive healthcare management
              system workflow
            </p>
          </div>
        </div>

        <Tabs defaultValue="flowchart" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="flowchart" className="text-sm">
              Interactive Flow
            </TabsTrigger>
            <TabsTrigger value="description" className="text-sm">
              System Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flowchart" className="mt-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  System Workflow Visualization
                </CardTitle>
                <CardDescription className="text-base">
                  Drag to pan • Scroll to zoom • Click and drag nodes to
                  reposition them
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100vh-250px)] min-h-[600px] p-0">
                <HealthcareFlowchart data={healthcareFlowchartDummyData} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="description" className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">User Management</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    Comprehensive management system for Patients, Doctors, and
                    Administrators with secure registration, authentication, and
                    profile management capabilities.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg">
                      Appointment System
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    Complete appointment lifecycle management including booking,
                    rescheduling, and cancellation with integrated doctor
                    approval workflows and availability tracking.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg">Medical Records</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    Secure digital storage and management of patient medical
                    records with controlled access permissions for patients and
                    healthcare providers.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-lg">Notifications</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    Multi-channel notification system delivering appointment
                    reminders, status updates, and payment confirmations via
                    email, SMS, and in-app notifications.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/20 dark:to-cyan-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <CreditCard className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <CardTitle className="text-lg">
                      Payment Processing
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    Secure online payment processing for consultation fees with
                    automated invoice generation and digital receipt delivery to
                    patients.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <CardTitle className="text-lg">
                      Doctor Availability
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    Real-time doctor availability management allowing healthcare
                    providers to update their consultation schedules and
                    appointment slots dynamically.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
