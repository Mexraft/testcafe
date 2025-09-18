'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeTypes,
  Panel,
  MarkerType,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  EdgeTypes,
  NodeMouseHandler,
  Connection,
  addEdge,
  ConnectionLineType,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

// Types
type NodeData = {
  label: string;
  description: string;
};

type FlowNode = Node<NodeData>;
type FlowEdge = Edge;

const nodeTypes: NodeTypes = {
  card: ({ data }: { data: NodeData }) => (
    <div className="relative">
      {/* Target handle (incoming connections) */}
      <Handle type="target" position={Position.Top} style={{ background: '#64748b' }} />
      <Card className="w-64 shadow-lg border-primary/20">
        <CardHeader className="p-3 pb-1">
          <CardTitle className="text-base font-semibold text-primary">
            {data.label}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-xs text-muted-foreground">{data.description}</p>
        </CardContent>
      </Card>
      {/* Source handle (outgoing connections) */}
      <Handle type="source" position={Position.Bottom} style={{ background: '#64748b' }} />
    </div>
  ),
};

// Inner component that uses useReactFlow
const FlowchartContent = () => {
  const { fitView } = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitViewOnLoad, setFitViewOnLoad] = useState(true);
  

  // Parse the provided data
  const { initialNodes, initialEdges } = useMemo(() => {
    const data = {
      nodes: [
        { id: "start", label: "System Start", description: "Initial entry point into the system's core functionalities." },
        { id: "user_management", label: "User Management", description: "Comprehensive management for Patients, Doctors, and Administrators." },
        { id: "registration", label: "User Registration", description: "Allows new users (Patients, Doctors, Admins) to create accounts." },
        { id: "profile_management", label: "Profile Management", description: "Users (Patients, Doctors, Admins) can update and manage their personal information and settings." },
        { id: "doctor_availability", label: "Doctor Availability", description: "Doctors update their consultation availability status and schedule for appointments." },
        { id: "appointment_management", label: "Appointment Management", description: "Core system for handling patient appointments including booking, rescheduling, and cancellation." },
        { id: "book_appointment", label: "Book Appointment", description: "Patients initiate booking a new appointment with an available doctor." },
        { id: "reschedule_appointment", label: "Reschedule Appointment", description: "Patients request to change the date or time of an existing appointment." },
        { id: "cancel_appointment", label: "Cancel Appointment", description: "Patients request to cancel an existing appointment." },
        { id: "doctor_decision", label: "Doctor Approval/Rejection", description: "Doctors review appointment requests (booking, rescheduling, cancellation) and decide to approve or reject them." },
        { id: "notification_system", label: "Notification System", description: "Automated system for sending appointment reminders, status updates, and payment confirmations via multiple channels." },
        { id: "email_notification", label: "Email Notifications", description: "Sends system alerts and updates to users via email." },
        { id: "sms_notification", label: "SMS Notifications", description: "Sends system alerts and updates to users via SMS." },
        { id: "app_notification", label: "In-App Notifications", description: "Sends system alerts and updates to users within the application interface." },
        { id: "medical_records", label: "Medical Record Management", description: "Basic management of patient medical records, allowing patient uploads and doctor viewing." },
        { id: "patient_upload_records", label: "Patient Upload Records", description: "Patients upload their medical documents, reports, and history for doctor review." },
        { id: "doctor_view_records", label: "Doctor View Records", description: "Doctors access and review patient medical records uploaded by patients." },
        { id: "online_payment_module", label: "Online Payment Module", description: "Optional module for processing online consultation fees and generating invoices post-consultation." },
        { id: "process_payment", label: "Process Consultation Fees", description: "Handles secure online transactions for consultation charges from patients." },
        { id: "generate_invoice", label: "Generate Invoice", description: "Creates and provides digital invoices to patients for completed payments." }
      ],
      edges: [
        { source: "start", target: "user_management", label: "Access System" },
        { source: "user_management", target: "registration", label: "New User Flow" },
        { source: "user_management", target: "profile_management", label: "Existing User Access" },
        { source: "registration", target: "profile_management", label: "Post-Registration Setup" },
        { source: "profile_management", target: "doctor_availability", label: "Doctor Updates Schedule" },
        { source: "profile_management", target: "appointment_management", label: "User Accesses Appointments" },
        { source: "appointment_management", target: "book_appointment", label: "Initiate Booking" },
        { source: "appointment_management", target: "reschedule_appointment", label: "Initiate Reschedule" },
        { source: "appointment_management", target: "cancel_appointment", label: "Initiate Cancellation" },
        { source: "book_appointment", target: "doctor_decision", label: "Submit For Review" },
        { source: "reschedule_appointment", target: "doctor_decision", label: "Submit For Review" },
        { source: "cancel_appointment", target: "doctor_decision", label: "Submit For Review" },
        { source: "doctor_decision", target: "notification_system", label: "Send Status Update" },
        { source: "notification_system", target: "email_notification", label: "Via Email" },
        { source: "notification_system", target: "sms_notification", label: "Via SMS" },
        { source: "notification_system", target: "app_notification", label: "Via In-App" },
        { source: "user_management", target: "medical_records", label: "Access Patient Records" },
        { source: "medical_records", target: "patient_upload_records", label: "Patient Uploads Docs" },
        { source: "medical_records", target: "doctor_view_records", label: "Doctor Views Docs" },
        { source: "patient_upload_records", target: "doctor_view_records", label: "Available For Viewing" },
        { source: "doctor_decision", target: "online_payment_module", label: "If Approved & Consulted" },
        { source: "online_payment_module", target: "process_payment", label: "Initiate Payment" },
        { source: "process_payment", target: "generate_invoice", label: "Payment Successful" },
        { source: "generate_invoice", target: "notification_system", label: "Send Invoice/Receipt" }
      ]
    };

    // Position nodes in a hierarchical layout
    const nodePositions: Record<string, { x: number; y: number }> = {
      // Level 0
      'start': { x: 0, y: 0 },
      // Level 1
      'user_management': { x: 0, y: 150 },
      // Level 2
      'registration': { x: -300, y: 300 },
      'profile_management': { x: 0, y: 300 },
      'medical_records': { x: 300, y: 300 },
      // Level 3
      'appointment_management': { x: -100, y: 450 },
      'doctor_availability': { x: 100, y: 450 },
      'patient_upload_records': { x: 200, y: 450 },
      'doctor_view_records': { x: 400, y: 450 },
      // Level 4
      'book_appointment': { x: -300, y: 600 },
      'reschedule_appointment': { x: -100, y: 600 },
      'cancel_appointment': { x: 100, y: 600 },
      // Level 5
      'doctor_decision': { x: 0, y: 750 },
      // Level 6
      'notification_system': { x: 0, y: 900 },
      'online_payment_module': { x: 300, y: 900 },
      // Level 7
      'email_notification': { x: -200, y: 1050 },
      'sms_notification': { x: 0, y: 1050 },
      'app_notification': { x: 200, y: 1050 },
      'process_payment': { x: 400, y: 1050 },
      // Level 8
      'generate_invoice': { x: 400, y: 1200 },
    };

    const nodes = data.nodes.map(node => ({
      id: node.id,
      type: 'card' as const,
      data: { label: node.label, description: node.description },
      position: nodePositions[node.id] || { x: 0, y: 0 },
      style: {
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        padding: '0.5rem',
      },
    }));

    const edges: Edge[] = data.edges.map((edge, index) => {
      // Create a stable ID for the edge
      const edgeId = `edge-${edge.source}-${edge.target}-${index}`;
      
      return {
        id: edgeId,
        source: edge.source,
        target: edge.target,
        type: 'smoothstep',
        animated: true,
        data: { label: edge.label },
        style: {
          stroke: '#64748b',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#64748b',
        },
        label: edge.label,
        labelStyle: {
          fontSize: 10,
          fill: '#64748b',
          fontWeight: 400,
        },
        labelShowBg: true,
        labelBgPadding: [4, 4] as [number, number],
        labelBgBorderRadius: 4,
        labelBgStyle: {
          fill: '#fff',
          fillOpacity: 0.8,
          stroke: '#e2e8f0',
          strokeWidth: 1,
        },
      };
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    setTimeout(() => {
      setFitViewOnLoad(true);
      fitView({ padding: 0.2 });
    }, 0);
  }, [isFullscreen, fitView]);

  return (
    <div className={`h-[calc(100vh-200px)] ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : 'relative'}`}>
      <div className="absolute right-4 top-4 z-10 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleFullscreen}
          className="h-8 w-8 p-0"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </Button>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView={fitViewOnLoad}
        onInit={() => {
          setFitViewOnLoad(false);
          setTimeout(() => fitView({ 
            padding: 0.2,
            includeHiddenNodes: false,
            duration: 1000
          }), 100);
        }}
        nodesDraggable={true}
        nodesConnectable={false}
        edgesUpdatable={false}
        elementsSelectable={false}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { 
            stroke: '#64748b',
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#64748b',
          },
        }}
        proOptions={{ 
          hideAttribution: true,
        }}
        edgeTypes={{}}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{
          stroke: '#64748b',
          strokeWidth: 2,
        }}
      >
        <Background />
        <Controls />
        <Panel position="bottom-center" className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => fitView({ padding: 0.2 })}>
            <span className="mr-1">Fit View</span>
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
};

// Outer component that provides the ReactFlow context
const HealthcareFlowchart = () => {
  return (
    <ReactFlowProvider>
      <FlowchartContent />
    </ReactFlowProvider>
  );
};

export default HealthcareFlowchart;
