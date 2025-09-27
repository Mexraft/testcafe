"use client";

import { useState, useEffect } from "react";
import type { FlowchartData, FlowchartNode } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

type NodeWithPosition = FlowchartNode & {
  x: number;
  y: number;
  width: number;
  height: number;
};

type EdgeWithPoints = {
  source: string;
  target: string;
  points: { x1: number; y1: number; x2: number; y2: number };
};

const NODE_WIDTH = 280;
const NODE_HEIGHT = 120;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 40;

export function Flowchart({ data }: { data: FlowchartData }) {
  const [layout, setLayout] = useState<{
    nodes: NodeWithPosition[];
    edges: EdgeWithPoints[];
  } | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!data || !data.nodes) return;

    const numCols = isMobile ? 1 : Math.min(2, data.nodes.length);

    const positionedNodes = data.nodes.map((node, i) => {
      const col = i % numCols;
      const row = Math.floor(i / numCols);
      return {
        ...node,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        x: col * (NODE_WIDTH + HORIZONTAL_GAP),
        y: row * (NODE_HEIGHT + VERTICAL_GAP),
      };
    });

    const nodeMap = new Map(positionedNodes.map((n) => [n.id, n]));

    const calculatedEdges: EdgeWithPoints[] = data.edges
      .map((edge) => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);

        if (!sourceNode || !targetNode) return null;

        const x1 = sourceNode.x + sourceNode.width;
        const y1 = sourceNode.y + sourceNode.height / 2;
        const x2 = targetNode.x;
        const y2 = targetNode.y + targetNode.height / 2;

        return { ...edge, points: { x1, y1, x2, y2 } } as EdgeWithPoints;
      })
      .filter((e): e is EdgeWithPoints => e !== null);

    setLayout({ nodes: positionedNodes, edges: calculatedEdges });
  }, [data, isMobile]);

  if (!layout) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Generating flowchart...
      </div>
    );
  }

  const containerWidth = isMobile
    ? NODE_WIDTH
    : 2 * NODE_WIDTH + HORIZONTAL_GAP;
  const containerHeight =
    Math.ceil(layout.nodes.length / (isMobile ? 1 : 2)) *
      (NODE_HEIGHT + VERTICAL_GAP) -
    VERTICAL_GAP;

  return (
    <ScrollArea className="w-full h-[400px] border rounded-lg bg-background p-4">
      <div
        className="relative"
        style={{ width: containerWidth, height: containerHeight }}
      >
        {layout.nodes.map((node) => (
          <Card
            key={node.id}
            className="absolute shadow-md hover:shadow-xl transition-shadow duration-300"
            style={{
              left: node.x,
              top: node.y,
              width: node.width,
              height: node.height,
            }}
          >
            <CardHeader className="p-3">
              <CardTitle className="text-sm font-bold truncate">
                {node.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-3">
                {node.description}
              </p>
            </CardContent>
          </Card>
        ))}

        <svg
          className="absolute inset-0 pointer-events-none"
          width={containerWidth}
          height={containerHeight}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
            </marker>
          </defs>
          {layout.edges.map((edge, i) => (
            <path
              key={`${edge.source}-${edge.target}-${i}`}
              d={`M ${edge.points.x1} ${edge.points.y1} C ${
                edge.points.x1 + HORIZONTAL_GAP / 2
              } ${edge.points.y1}, ${edge.points.x2 - HORIZONTAL_GAP / 2} ${
                edge.points.y2
              }, ${edge.points.x2} ${edge.points.y2}`}
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          ))}
        </svg>
      </div>
    </ScrollArea>
  );
}
