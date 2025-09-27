'use client';

import { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  Node,
  NodeTypes,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

// Define the shape of our card data
type CardData = {
  id: string;
  title: string;
  description: string;
  x: number;
  y: number;
};

// Custom node component for our cards
const CardNode = ({ data }: { data: CardData }) => {
  return (
    <Card className="w-64 shadow-lg">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg font-medium">{data.title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">{data.description}</p>
      </CardContent>
    </Card>
  );
};

// Define node types
const nodeTypes: NodeTypes = {
  card: CardNode,
};

type FlowchartCanvasProps = {
  initialCards?: CardData[];
  onNodesChange?: (nodes: Node[]) => void;
  onEdgesChange?: (edges: Edge[]) => void;
};

export function FlowchartCanvas({
  initialCards = [],
  onNodesChange,
  onEdgesChange,
}: FlowchartCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChangeHandler] = useNodesState(
    initialCards.map((card) => ({
      id: card.id,
      type: 'card',
      position: { x: card.x, y: card.y },
      data: card,
    }))
  );
  const [edges, setEdges, onEdgesChangeHandler] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const { screenToFlowPosition } = useReactFlow();

  // Handle node drag stop
  const onNodeDragStop = useCallback((event: any, node: Node) => {
    // Update the node position in the parent component if needed
    if (onNodesChange) {
      onNodesChange(nodes.map((n) => (n.id === node.id ? node : n)));
    }
  }, [nodes, onNodesChange]);

  // Handle edge updates
  const onConnect = useCallback(
    (params: any) => {
      setEdges((eds) => addEdge(params, eds));
      if (onEdgesChange) {
        onEdgesChange([...edges, params]);
      }
    },
    [edges, onEdgesChange, setEdges]
  );

  // Handle drag over event for dropping nodes
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle drop event to add new nodes
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');

      // Check if the dropped element is a card
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode = {
        id: `node-${Date.now()}`,
        type: 'card',
        position,
        data: {
          id: `node-${Date.now()}`,
          title: 'New Card',
          description: 'Drag to connect',
          ...position,
        },
      };

      setNodes((nds) => [...nds, newNode]);
      if (onNodesChange) {
        onNodesChange([...nodes, newNode]);
      }
    },
    [reactFlowInstance, nodes, onNodesChange, setNodes]
  );

  return (
    <div className="h-full w-full" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChangeHandler}
        onEdgesChange={onEdgesChangeHandler}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
}

// Card component that can be dragged onto the canvas
export function DraggableCard({ title, description }: { title: string; description: string }) {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="p-2 border rounded-lg bg-card text-card-foreground shadow-sm cursor-move hover:bg-accent"
      draggable
      onDragStart={(event) => onDragStart(event, 'card')}
    >
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

// Component that contains the toolbar and the canvas
export function FlowchartEditor() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Example card templates
  const cardTemplates = [
    { id: 'start', title: 'Start', description: 'Start of the flow' },
    { id: 'process', title: 'Process', description: 'A processing step' },
    { id: 'decision', title: 'Decision', description: 'Make a decision' },
    { id: 'end', title: 'End', description: 'End of the flow' },
  ];

  return (
    <ReactFlowProvider>
      <div className="flex h-[600px] w-full">
        {/* Sidebar with draggable cards */}
        <div className="w-64 p-4 space-y-4 border-r">
          <h3 className="text-lg font-semibold">Components</h3>
          <div className="space-y-2">
            {cardTemplates.map((card) => (
              <DraggableCard key={card.id} title={card.title} description={card.description} />
            ))}
          </div>
          <Button className="w-full" variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Step
          </Button>
        </div>

        {/* Main canvas area */}
        <div className="flex-1">
          <FlowchartCanvas
            initialCards={cards}
            onNodesChange={(nodes) => setCards(nodes.map((node) => node.data))}
            onEdgesChange={setEdges}
          />
        </div>
      </div>
    </ReactFlowProvider>
  );
}
